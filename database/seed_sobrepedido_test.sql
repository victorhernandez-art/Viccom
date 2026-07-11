-- ═══════════════════════════════════════════════════════════════════════════
-- VICCOM — Producto de prueba "Solo sobre pedido" (existencia_total = 0)
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  id_dell   UUID;
  id_cat_laptops UUID;
BEGIN
  SELECT id INTO id_dell       FROM brands     WHERE slug = 'dell';
  SELECT id INTO id_cat_laptops FROM categories WHERE slug = 'laptops';

  INSERT INTO products (
    sku_ct, nombre, slug, descripcion,
    marca_id, categoria_id, subcategoria,
    costo_ct, precio_publico, margen_aplicado, margen_override,
    existencia_total, activo, destacado, en_oferta, descontinuado,
    peso_kg, imagen_principal, especificaciones
  ) VALUES (
    'DELL-XPS-15-9530-TEST',
    'Dell XPS 15 Intel Core i9 32GB RAM 1TB SSD OLED',
    'dell-xps-15-intel-core-i9-32gb-ram-1tb-ssd-oled-dell-xps-15-9530-test',
    'Laptop premium Dell XPS 15 con pantalla OLED 3.5K, Intel Core i9-13900H, 32 GB RAM y 1 TB SSD PCIe Gen 4. Disponible únicamente bajo pedido. Tiempo de entrega estimado 7-10 días hábiles.',
    id_dell, id_cat_laptops, 'Laptops Premium',
    38461.54, ROUND(38461.54 * 1.30, 2), 30, NULL,
    0, TRUE, FALSE, FALSE, FALSE,
    1.86,
    'https://www.ctonline.mx/images/products/dell-xps-15.jpg',
    '{"procesador": "Intel Core i9-13900H", "ram": "32 GB DDR5", "almacenamiento": "1 TB SSD PCIe Gen 4", "pantalla": "15.6 pulgadas OLED 3.5K 60Hz", "gpu": "NVIDIA GeForce RTX 4060 8GB", "sistema_operativo": "Windows 11 Pro"}'::jsonb
  )
  ON CONFLICT (sku_ct) DO UPDATE
    SET existencia_total = 0,
        activo           = TRUE,
        descontinuado    = FALSE,
        fecha_actualizacion = NOW();
END $$;
