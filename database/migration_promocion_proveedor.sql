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
  v_rec            RECORD;
  v_margen_global  NUMERIC;
  v_nuevo_precio   NUMERIC;
  v_nuevo_precio_antes NUMERIC;
  v_nuevo_margen   NUMERIC;
  v_costo_aplicado NUMERIC;
  v_en_oferta      BOOLEAN;
BEGIN
  -- Margen global
  SELECT value::NUMERIC INTO v_margen_global
  FROM settings WHERE key = 'margen_global';

  FOR v_rec IN
    SELECT
      p.id,
      p.nombre,
      p.sku_ct,
      p.costo_ct,
      p.costo_promocion,
      p.fecha_fin_oferta,
      p.precio_publico  AS precio_anterior,
      p.precio_antes    AS precio_antes_anterior,
      p.margen_aplicado AS margen_anterior,
      p.en_oferta       AS en_oferta_anterior,
      p.margen_override,
      c.margen_override AS margen_cat
    FROM products p
    LEFT JOIN categories c ON p.categoria_id = c.id
    WHERE (p_categoria_id IS NULL OR p.categoria_id = p_categoria_id)
      AND p.activo = TRUE
  LOOP
    v_nuevo_margen := COALESCE(v_rec.margen_override, v_rec.margen_cat, v_margen_global, 30);
    
    -- Determinar si la oferta está vigente
    IF v_rec.costo_promocion IS NOT NULL AND (v_rec.fecha_fin_oferta IS NULL OR v_rec.fecha_fin_oferta > NOW()) THEN
      v_costo_aplicado := v_rec.costo_promocion;
      v_en_oferta      := TRUE;
      v_nuevo_precio_antes := ROUND((v_rec.costo_ct * 1.16) * (1 + v_nuevo_margen / 100), 2);
    ELSE
      v_costo_aplicado := v_rec.costo_ct;
      v_en_oferta      := FALSE;
      v_nuevo_precio_antes := NULL;
    END IF;

    v_nuevo_precio := ROUND((v_costo_aplicado * 1.16) * (1 + v_nuevo_margen / 100), 2);

    -- Solo actualizar si hay algún cambio real
    IF v_nuevo_precio <> v_rec.precio_anterior 
       OR COALESCE(v_nuevo_precio_antes, 0) <> COALESCE(v_rec.precio_antes_anterior, 0)
       OR v_nuevo_margen <> v_rec.margen_anterior 
       OR v_en_oferta <> v_rec.en_oferta_anterior THEN
       
      UPDATE products
      SET precio_publico = v_nuevo_precio,
          precio_antes = v_nuevo_precio_antes,
          en_oferta = v_en_oferta,
          margen_aplicado = v_nuevo_margen,
          updated_at = NOW()
      WHERE id = v_rec.id;

      -- Registrar en historial (ajustando costo_anterior para obtener el neto sin IVA)
      INSERT INTO price_history (
        product_id, producto_nombre, sku_ct,
        costo_anterior, margen_anterior, precio_anterior,
        costo_nuevo,    margen_nuevo,    precio_nuevo,
        motivo, usuario
      )
      VALUES (
        v_rec.id, v_rec.nombre, v_rec.sku_ct,
        v_rec.precio_anterior / 1.16 / NULLIF((1 + v_rec.margen_anterior / 100), 0),
        v_rec.margen_anterior, v_rec.precio_anterior,
        v_costo_aplicado, v_nuevo_margen, v_nuevo_precio,
        p_motivo, p_usuario
      );

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
