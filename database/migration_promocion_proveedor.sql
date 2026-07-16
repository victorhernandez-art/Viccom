-- ═══════════════════════════════════════════════════════════════════════════
-- VICCOM — Habilitar lógica de promociones por costo del proveedor CT
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Agregar columna costo_promocion a la tabla products si no existe
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS costo_promocion NUMERIC(12,2);

-- 2. Modificar la función calcular_precio_publico
CREATE OR REPLACE FUNCTION calcular_precio_publico(
  p_product_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  v_costo          NUMERIC;
  v_costo_normal   NUMERIC;
  v_costo_promo    NUMERIC;
  v_fecha_fin      TIMESTAMPTZ;
  v_margen         NUMERIC;
  v_margen_global  NUMERIC;
  v_margen_cat     NUMERIC;
  v_margen_prod    NUMERIC;
BEGIN
  -- Obtener costos y vigencia del producto
  SELECT costo_ct, costo_promocion, fecha_fin_oferta, margen_override
  INTO   v_costo_normal, v_costo_promo, v_fecha_fin, v_margen_prod
  FROM   products
  WHERE  id = p_product_id;

  -- Obtener margen de la categoría del producto
  SELECT c.margen_override
  INTO   v_margen_cat
  FROM   products p
  JOIN   categories c ON p.categoria_id = c.id
  WHERE  p.id = p_product_id;

  -- Obtener margen global del sistema
  SELECT value::NUMERIC INTO v_margen_global
  FROM   settings WHERE key = 'margen_global';

  -- Aplicar prioridad: producto > categoría > global
  v_margen := COALESCE(v_margen_prod, v_margen_cat, v_margen_global, 30);

  -- Determinar costo a usar: promoción si está vigente
  IF v_costo_promo IS NOT NULL AND (v_fecha_fin IS NULL OR v_fecha_fin > NOW()) THEN
    v_costo := v_costo_promo;
  ELSE
    v_costo := v_costo_normal;
  END IF;

  -- Fórmula que incluye el 16% de IVA sobre el costo antes del margen
  RETURN ROUND((v_costo * 1.16) * (1 + v_margen / 100), 2);
END;
$$ LANGUAGE plpgsql;

-- 3. Modificar la función recalcular_precios_masivo
CREATE OR REPLACE FUNCTION recalcular_precios_masivo(
  p_categoria_id UUID DEFAULT NULL,
  p_usuario      TEXT DEFAULT 'sistema',
  p_motivo       TEXT DEFAULT 'recalculo_masivo'
) RETURNS INTEGER AS $$
DECLARE
  v_count          INTEGER := 0;
  v_margen_global  NUMERIC;
BEGIN
  -- Margen global
  SELECT value::NUMERIC INTO v_margen_global
  FROM settings WHERE key = 'margen_global';

  -- Si es la sincronización automática de CT, hacemos una actualización directa sin historial
  -- Esto evita timeouts causados por miles de inserciones secuenciales en price_history en Supabase Free.
  IF p_motivo = 'sync_ct' OR p_motivo = 'sync_ct_test' THEN
    UPDATE products p
    SET 
      precio_publico = ROUND(
        (CASE 
          WHEN p.costo_promocion IS NOT NULL AND (p.fecha_fin_oferta IS NULL OR p.fecha_fin_oferta > NOW()) THEN p.costo_promocion
          ELSE p.costo_ct
         END * 1.16) * (1 + COALESCE(
           p.margen_override, 
           (SELECT margen_override FROM categories WHERE id = p.categoria_id), 
           v_margen_global, 
           30
         ) / 100), 
        2
      ),
      precio_antes = CASE 
        WHEN p.costo_promocion IS NOT NULL AND (p.fecha_fin_oferta IS NULL OR p.fecha_fin_oferta > NOW()) THEN 
          ROUND((p.costo_ct * 1.16) * (1 + COALESCE(
            p.margen_override, 
            (SELECT margen_override FROM categories WHERE id = p.categoria_id), 
            v_margen_global, 
            30
          ) / 100), 2)
        ELSE NULL
      END,
      en_oferta = (p.costo_promocion IS NOT NULL AND (p.fecha_fin_oferta IS NULL OR p.fecha_fin_oferta > NOW())),
      margen_aplicado = COALESCE(
        p.margen_override, 
        (SELECT margen_override FROM categories WHERE id = p.categoria_id), 
        v_margen_global, 
        30
      ),
      updated_at = NOW()
    WHERE (p_categoria_id IS NULL OR p.categoria_id = p_categoria_id)
      AND p.activo = TRUE;

    GET DIAGNOSTICS v_count = ROW_COUNT;
  ELSE
    -- Para cambios manuales del administrador, sí guardamos la auditoría en price_history
    WITH updated_rows AS (
      UPDATE products p
      SET 
        precio_publico = ROUND(
          (CASE 
            WHEN p.costo_promocion IS NOT NULL AND (p.fecha_fin_oferta IS NULL OR p.fecha_fin_oferta > NOW()) THEN p.costo_promocion
            ELSE p.costo_ct
           END * 1.16) * (1 + COALESCE(
             p.margen_override, 
             (SELECT margen_override FROM categories WHERE id = p.categoria_id), 
             v_margen_global, 
             30
           ) / 100), 
          2
        ),
        precio_antes = CASE 
          WHEN p.costo_promocion IS NOT NULL AND (p.fecha_fin_oferta IS NULL OR p.fecha_fin_oferta > NOW()) THEN 
            ROUND((p.costo_ct * 1.16) * (1 + COALESCE(
              p.margen_override, 
              (SELECT margen_override FROM categories WHERE id = p.categoria_id), 
              v_margen_global, 
              30
            ) / 100), 2)
          ELSE NULL
        END,
        en_oferta = (p.costo_promocion IS NOT NULL AND (p.fecha_fin_oferta IS NULL OR p.fecha_fin_oferta > NOW())),
        margen_aplicado = COALESCE(
          p.margen_override, 
          (SELECT margen_override FROM categories WHERE id = p.categoria_id), 
          v_margen_global, 
          30
        ),
        updated_at = NOW()
      FROM (
        SELECT 
          id,
          precio_publico AS precio_anterior,
          precio_antes AS precio_antes_anterior,
          margen_aplicado AS margen_anterior,
          en_oferta AS en_oferta_anterior
        FROM products
      ) old
      WHERE p.id = old.id
        AND (p_categoria_id IS NULL OR p.categoria_id = p_categoria_id)
        AND p.activo = TRUE
        AND (
          ROUND(
            (CASE 
              WHEN p.costo_promocion IS NOT NULL AND (p.fecha_fin_oferta IS NULL OR p.fecha_fin_oferta > NOW()) THEN p.costo_promocion
              ELSE p.costo_ct
             END * 1.16) * (1 + COALESCE(
               p.margen_override, 
               (SELECT margen_override FROM categories WHERE id = p.categoria_id), 
               v_margen_global, 
               30
             ) / 100), 
            2
          ) <> old.precio_anterior
          OR COALESCE(
            CASE 
              WHEN p.costo_promocion IS NOT NULL AND (p.fecha_fin_oferta IS NULL OR p.fecha_fin_oferta > NOW()) THEN 
                ROUND((p.costo_ct * 1.16) * (1 + COALESCE(
                  p.margen_override, 
                  (SELECT margen_override FROM categories WHERE id = p.categoria_id), 
                  v_margen_global, 
                  30
                ) / 100), 2)
              ELSE NULL
            END, 
            0
          ) <> COALESCE(old.precio_antes_anterior, 0)
          OR COALESCE(
            p.margen_override, 
            (SELECT margen_override FROM categories WHERE id = p.categoria_id), 
            v_margen_global, 
            30
          ) <> old.margen_anterior
          OR (p.costo_promocion IS NOT NULL AND (p.fecha_fin_oferta IS NULL OR p.fecha_fin_oferta > NOW())) <> old.en_oferta_anterior
        )
      RETURNING 
        p.id, 
        p.nombre, 
        p.sku_ct,
        old.precio_anterior,
        old.margen_anterior,
        p.costo_ct,
        p.costo_promocion,
        p.fecha_fin_oferta,
        p.margen_aplicado AS margen_nuevo,
        p.precio_publico AS precio_nuevo
    )
    INSERT INTO price_history (
      product_id, producto_nombre, sku_ct,
      costo_anterior, margen_anterior, precio_anterior,
      costo_nuevo,    margen_nuevo,    precio_nuevo,
      motivo, usuario
    )
    SELECT 
      u.id, u.nombre, u.sku_ct,
      u.precio_anterior / 1.16 / NULLIF((1 + u.margen_anterior / 100), 0),
      u.margen_anterior, u.precio_anterior,
      CASE 
        WHEN u.costo_promocion IS NOT NULL AND (u.fecha_fin_oferta IS NULL OR u.fecha_fin_oferta > NOW()) THEN u.costo_promocion
        ELSE u.costo_ct
      END, 
      u.margen_nuevo, u.precio_nuevo,
      p_motivo, p_usuario
    FROM updated_rows u;

    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
