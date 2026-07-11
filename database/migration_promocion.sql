-- ═══════════════════════════════════════════════════════════════════════════
-- VICCOM — Agregar columnas de promoción a la tabla products
-- Ejecutar UNA SOLA VEZ en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Agregar columnas nuevas (idempotente con IF NOT EXISTS)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS precio_antes     NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS fecha_fin_oferta TIMESTAMPTZ;

-- 2. Actualizar la vista para exponer los nuevos campos
-- DROP primero porque PostgreSQL no permite reordenar columnas con CREATE OR REPLACE
DROP VIEW IF EXISTS v_products_catalog;
CREATE VIEW v_products_catalog AS
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

-- 3. Marcar productos en oferta de prueba (los que ya tienen en_oferta = true)
--    Precio anterior = precio_publico * 1.36 (simula ~26% de descuento)
--    Fecha fin = último día del mes actual
UPDATE products
SET
  precio_antes     = ROUND(precio_publico * 1.36, 2),
  fecha_fin_oferta = DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day' + INTERVAL '23 hours 59 minutes 59 seconds'
WHERE en_oferta = TRUE
  AND precio_antes IS NULL;

-- 4. Verificación
SELECT sku_ct, nombre, precio_publico, precio_antes, fecha_fin_oferta, en_oferta
FROM products
WHERE en_oferta = TRUE
ORDER BY nombre;
