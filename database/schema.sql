-- ═══════════════════════════════════════════════════════════════════════════
-- VICCOM ECOMMERCE — SCHEMA SUPABASE POSTGRESQL
-- Versión 1.1 — Soportando costo antes de IVA + márgenes jerárquicos
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── EXTENSIONES ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- búsqueda por texto similar
CREATE EXTENSION IF NOT EXISTS "unaccent";          -- búsqueda sin acentos

-- ─── FUNCIÓN UTILIDAD: updated_at automático ─────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLA: settings  (configuración global del sistema)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key             TEXT UNIQUE NOT NULL,
  value           TEXT NOT NULL,
  description     TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Valores iniciales obligatorios
INSERT INTO settings (key, value, description) VALUES
  ('margen_global',        '30',                                    'Margen de ganancia global en porcentaje (%)'),
  ('whatsapp_number',      '521XXXXXXXXXX',                         'Número de WhatsApp para cotizaciones'),
  ('whatsapp_message',     'Hola, me interesa cotizar el producto:', 'Mensaje predeterminado de WhatsApp'),
  ('empresa_nombre',       'VICCOM',                                 'Nombre de la empresa'),
  ('empresa_correo',       'vic_computo@hotmail.com',                'Correo de contacto'),
  ('empresa_telefono',     '961 120 93 61',                          'Teléfono de contacto'),
  ('sync_activo',          'true',                                   'Sincronización automática activada'),
  ('sync_intervalo_min',   '15',                                     'Intervalo de sincronización en minutos'),
  ('productos_por_pagina', '24',                                     'Productos mostrados por página en catálogo')
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLA: brands  (marcas de productos)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS brands (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  logo_url    TEXT,
  descripcion TEXT,
  activo      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug   ON brands (slug);
CREATE INDEX IF NOT EXISTS idx_brands_activo ON brands (activo);

CREATE TRIGGER trg_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLA: categories  (categorías de productos)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre          TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  descripcion     TEXT,
  imagen_url      TEXT,
  margen_override NUMERIC(5,2),          -- NULL = usar margen global
  orden           INTEGER DEFAULT 0,
  activo          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug   ON categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_activo ON categories (activo);
CREATE INDEX IF NOT EXISTS idx_categories_orden  ON categories (orden);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLA: products  (catálogo principal de productos)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS products (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku_ct                TEXT UNIQUE NOT NULL,           -- SKU de CT Internacional
  nombre                TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  descripcion           TEXT,
  marca_id              UUID REFERENCES brands(id) ON DELETE SET NULL,
  categoria_id          UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategoria          TEXT,
  -- Precios y márgenes
  costo_ct              NUMERIC(12,2) NOT NULL DEFAULT 0,
  margen_override       NUMERIC(5,2),                  -- NULL = hereda categoría o global
  precio_publico        NUMERIC(12,2) NOT NULL DEFAULT 0,
  precio_antes          NUMERIC(12,2),                 -- precio original antes de promoción
  margen_aplicado       NUMERIC(5,2) NOT NULL DEFAULT 30, -- margen real usado al calcular
  -- Inventario
  existencia_total      INTEGER NOT NULL DEFAULT 0,
  -- Imágenes
  imagen_principal      TEXT,
  imagenes_adicionales  TEXT[],                         -- array de URLs
  -- Estado
  activo                BOOLEAN DEFAULT TRUE,
  destacado             BOOLEAN DEFAULT FALSE,
  en_oferta             BOOLEAN DEFAULT FALSE,
  fecha_fin_oferta      TIMESTAMPTZ,                   -- fecha límite de la promoción
  descontinuado         BOOLEAN DEFAULT FALSE,
  -- Metadatos
  peso_kg               NUMERIC(8,3),
  dimensiones           JSONB,                          -- {largo, ancho, alto}
  especificaciones      JSONB,                          -- specs técnicas del CT
  -- Timestamps
  fecha_actualizacion   TIMESTAMPTZ DEFAULT NOW(),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda y filtrado eficiente (50k+ productos)
CREATE INDEX IF NOT EXISTS idx_products_sku_ct         ON products (sku_ct);
CREATE INDEX IF NOT EXISTS idx_products_slug           ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_marca_id       ON products (marca_id);
CREATE INDEX IF NOT EXISTS idx_products_categoria_id   ON products (categoria_id);
CREATE INDEX IF NOT EXISTS idx_products_activo         ON products (activo);
CREATE INDEX IF NOT EXISTS idx_products_destacado      ON products (destacado);
CREATE INDEX IF NOT EXISTS idx_products_en_oferta      ON products (en_oferta);
CREATE INDEX IF NOT EXISTS idx_products_precio_publico ON products (precio_publico);
CREATE INDEX IF NOT EXISTS idx_products_existencia     ON products (existencia_total);
CREATE INDEX IF NOT EXISTS idx_products_fecha_act      ON products (fecha_actualizacion DESC);
-- Índice de texto completo para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_products_fts ON products
  USING GIN (to_tsvector('spanish', nombre || ' ' || COALESCE(descripcion, '') || ' ' || sku_ct));
-- Índice trigrama para autocompletado
CREATE INDEX IF NOT EXISTS idx_products_trgm ON products
  USING GIN (nombre gin_trgm_ops);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLA: inventory  (existencias por almacén CT)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS inventory (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  almacen     TEXT NOT NULL,              -- clave del almacén CT
  almacen_nombre TEXT,                    -- nombre legible
  existencia  INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_product_almacen ON inventory (product_id, almacen);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory (product_id);

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLA: price_history  (auditoría de cambios de precio)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS price_history (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  producto_nombre  TEXT NOT NULL,
  sku_ct           TEXT NOT NULL,
  -- Valores anteriores
  costo_anterior   NUMERIC(12,2),
  margen_anterior  NUMERIC(5,2),
  precio_anterior  NUMERIC(12,2),
  -- Valores nuevos
  costo_nuevo      NUMERIC(12,2),
  margen_nuevo     NUMERIC(5,2),
  precio_nuevo     NUMERIC(12,2),
  -- Contexto
  motivo           TEXT,                  -- 'sync_ct', 'margen_global', 'margen_categoria', 'margen_producto', 'manual'
  usuario          TEXT DEFAULT 'sistema',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history (product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON price_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_motivo     ON price_history (motivo);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLA: sync_logs  (registro de sincronizaciones CT Connect)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sync_logs (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proceso              TEXT NOT NULL,         -- 'catalogo_completo', 'precios', 'inventario'
  estado               TEXT NOT NULL,         -- 'iniciado', 'completado', 'error', 'parcial'
  -- Estadísticas
  productos_procesados INTEGER DEFAULT 0,
  productos_nuevos     INTEGER DEFAULT 0,
  productos_actualizados INTEGER DEFAULT 0,
  productos_descontinuados INTEGER DEFAULT 0,
  precios_actualizados INTEGER DEFAULT 0,
  -- Detalles
  mensaje              TEXT,
  error_detalle        TEXT,
  duracion_segundos    NUMERIC(10,2),
  archivo_ftp          TEXT,
  -- Timestamps
  inicio               TIMESTAMPTZ DEFAULT NOW(),
  fin                  TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_estado     ON sync_logs (estado);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_proceso    ON sync_logs (proceso);

-- ═══════════════════════════════════════════════════════════════════════════
-- VISTA: v_products_catalog  (productos listos para mostrar en el catálogo)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW v_products_catalog AS
SELECT
  p.id,
  p.sku_ct,
  p.nombre,
  p.slug,
  p.descripcion,
  p.subcategoria,
  p.costo_ct,
  p.precio_publico,
  p.precio_antes,
  p.margen_aplicado,
  p.existencia_total,
  COALESCE(tgz.existencia, 0) AS existencia_tuxtla,
  p.imagen_principal,
  p.activo,
  p.destacado,
  p.en_oferta,
  p.fecha_fin_oferta,
  p.fecha_actualizacion,
  b.id        AS marca_id,
  b.nombre    AS marca_nombre,
  b.slug      AS marca_slug,
  b.logo_url  AS marca_logo,
  c.id        AS categoria_id,
  c.nombre    AS categoria_nombre,
  c.slug      AS categoria_slug
FROM products p
LEFT JOIN brands     b ON p.marca_id     = b.id
LEFT JOIN categories c ON p.categoria_id = c.id
LEFT JOIN inventory  tgz ON tgz.product_id = p.id AND tgz.almacen = 'TGZ'
WHERE p.activo = TRUE AND p.descontinuado = FALSE;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCIÓN: calcular_precio_publico
-- Aplica la prioridad: margen producto > margen categoría > margen global
-- Incluye el 16% de IVA sobre el costo antes de aplicar el margen.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION calcular_precio_publico(
  p_product_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  v_costo          NUMERIC;
  v_margen         NUMERIC;
  v_margen_global  NUMERIC;
  v_margen_cat     NUMERIC;
  v_margen_prod    NUMERIC;
BEGIN
  -- Obtener costo y margen del producto
  SELECT costo_ct, margen_override
  INTO   v_costo, v_margen_prod
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

  -- Nueva fórmula: Costo con IVA (costo * 1.16) y luego aplicar el margen
  RETURN ROUND((v_costo * 1.16) * (1 + v_margen / 100), 2);
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCIÓN: recalcular_precios_masivo
-- Recalcula precio_publico para todos los productos (o por categoría)
-- Incluye el 16% de IVA sobre el costo antes de aplicar el margen.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION recalcular_precios_masivo(
  p_categoria_id UUID DEFAULT NULL,
  p_usuario      TEXT DEFAULT 'sistema',
  p_motivo       TEXT DEFAULT 'recalculo_masivo'
) RETURNS INTEGER AS $$
DECLARE
  v_count        INTEGER := 0;
  v_rec          RECORD;
  v_margen_global NUMERIC;
  v_nuevo_precio  NUMERIC;
  v_nuevo_margen  NUMERIC;
  v_margen_cat    NUMERIC;
BEGIN
  -- Margen global
  SELECT value::NUMERIC INTO v_margen_global
  FROM settings WHERE key = 'margen_global';

  FOR v_rec IN
    SELECT
      p.id,
      p.costo_ct,
      p.precio_publico  AS precio_anterior,
      p.margen_aplicado AS margen_anterior,
      p.margen_override,
      c.margen_override AS margen_cat
    FROM products p
    LEFT JOIN categories c ON p.categoria_id = c.id
    WHERE (p_categoria_id IS NULL OR p.categoria_id = p_categoria_id)
      AND p.activo = TRUE
  LOOP
    v_nuevo_margen := COALESCE(v_rec.margen_override, v_rec.margen_cat, v_margen_global, 30);
    
    -- Fórmula que incluye el 16% de IVA sobre el costo antes del margen
    v_nuevo_precio := ROUND((v_rec.costo_ct * 1.16) * (1 + v_nuevo_margen / 100), 2);

    -- Solo actualizar si hay cambio real
    IF v_nuevo_precio <> v_rec.precio_anterior OR v_nuevo_margen <> v_rec.margen_anterior THEN
      UPDATE products
      SET precio_publico = v_nuevo_precio,
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
      SELECT
        p.id, p.nombre, p.sku_ct,
        v_rec.precio_anterior / 1.16 / NULLIF((1 + v_rec.margen_anterior / 100), 0),
        v_rec.margen_anterior, v_rec.precio_anterior,
        p.costo_ct, v_nuevo_margen, v_nuevo_precio,
        p_motivo, p_usuario
      FROM products p WHERE p.id = v_rec.id;

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCIÓN: buscar_productos (búsqueda full-text + trigrama)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION buscar_productos(
  p_query     TEXT,
  p_limit     INTEGER DEFAULT 24,
  p_offset    INTEGER DEFAULT 0
) RETURNS TABLE (
  id              UUID,
  nombre          TEXT,
  slug            TEXT,
  precio_publico  NUMERIC,
  imagen_principal TEXT,
  marca_nombre    TEXT,
  categoria_nombre TEXT,
  existencia_total INTEGER,
  rank            REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.nombre,
    p.slug,
    p.precio_publico,
    p.imagen_principal,
    b.nombre AS marca_nombre,
    c.nombre AS categoria_nombre,
    p.existencia_total,
    ts_rank(
      to_tsvector('spanish', p.nombre || ' ' || COALESCE(p.descripcion,'') || ' ' || p.sku_ct),
      plainto_tsquery('spanish', p_query)
    ) AS rank
  FROM products p
  LEFT JOIN brands     b ON p.marca_id     = b.id
  LEFT JOIN categories c ON p.categoria_id = c.id
  WHERE p.activo = TRUE
    AND p.descontinuado = FALSE
    AND (
      to_tsvector('spanish', p.nombre || ' ' || COALESCE(p.descripcion,'') || ' ' || p.sku_ct)
        @@ plainto_tsquery('spanish', p_query)
      OR p.nombre    % p_query
      OR p.sku_ct    ILIKE '%' || p_query || '%'
    )
  ORDER BY rank DESC, p.existencia_total DESC
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

-- Habilitar RLS en todas las tablas
ALTER TABLE settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs     ENABLE ROW LEVEL SECURITY;

-- ─── Lectura pública (catálogo) ──────────────────────────────────────────
CREATE POLICY "public_read_brands"      ON brands      FOR SELECT USING (activo = TRUE);
CREATE POLICY "public_read_categories"  ON categories  FOR SELECT USING (activo = TRUE);
CREATE POLICY "public_read_products"    ON products    FOR SELECT USING (activo = TRUE AND descontinuado = FALSE);
CREATE POLICY "public_read_inventory"   ON inventory   FOR SELECT USING (TRUE);
CREATE POLICY "public_read_settings"    ON settings    FOR SELECT USING (TRUE);

-- ─── Escritura solo para service role (VPS backend y admin) ─────────────
-- El service role bypasa RLS automáticamente en Supabase
-- Las siguientes políticas son para usuarios autenticados con rol 'admin'

CREATE POLICY "admin_all_brands"      ON brands      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_categories"  ON categories  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_products"    ON products    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_inventory"   ON inventory   FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_settings"    ON settings    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_price_hist"  ON price_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_sync_logs"   ON sync_logs   FOR ALL USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════════════
-- DATOS SEMILLA: categorías iniciales basadas en CT Internacional
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO categories (nombre, slug, margen_override, orden) VALUES
  ('Laptops',           'laptops',           25, 1),
  ('Computadoras de Escritorio', 'computadoras-escritorio', 25, 2),
  ('Impresoras',        'impresoras',         30, 3),
  ('Consumibles',       'consumibles',        35, 4),
  ('Accesorios',        'accesorios',         40, 5),
  ('Componentes',       'componentes',        30, 6),
  ('Monitores',         'monitores',          28, 7),
  ('Redes y Conectividad', 'redes',           30, 8),
  ('Almacenamiento',    'almacenamiento',     30, 9),
  ('Tablets',           'tablets',            28, 10),
  ('Software',          'software',           20, 11),
  ('Servidores',        'servidores',         22, 12),
  ('Gaming',            'gaming',             30, 13),
  ('Smart Home',        'smart-home',         35, 14)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DEL SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════
