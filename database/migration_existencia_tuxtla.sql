-- VICCOM - Agrega existencia de Tuxtla a la vista publica del catalogo
-- Ejecutar en Supabase SQL Editor despues de tener creadas products, brands,
-- categories e inventory.

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
