-- ═══════════════════════════════════════════════════════════════════════════
-- VICCOM ECOMMERCE — DATOS DE PRUEBA (SEED)
-- 10 marcas | 10 categorías | 30 productos | inventario
-- Margen aplicado: 30% en todos los productos
-- Precio público = costo_ct * 1.30
-- Idempotente: usa ON CONFLICT DO NOTHING / DO UPDATE
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ───────────────────────────────────────────────────────────────────────────
-- 0. ASEGURAR MARGEN GLOBAL = 30%
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO settings (key, value, description)
VALUES ('margen_global', '30', 'Margen de ganancia global en porcentaje (%)')
ON CONFLICT (key) DO UPDATE SET value = '30';


-- ───────────────────────────────────────────────────────────────────────────
-- 1. MARCAS (10)
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO brands (nombre, slug, logo_url, descripcion, activo) VALUES
  ('HP',      'hp',      'https://www.ctonline.mx/images/marcas/hp.png',      'Hewlett-Packard — computadoras, impresoras y accesorios',           TRUE),
  ('Dell',    'dell',    'https://www.ctonline.mx/images/marcas/dell.png',    'Dell Technologies — laptops, desktops y servidores',               TRUE),
  ('Lenovo',  'lenovo',  'https://www.ctonline.mx/images/marcas/lenovo.png',  'Lenovo — ThinkPad, IdeaPad y soluciones empresariales',            TRUE),
  ('Epson',   'epson',   'https://www.ctonline.mx/images/marcas/epson.png',   'Epson — impresoras de inyección de tinta y láser',                 TRUE),
  ('Logitech','logitech','https://www.ctonline.mx/images/marcas/logitech.png','Logitech — periféricos, teclados, ratones y webcams',              TRUE),
  ('Samsung', 'samsung', 'https://www.ctonline.mx/images/marcas/samsung.png','Samsung Electronics — monitores, SSDs y almacenamiento',           TRUE),
  ('Kingston','kingston','https://www.ctonline.mx/images/marcas/kingston.png','Kingston Technology — memorias RAM y almacenamiento flash',         TRUE),
  ('ASUS',    'asus',    'https://www.ctonline.mx/images/marcas/asus.png',    'ASUS — laptops, placas base y componentes de alto desempeño',      TRUE),
  ('Acer',    'acer',    'https://www.ctonline.mx/images/marcas/acer.png',    'Acer — laptops y monitores para hogar y oficina',                  TRUE),
  ('TP-Link', 'tp-link', 'https://www.ctonline.mx/images/marcas/tplink.png', 'TP-Link — routers, switches y equipos de redes',                   TRUE)
ON CONFLICT (slug) DO NOTHING;


-- ───────────────────────────────────────────────────────────────────────────
-- 2. CATEGORÍAS (10)
-- margen_override = NULL en todas → se usará el margen_global = 30%
-- Las categorías del schema original se mantienen; aquí usamos ON CONFLICT
-- para no duplicar slugs existentes y solo insertar las nuevas.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO categories (nombre, slug, descripcion, margen_override, orden, activo) VALUES
  ('Laptops',                 'laptops',                 'Computadoras portátiles para trabajo y estudio',              NULL, 1,  TRUE),
  ('Computadoras de Escritorio', 'computadoras-escritorio', 'Equipos de escritorio para hogar y oficina',              NULL, 2,  TRUE),
  ('Impresoras',              'impresoras',              'Impresoras de tinta, láser y multifuncionales',               NULL, 3,  TRUE),
  ('Monitores',               'monitores',               'Monitores LED y curvo para trabajo y entretenimiento',        NULL, 4,  TRUE),
  ('Teclados y Ratones',      'teclados-ratones',        'Periféricos de entrada inalámbricos y con cable',             NULL, 5,  TRUE),
  ('Memorias RAM',            'memorias-ram',            'Módulos de memoria DDR4 y DDR5 para escritorio y laptop',     NULL, 6,  TRUE),
  ('Almacenamiento',          'almacenamiento',          'Discos duros, SSDs y memorias flash USB',                     NULL, 7,  TRUE),
  ('Redes y Conectividad',    'redes',                   'Routers, switches, adaptadores WiFi y accesorios de red',     NULL, 8,  TRUE),
  ('Accesorios',              'accesorios',              'Mochilas, fundas, hubs USB, cables y accesorios varios',      NULL, 9,  TRUE),
  ('Componentes',             'componentes',             'Procesadores, fuentes de poder, tarjetas de video y más',     NULL, 10, TRUE)
ON CONFLICT (slug) DO UPDATE
  SET descripcion     = EXCLUDED.descripcion,
      margen_override = EXCLUDED.margen_override,
      orden           = EXCLUDED.orden,
      activo          = EXCLUDED.activo;


-- ───────────────────────────────────────────────────────────────────────────
-- 3. PRODUCTOS (30)
-- Fórmula: precio_publico = ROUND(costo_ct * 1.30, 2)
-- margen_aplicado = 30, margen_override = NULL (hereda global)
-- existencia_total se actualiza en el paso 4 con los registros de inventory
-- ───────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  -- Marcas
  id_hp       UUID; id_dell    UUID; id_lenovo  UUID; id_epson   UUID;
  id_logitech UUID; id_samsung UUID; id_kingston UUID; id_asus   UUID;
  id_acer     UUID; id_tplink  UUID;
  -- Categorías
  id_cat_laptops  UUID; id_cat_desktop UUID; id_cat_imp    UUID;
  id_cat_mon      UUID; id_cat_per     UUID; id_cat_ram    UUID;
  id_cat_storage  UUID; id_cat_redes   UUID; id_cat_acc    UUID;
  id_cat_comp     UUID;
BEGIN

  -- Resolver IDs de marcas
  SELECT id INTO id_hp        FROM brands WHERE slug = 'hp';
  SELECT id INTO id_dell      FROM brands WHERE slug = 'dell';
  SELECT id INTO id_lenovo    FROM brands WHERE slug = 'lenovo';
  SELECT id INTO id_epson     FROM brands WHERE slug = 'epson';
  SELECT id INTO id_logitech  FROM brands WHERE slug = 'logitech';
  SELECT id INTO id_samsung   FROM brands WHERE slug = 'samsung';
  SELECT id INTO id_kingston  FROM brands WHERE slug = 'kingston';
  SELECT id INTO id_asus      FROM brands WHERE slug = 'asus';
  SELECT id INTO id_acer      FROM brands WHERE slug = 'acer';
  SELECT id INTO id_tplink    FROM brands WHERE slug = 'tp-link';

  -- Resolver IDs de categorías
  SELECT id INTO id_cat_laptops  FROM categories WHERE slug = 'laptops';
  SELECT id INTO id_cat_desktop  FROM categories WHERE slug = 'computadoras-escritorio';
  SELECT id INTO id_cat_imp      FROM categories WHERE slug = 'impresoras';
  SELECT id INTO id_cat_mon      FROM categories WHERE slug = 'monitores';
  SELECT id INTO id_cat_per      FROM categories WHERE slug = 'teclados-ratones';
  SELECT id INTO id_cat_ram      FROM categories WHERE slug = 'memorias-ram';
  SELECT id INTO id_cat_storage  FROM categories WHERE slug = 'almacenamiento';
  SELECT id INTO id_cat_redes    FROM categories WHERE slug = 'redes';
  SELECT id INTO id_cat_acc      FROM categories WHERE slug = 'accesorios';
  SELECT id INTO id_cat_comp     FROM categories WHERE slug = 'componentes';

  -- ── LAPTOPS (6 productos) ────────────────────────────────────────────────
  INSERT INTO products (sku_ct, nombre, slug, descripcion, marca_id, categoria_id, subcategoria,
    costo_ct, precio_publico, margen_aplicado, margen_override,
    existencia_total, activo, destacado, en_oferta, descontinuado,
    peso_kg, imagen_principal,
    especificaciones)
  VALUES
  (
    'HP-LAP-15-EH3001',
    'HP Laptop 15 AMD Ryzen 5 8GB RAM 512GB SSD',
    'hp-laptop-15-amd-ryzen-5-8gb-ram-512gb-ssd-hp-lap-15-eh3001',
    'Laptop HP 15 pulgadas con procesador AMD Ryzen 5 7520U, 8 GB RAM DDR5 y SSD NVMe de 512 GB. Ideal para trabajo y estudio. Sistema operativo Windows 11 Home.',
    id_hp, id_cat_laptops, 'Laptops Personales',
    10692.31, ROUND(10692.31 * 1.30, 2), 30, NULL,
    45, TRUE, TRUE, FALSE, FALSE,
    1.75, 'https://www.ctonline.mx/images/products/hp-laptop-15.jpg',
    '{"procesador": "AMD Ryzen 5 7520U", "ram": "8 GB DDR5", "almacenamiento": "512 GB SSD NVMe", "pantalla": "15.6 pulgadas FHD", "sistema_operativo": "Windows 11 Home", "bateria": "41 Wh"}'::jsonb
  ),
  (
    'DELL-INS-15-3535',
    'Dell Inspiron 15 Intel Core i5 16GB RAM 1TB SSD',
    'dell-inspiron-15-intel-core-i5-16gb-ram-1tb-ssd-dell-ins-15-3535',
    'Laptop Dell Inspiron 15 con procesador Intel Core i5-1335U de 13a generación, 16 GB RAM y 1 TB de almacenamiento SSD. Pantalla FHD de 15.6 pulgadas con panel antirreflejos.',
    id_dell, id_cat_laptops, 'Laptops Personales',
    14230.77, ROUND(14230.77 * 1.30, 2), 30, NULL,
    30, TRUE, TRUE, FALSE, FALSE,
    1.83, 'https://www.ctonline.mx/images/products/dell-inspiron-15.jpg',
    '{"procesador": "Intel Core i5-1335U", "ram": "16 GB DDR4", "almacenamiento": "1 TB SSD", "pantalla": "15.6 pulgadas FHD", "sistema_operativo": "Windows 11 Home", "bateria": "54 Wh"}'::jsonb
  ),
  (
    'LEN-IDEA-3-15IAU7',
    'Lenovo IdeaPad 3 Intel Core i3 8GB RAM 256GB SSD',
    'lenovo-ideapad-3-intel-core-i3-8gb-ram-256gb-ssd-len-idea-3-15iau7',
    'Laptop Lenovo IdeaPad 3 con procesador Intel Core i3-1215U, 8 GB RAM y 256 GB SSD. Diseño delgado y ligero, perfecta para tareas cotidianas y navegación.',
    id_lenovo, id_cat_laptops, 'Laptops Personales',
    7384.62, ROUND(7384.62 * 1.30, 2), 30, NULL,
    60, TRUE, FALSE, TRUE, FALSE,
    1.65, 'https://www.ctonline.mx/images/products/lenovo-ideapad-3.jpg',
    '{"procesador": "Intel Core i3-1215U", "ram": "8 GB DDR4", "almacenamiento": "256 GB SSD", "pantalla": "15.6 pulgadas HD", "sistema_operativo": "Windows 11 Home S", "bateria": "38 Wh"}'::jsonb
  ),
  (
    'ASUS-VIV-15-X1504VA',
    'ASUS VivoBook 15 Intel Core i7 16GB RAM 512GB SSD',
    'asus-vivobook-15-intel-core-i7-16gb-ram-512gb-ssd-asus-viv-15-x1504va',
    'Laptop ASUS VivoBook 15 con Intel Core i7-1355U, 16 GB RAM DDR4 y 512 GB SSD PCIe. Pantalla Full HD con resolución 1920x1080 y diseño ultradelgado.',
    id_asus, id_cat_laptops, 'Laptops Premium',
    15076.92, ROUND(15076.92 * 1.30, 2), 30, NULL,
    25, TRUE, TRUE, FALSE, FALSE,
    1.70, 'https://www.ctonline.mx/images/products/asus-vivobook-15.jpg',
    '{"procesador": "Intel Core i7-1355U", "ram": "16 GB DDR4", "almacenamiento": "512 GB SSD PCIe", "pantalla": "15.6 pulgadas FHD IPS", "sistema_operativo": "Windows 11 Home", "bateria": "50 Wh"}'::jsonb
  ),
  (
    'ACER-ASP-5-A515-58P',
    'Acer Aspire 5 Intel Core i5 8GB RAM 512GB SSD',
    'acer-aspire-5-intel-core-i5-8gb-ram-512gb-ssd-acer-asp-5-a515-58p',
    'Laptop Acer Aspire 5 con procesador Intel Core i5-1335U, 8 GB RAM DDR4 y 512 GB SSD NVMe. Pantalla IPS Full HD de 15.6 pulgadas con marco delgado.',
    id_acer, id_cat_laptops, 'Laptops Personales',
    11538.46, ROUND(11538.46 * 1.30, 2), 30, NULL,
    38, TRUE, FALSE, FALSE, FALSE,
    1.78, 'https://www.ctonline.mx/images/products/acer-aspire-5.jpg',
    '{"procesador": "Intel Core i5-1335U", "ram": "8 GB DDR4", "almacenamiento": "512 GB SSD NVMe", "pantalla": "15.6 pulgadas FHD IPS", "sistema_operativo": "Windows 11 Home", "bateria": "48 Wh"}'::jsonb
  ),
  (
    'DELL-LAT-5440-I5',
    'Dell Latitude 5440 Intel Core i5 16GB RAM 256GB SSD Empresarial',
    'dell-latitude-5440-intel-core-i5-16gb-ram-256gb-ssd-dell-lat-5440-i5',
    'Laptop empresarial Dell Latitude 5440 con procesador Intel Core i5-1345U, 16 GB RAM DDR4 y SSD de 256 GB. Certificación MIL-STD-810H para entornos exigentes.',
    id_dell, id_cat_laptops, 'Laptops Empresariales',
    18461.54, ROUND(18461.54 * 1.30, 2), 30, NULL,
    15, TRUE, TRUE, FALSE, FALSE,
    1.57, 'https://www.ctonline.mx/images/products/dell-latitude-5440.jpg',
    '{"procesador": "Intel Core i5-1345U", "ram": "16 GB DDR4", "almacenamiento": "256 GB SSD", "pantalla": "14 pulgadas FHD", "sistema_operativo": "Windows 11 Pro", "certificacion": "MIL-STD-810H"}'::jsonb
  )
  ON CONFLICT (sku_ct) DO UPDATE
    SET nombre = EXCLUDED.nombre, costo_ct = EXCLUDED.costo_ct,
        precio_publico = EXCLUDED.precio_publico, margen_aplicado = EXCLUDED.margen_aplicado,
        existencia_total = EXCLUDED.existencia_total, activo = EXCLUDED.activo,
        destacado = EXCLUDED.destacado, en_oferta = EXCLUDED.en_oferta,
        fecha_actualizacion = NOW();

  -- ── COMPUTADORAS DE ESCRITORIO (4 productos) ─────────────────────────────
  INSERT INTO products (sku_ct, nombre, slug, descripcion, marca_id, categoria_id, subcategoria,
    costo_ct, precio_publico, margen_aplicado, margen_override,
    existencia_total, activo, destacado, en_oferta, descontinuado,
    peso_kg, imagen_principal, especificaciones)
  VALUES
  (
    'HP-290-G9-MT-I5',
    'HP 290 G9 Mini Tower Intel Core i5 8GB RAM 256GB SSD',
    'hp-290-g9-mini-tower-intel-core-i5-8gb-ram-256gb-ssd-hp-290-g9-mt-i5',
    'Desktop HP 290 G9 Mini Tower con procesador Intel Core i5-12500, 8 GB RAM DDR4 y 256 GB SSD. Factor de forma compacto ideal para escritorios corporativos.',
    id_hp, id_cat_desktop, 'Mini Tower',
    9230.77, ROUND(9230.77 * 1.30, 2), 30, NULL,
    20, TRUE, FALSE, FALSE, FALSE,
    6.50, 'https://www.ctonline.mx/images/products/hp-290-g9.jpg',
    '{"procesador": "Intel Core i5-12500", "ram": "8 GB DDR4", "almacenamiento": "256 GB SSD", "sistema_operativo": "Windows 11 Pro", "factor_forma": "Mini Tower", "puertos": "USB 3.1, HDMI, VGA"}'::jsonb
  ),
  (
    'DELL-OPT-3000-SFF',
    'Dell OptiPlex 3000 Small Form Factor Intel Core i3 4GB RAM 500GB HDD',
    'dell-optiplex-3000-small-form-factor-intel-core-i3-4gb-ram-dell-opt-3000-sff',
    'PC Dell OptiPlex 3000 en factor compacto con Intel Core i3-12100, 4 GB RAM y disco duro de 500 GB. Confiable para entornos de trabajo de alta densidad.',
    id_dell, id_cat_desktop, 'Small Form Factor',
    7076.92, ROUND(7076.92 * 1.30, 2), 30, NULL,
    18, TRUE, FALSE, TRUE, FALSE,
    4.80, 'https://www.ctonline.mx/images/products/dell-optiplex-3000.jpg',
    '{"procesador": "Intel Core i3-12100", "ram": "4 GB DDR4", "almacenamiento": "500 GB HDD", "sistema_operativo": "Windows 11 Pro", "factor_forma": "SFF", "puertos": "USB-A 3.2, HDMI, DisplayPort"}'::jsonb
  ),
  (
    'LEN-THK-M70Q-GEN3',
    'Lenovo ThinkCentre M70q Gen 3 Intel Core i5 16GB RAM 512GB SSD Mini PC',
    'lenovo-thinkcentre-m70q-gen3-intel-core-i5-16gb-ram-len-thk-m70q-gen3',
    'Mini PC Lenovo ThinkCentre M70q Gen 3 con Intel Core i5-12400T, 16 GB RAM y 512 GB SSD NVMe. Tamaño ultra compacto sin sacrificar rendimiento empresarial.',
    id_lenovo, id_cat_desktop, 'Mini PC',
    11384.62, ROUND(11384.62 * 1.30, 2), 30, NULL,
    12, TRUE, TRUE, FALSE, FALSE,
    1.40, 'https://www.ctonline.mx/images/products/lenovo-thinkcentre-m70q.jpg',
    '{"procesador": "Intel Core i5-12400T", "ram": "16 GB DDR4", "almacenamiento": "512 GB SSD NVMe", "sistema_operativo": "Windows 11 Pro", "factor_forma": "Mini PC", "dimensiones": "179 x 183 x 37 mm"}'::jsonb
  ),
  (
    'HP-PRODESK-400-G9',
    'HP ProDesk 400 G9 Torre Intel Core i7 16GB RAM 1TB SSD',
    'hp-prodesk-400-g9-torre-intel-core-i7-16gb-ram-1tb-ssd-hp-prodesk-400-g9',
    'Tower corporativo HP ProDesk 400 G9 con Intel Core i7-12700, 16 GB RAM DDR4 y 1 TB SSD PCIe. Diseñado para cargas de trabajo intensas en entornos empresariales.',
    id_hp, id_cat_desktop, 'Tower',
    16923.08, ROUND(16923.08 * 1.30, 2), 30, NULL,
    8, TRUE, TRUE, FALSE, FALSE,
    7.80, 'https://www.ctonline.mx/images/products/hp-prodesk-400-g9.jpg',
    '{"procesador": "Intel Core i7-12700", "ram": "16 GB DDR4", "almacenamiento": "1 TB SSD PCIe", "sistema_operativo": "Windows 11 Pro", "factor_forma": "Tower", "ranuras_expansion": "2x PCIe, 2x M.2"}'::jsonb
  )
  ON CONFLICT (sku_ct) DO UPDATE
    SET nombre = EXCLUDED.nombre, costo_ct = EXCLUDED.costo_ct,
        precio_publico = EXCLUDED.precio_publico, margen_aplicado = EXCLUDED.margen_aplicado,
        existencia_total = EXCLUDED.existencia_total, activo = EXCLUDED.activo,
        destacado = EXCLUDED.destacado, en_oferta = EXCLUDED.en_oferta,
        fecha_actualizacion = NOW();

  -- ── IMPRESORAS (4 productos) ─────────────────────────────────────────────
  INSERT INTO products (sku_ct, nombre, slug, descripcion, marca_id, categoria_id, subcategoria,
    costo_ct, precio_publico, margen_aplicado, margen_override,
    existencia_total, activo, destacado, en_oferta, descontinuado,
    peso_kg, imagen_principal, especificaciones)
  VALUES
  (
    'EPSON-L3210-ECOTANK',
    'Epson EcoTank L3210 Impresora Multifuncional de Tinta',
    'epson-ecotank-l3210-impresora-multifuncional-tinta-epson-l3210-ecotank',
    'Impresora multifuncional Epson EcoTank L3210 con sistema de tinta recargable. Incluye hasta 7500 páginas en negro y 6000 en color con las botellas incluidas.',
    id_epson, id_cat_imp, 'Inyección de Tinta',
    3384.62, ROUND(3384.62 * 1.30, 2), 30, NULL,
    42, TRUE, TRUE, FALSE, FALSE,
    3.90, 'https://www.ctonline.mx/images/products/epson-ecotank-l3210.jpg',
    '{"tipo": "Multifuncional (imprime, escanea, copia)", "tecnologia": "Inyección de tinta", "conectividad": "USB 2.0", "velocidad_negro": "33 ppm", "velocidad_color": "15 ppm", "resolucion": "5760 x 1440 dpi", "rendimiento": "7500 pág negro / 6000 pág color"}'::jsonb
  ),
  (
    'HP-SMART-TANK-520',
    'HP Smart Tank 520 Impresora Multifuncional WiFi',
    'hp-smart-tank-520-impresora-multifuncional-wifi-hp-smart-tank-520',
    'Impresora HP Smart Tank 520 con tanques recargables, WiFi integrado y app móvil. Rendimiento de hasta 8000 páginas en negro y 6000 en color.',
    id_hp, id_cat_imp, 'Inyección de Tinta',
    3846.15, ROUND(3846.15 * 1.30, 2), 30, NULL,
    35, TRUE, FALSE, FALSE, FALSE,
    4.20, 'https://www.ctonline.mx/images/products/hp-smart-tank-520.jpg',
    '{"tipo": "Multifuncional WiFi", "tecnologia": "Inyección de tinta", "conectividad": "WiFi, USB", "velocidad_negro": "19 ppm", "velocidad_color": "15 ppm", "resolucion": "4800 x 1200 dpi", "rendimiento": "8000 pág negro / 6000 pág color"}'::jsonb
  ),
  (
    'EPSON-L3250-WIFI',
    'Epson EcoTank L3250 Impresora Multifuncional WiFi',
    'epson-ecotank-l3250-impresora-multifuncional-wifi-epson-l3250-wifi',
    'Impresora multifuncional inalámbrica Epson EcoTank L3250 con tanques de tinta de alta capacidad y aplicación móvil Epson Smart Panel para impresión desde smartphone.',
    id_epson, id_cat_imp, 'Inyección de Tinta',
    4076.92, ROUND(4076.92 * 1.30, 2), 30, NULL,
    28, TRUE, TRUE, FALSE, FALSE,
    3.95, 'https://www.ctonline.mx/images/products/epson-ecotank-l3250.jpg',
    '{"tipo": "Multifuncional WiFi", "tecnologia": "Inyección de tinta", "conectividad": "WiFi, WiFi Direct, USB", "velocidad_negro": "33 ppm", "velocidad_color": "15 ppm", "resolucion": "5760 x 1440 dpi", "app_movil": "Epson Smart Panel"}'::jsonb
  ),
  (
    'HP-LASERJET-M110W',
    'HP LaserJet M110w Impresora Láser Monocromática WiFi',
    'hp-laserjet-m110w-impresora-laser-monocromatica-wifi-hp-laserjet-m110w',
    'Impresora láser monocromática HP LaserJet M110w con conectividad WiFi, ideal para pequeñas oficinas. Velocidad de impresión de 20 ppm y bandeja de 150 hojas.',
    id_hp, id_cat_imp, 'Láser',
    2923.08, ROUND(2923.08 * 1.30, 2), 30, NULL,
    52, TRUE, FALSE, TRUE, FALSE,
    4.00, 'https://www.ctonline.mx/images/products/hp-laserjet-m110w.jpg',
    '{"tipo": "Láser Monocromática WiFi", "tecnologia": "Láser", "conectividad": "WiFi, USB", "velocidad_negro": "20 ppm", "resolucion": "600 x 600 dpi", "capacidad_bandeja": "150 hojas", "ciclo_mensual": "8000 páginas"}'::jsonb
  )
  ON CONFLICT (sku_ct) DO UPDATE
    SET nombre = EXCLUDED.nombre, costo_ct = EXCLUDED.costo_ct,
        precio_publico = EXCLUDED.precio_publico, margen_aplicado = EXCLUDED.margen_aplicado,
        existencia_total = EXCLUDED.existencia_total, activo = EXCLUDED.activo,
        destacado = EXCLUDED.destacado, en_oferta = EXCLUDED.en_oferta,
        fecha_actualizacion = NOW();

  -- ── MONITORES (3 productos) ──────────────────────────────────────────────
  INSERT INTO products (sku_ct, nombre, slug, descripcion, marca_id, categoria_id, subcategoria,
    costo_ct, precio_publico, margen_aplicado, margen_override,
    existencia_total, activo, destacado, en_oferta, descontinuado,
    peso_kg, imagen_principal, especificaciones)
  VALUES
  (
    'SAM-MON-F24T450FQN',
    'Samsung 24 Pulgadas FHD Monitor IPS 75Hz DisplayPort',
    'samsung-24-pulgadas-fhd-monitor-ips-75hz-displayport-sam-mon-f24t450fqn',
    'Monitor Samsung 24 pulgadas Full HD con panel IPS, tasa de refresco de 75 Hz y puertos HDMI + DisplayPort. Incluye soporte ergonómico ajustable en altura.',
    id_samsung, id_cat_mon, 'Monitores FHD',
    3153.85, ROUND(3153.85 * 1.30, 2), 30, NULL,
    33, TRUE, FALSE, FALSE, FALSE,
    4.50, 'https://www.ctonline.mx/images/products/samsung-monitor-24-f24t450.jpg',
    '{"tamano": "24 pulgadas", "resolucion": "1920x1080 FHD", "panel": "IPS", "tasa_refresco": "75 Hz", "tiempo_respuesta": "5 ms", "puertos": "HDMI, DisplayPort", "ergonomia": "Ajustable en altura, inclinación"}'::jsonb
  ),
  (
    'SAM-MON-LS27C360EANXZA',
    'Samsung 27 Pulgadas FHD Curved Monitor 1000R 75Hz FreeSync',
    'samsung-27-pulgadas-fhd-curved-monitor-1000r-75hz-sam-mons27c360',
    'Monitor curvo Samsung 27 pulgadas FHD con curvatura 1000R para mayor inmersión. Compatible con AMD FreeSync y tasa de refresco de 75 Hz para gaming casual.',
    id_samsung, id_cat_mon, 'Monitores Curvos',
    3692.31, ROUND(3692.31 * 1.30, 2), 30, NULL,
    22, TRUE, TRUE, FALSE, FALSE,
    4.80, 'https://www.ctonline.mx/images/products/samsung-curved-27-c360.jpg',
    '{"tamano": "27 pulgadas", "resolucion": "1920x1080 FHD", "panel": "VA Curvo 1000R", "tasa_refresco": "75 Hz", "tiempo_respuesta": "4 ms", "puertos": "HDMI, D-Sub", "freesync": "AMD FreeSync"}'::jsonb
  ),
  (
    'ASUS-MON-VP249QGR',
    'ASUS 24 Pulgadas Full HD Monitor 144Hz 1ms IPS Gaming',
    'asus-24-pulgadas-full-hd-monitor-144hz-1ms-ips-gaming-asus-mon-vp249qgr',
    'Monitor ASUS de 24 pulgadas con panel IPS Full HD, tasa de refresco de 144 Hz y tiempo de respuesta de 1 ms. Compatible con FreeSync y G-Sync. Ideal para gaming.',
    id_asus, id_cat_mon, 'Monitores Gaming',
    4615.38, ROUND(4615.38 * 1.30, 2), 30, NULL,
    18, TRUE, TRUE, FALSE, FALSE,
    3.60, 'https://www.ctonline.mx/images/products/asus-monitor-vp249qgr.jpg',
    '{"tamano": "24 pulgadas", "resolucion": "1920x1080 FHD", "panel": "IPS", "tasa_refresco": "144 Hz", "tiempo_respuesta": "1 ms MPRT", "puertos": "HDMI x2, DisplayPort", "gsync": "G-Sync Compatible / FreeSync"}'::jsonb
  )
  ON CONFLICT (sku_ct) DO UPDATE
    SET nombre = EXCLUDED.nombre, costo_ct = EXCLUDED.costo_ct,
        precio_publico = EXCLUDED.precio_publico, margen_aplicado = EXCLUDED.margen_aplicado,
        existencia_total = EXCLUDED.existencia_total, activo = EXCLUDED.activo,
        destacado = EXCLUDED.destacado, en_oferta = EXCLUDED.en_oferta,
        fecha_actualizacion = NOW();

  -- ── TECLADOS Y RATONES (3 productos) ─────────────────────────────────────
  INSERT INTO products (sku_ct, nombre, slug, descripcion, marca_id, categoria_id, subcategoria,
    costo_ct, precio_publico, margen_aplicado, margen_override,
    existencia_total, activo, destacado, en_oferta, descontinuado,
    peso_kg, imagen_principal, especificaciones)
  VALUES
  (
    'LOG-MK540-ADV-COMBO',
    'Logitech MK540 Advanced Combo Teclado y Ratón Inalámbrico',
    'logitech-mk540-advanced-combo-teclado-raton-inalambrico-log-mk540-adv-combo',
    'Combo inalámbrico Logitech MK540 con teclado de tamaño completo y ratón óptico. Receptor nano USB unificador. Batería de hasta 36 meses en el teclado y 18 en el ratón.',
    id_logitech, id_cat_per, 'Combos Inalámbricos',
    1153.85, ROUND(1153.85 * 1.30, 2), 30, NULL,
    75, TRUE, FALSE, FALSE, FALSE,
    0.85, 'https://www.ctonline.mx/images/products/logitech-mk540.jpg',
    '{"tipo": "Combo teclado + ratón", "conectividad": "Inalámbrico 2.4 GHz", "receptor": "USB Nano Unifying", "bateria_teclado": "36 meses", "bateria_raton": "18 meses", "dpi_raton": "1000 dpi", "idioma": "Español Latino"}'::jsonb
  ),
  (
    'LOG-MX-MASTER-3S',
    'Logitech MX Master 3S Ratón Inalámbrico Avanzado',
    'logitech-mx-master-3s-raton-inalambrico-avanzado-log-mx-master-3s',
    'Ratón inalámbrico Logitech MX Master 3S con sensor de 8000 DPI, rueda MagSpeed ultrasilenciosa y botones silenciosos. Conectividad Bluetooth y receptor USB.',
    id_logitech, id_cat_per, 'Ratones Premium',
    1615.38, ROUND(1615.38 * 1.30, 2), 30, NULL,
    40, TRUE, TRUE, FALSE, FALSE,
    0.14, 'https://www.ctonline.mx/images/products/logitech-mx-master-3s.jpg',
    '{"tipo": "Ratón ergonómico", "conectividad": "Bluetooth / USB Nano", "sensor": "8000 DPI", "bateria": "Recargable USB-C hasta 70 días", "botones": "7 botones programables", "silencioso": "Sí"}'::jsonb
  ),
  (
    'LOG-K380-BT-TECLADO',
    'Logitech K380 Teclado Inalámbrico Bluetooth Multi-Dispositivo',
    'logitech-k380-teclado-inalambrico-bluetooth-multi-dispositivo-log-k380-bt',
    'Teclado compacto Logitech K380 con Bluetooth para conectar hasta 3 dispositivos simultáneamente. Compatible con Windows, macOS, Android e iOS.',
    id_logitech, id_cat_per, 'Teclados Inalámbricos',
    884.62, ROUND(884.62 * 1.30, 2), 30, NULL,
    90, TRUE, FALSE, TRUE, FALSE,
    0.42, 'https://www.ctonline.mx/images/products/logitech-k380.jpg',
    '{"tipo": "Teclado compacto", "conectividad": "Bluetooth 3.0", "dispositivos": "Hasta 3 simultáneos", "bateria": "2 pilas AAA hasta 24 meses", "compatibilidad": "Windows, macOS, Android, iOS", "idioma": "Español Latino"}'::jsonb
  )
  ON CONFLICT (sku_ct) DO UPDATE
    SET nombre = EXCLUDED.nombre, costo_ct = EXCLUDED.costo_ct,
        precio_publico = EXCLUDED.precio_publico, margen_aplicado = EXCLUDED.margen_aplicado,
        existencia_total = EXCLUDED.existencia_total, activo = EXCLUDED.activo,
        destacado = EXCLUDED.destacado, en_oferta = EXCLUDED.en_oferta,
        fecha_actualizacion = NOW();

  -- ── MEMORIAS RAM (3 productos) ───────────────────────────────────────────
  INSERT INTO products (sku_ct, nombre, slug, descripcion, marca_id, categoria_id, subcategoria,
    costo_ct, precio_publico, margen_aplicado, margen_override,
    existencia_total, activo, destacado, en_oferta, descontinuado,
    peso_kg, imagen_principal, especificaciones)
  VALUES
  (
    'KIN-KVR32N22S8-8',
    'Kingston ValueRAM 8GB DDR4 3200MHz DIMM',
    'kingston-valueram-8gb-ddr4-3200mhz-dimm-kin-kvr32n22s8-8',
    'Módulo de memoria Kingston ValueRAM 8 GB DDR4 3200 MHz para escritorio. Compatible con la mayoría de plataformas Intel y AMD modernas. Garantía de por vida.',
    id_kingston, id_cat_ram, 'DDR4 Escritorio',
    615.38, ROUND(615.38 * 1.30, 2), 30, NULL,
    120, TRUE, FALSE, FALSE, FALSE,
    0.03, 'https://www.ctonline.mx/images/products/kingston-valueram-8gb-ddr4.jpg',
    '{"capacidad": "8 GB", "tipo": "DDR4", "velocidad": "3200 MHz", "factor_forma": "DIMM (escritorio)", "cas_latency": "CL22", "voltaje": "1.2V", "garantia": "De por vida"}'::jsonb
  ),
  (
    'KIN-KVR32N22D8-16',
    'Kingston ValueRAM 16GB DDR4 3200MHz DIMM',
    'kingston-valueram-16gb-ddr4-3200mhz-dimm-kin-kvr32n22d8-16',
    'Módulo de memoria Kingston ValueRAM 16 GB DDR4 3200 MHz para desktop. Ideal para ampliar la RAM de equipos existentes. 100% probado en fábrica.',
    id_kingston, id_cat_ram, 'DDR4 Escritorio',
    1153.85, ROUND(1153.85 * 1.30, 2), 30, NULL,
    80, TRUE, FALSE, FALSE, FALSE,
    0.03, 'https://www.ctonline.mx/images/products/kingston-valueram-16gb-ddr4.jpg',
    '{"capacidad": "16 GB", "tipo": "DDR4", "velocidad": "3200 MHz", "factor_forma": "DIMM (escritorio)", "cas_latency": "CL22", "voltaje": "1.2V", "garantia": "De por vida"}'::jsonb
  ),
  (
    'KIN-KVR48S40BS6-8',
    'Kingston ValueRAM 8GB DDR5 4800MHz SO-DIMM Laptop',
    'kingston-valueram-8gb-ddr5-4800mhz-so-dimm-laptop-kin-kvr48s40bs6-8',
    'Módulo SO-DIMM DDR5 Kingston ValueRAM 8 GB a 4800 MHz para laptops de última generación. Compatible con plataformas Intel Core 12a/13a gen y AMD Ryzen 6000/7000.',
    id_kingston, id_cat_ram, 'DDR5 Laptop',
    923.08, ROUND(923.08 * 1.30, 2), 30, NULL,
    55, TRUE, FALSE, FALSE, FALSE,
    0.02, 'https://www.ctonline.mx/images/products/kingston-valueram-8gb-ddr5.jpg',
    '{"capacidad": "8 GB", "tipo": "DDR5", "velocidad": "4800 MHz", "factor_forma": "SO-DIMM (laptop)", "cas_latency": "CL40", "voltaje": "1.1V", "garantia": "De por vida"}'::jsonb
  )
  ON CONFLICT (sku_ct) DO UPDATE
    SET nombre = EXCLUDED.nombre, costo_ct = EXCLUDED.costo_ct,
        precio_publico = EXCLUDED.precio_publico, margen_aplicado = EXCLUDED.margen_aplicado,
        existencia_total = EXCLUDED.existencia_total, activo = EXCLUDED.activo,
        destacado = EXCLUDED.destacado, en_oferta = EXCLUDED.en_oferta,
        fecha_actualizacion = NOW();

  -- ── ALMACENAMIENTO (4 productos) ─────────────────────────────────────────
  INSERT INTO products (sku_ct, nombre, slug, descripcion, marca_id, categoria_id, subcategoria,
    costo_ct, precio_publico, margen_aplicado, margen_override,
    existencia_total, activo, destacado, en_oferta, descontinuado,
    peso_kg, imagen_principal, especificaciones)
  VALUES
  (
    'SAM-MZ-V8V500B-AM',
    'Samsung 980 NVMe SSD 500GB M.2 PCIe 3.0',
    'samsung-980-nvme-ssd-500gb-m2-pcie-3-sam-mz-v8v500b-am',
    'SSD Samsung 980 de 500 GB en formato M.2 2280, interfaz PCIe 3.0 NVMe. Velocidades de lectura secuencial de hasta 3500 MB/s y escritura de 3000 MB/s.',
    id_samsung, id_cat_storage, 'SSD M.2 NVMe',
    1153.85, ROUND(1153.85 * 1.30, 2), 30, NULL,
    65, TRUE, TRUE, FALSE, FALSE,
    0.01, 'https://www.ctonline.mx/images/products/samsung-980-nvme-500gb.jpg',
    '{"capacidad": "500 GB", "interfaz": "PCIe 3.0 NVMe M.2 2280", "lectura_secuencial": "3500 MB/s", "escritura_secuencial": "3000 MB/s", "garantia": "5 años", "TBW": "300 TBW"}'::jsonb
  ),
  (
    'SAM-MZ-V8V1T0B-AM',
    'Samsung 980 NVMe SSD 1TB M.2 PCIe 3.0',
    'samsung-980-nvme-ssd-1tb-m2-pcie-3-sam-mz-v8v1t0b-am',
    'SSD Samsung 980 de 1 TB en formato M.2 NVMe PCIe 3.0. Velocidad de lectura hasta 3500 MB/s. Ideal para ampliar almacenamiento de laptop o desktop.',
    id_samsung, id_cat_storage, 'SSD M.2 NVMe',
    2076.92, ROUND(2076.92 * 1.30, 2), 30, NULL,
    48, TRUE, FALSE, FALSE, FALSE,
    0.01, 'https://www.ctonline.mx/images/products/samsung-980-nvme-1tb.jpg',
    '{"capacidad": "1 TB", "interfaz": "PCIe 3.0 NVMe M.2 2280", "lectura_secuencial": "3500 MB/s", "escritura_secuencial": "3000 MB/s", "garantia": "5 años", "TBW": "600 TBW"}'::jsonb
  ),
  (
    'KIN-DT100G3-32GBCR',
    'Kingston DataTraveler 100 G3 USB 3.0 32GB Flash Drive',
    'kingston-datatraveler-100-g3-usb-3-0-32gb-flash-drive-kin-dt100g3-32gb',
    'Memoria USB Kingston DataTraveler 100 G3 de 32 GB con conector USB 3.0. Velocidades de lectura hasta 100 MB/s. Diseño compacto y ligero, ideal para uso diario.',
    id_kingston, id_cat_storage, 'USB Flash Drive',
    230.77, ROUND(230.77 * 1.30, 2), 30, NULL,
    200, TRUE, FALSE, TRUE, FALSE,
    0.01, 'https://www.ctonline.mx/images/products/kingston-dt100g3-32gb.jpg',
    '{"capacidad": "32 GB", "interfaz": "USB 3.0", "velocidad_lectura": "100 MB/s", "velocidad_escritura": "10 MB/s", "garantia": "5 años", "dimensiones": "60.4 x 19 x 8.9 mm"}'::jsonb
  ),
  (
    'KIN-DT100G3-64GBCR',
    'Kingston DataTraveler 100 G3 USB 3.0 64GB Flash Drive',
    'kingston-datatraveler-100-g3-usb-3-0-64gb-flash-drive-kin-dt100g3-64gb',
    'Memoria USB Kingston DataTraveler 100 G3 de 64 GB con conector USB 3.0. Velocidades de lectura hasta 100 MB/s. Diseño tapa deslizante sin capuchón que se puede perder.',
    id_kingston, id_cat_storage, 'USB Flash Drive',
    384.62, ROUND(384.62 * 1.30, 2), 30, NULL,
    150, TRUE, FALSE, FALSE, FALSE,
    0.01, 'https://www.ctonline.mx/images/products/kingston-dt100g3-64gb.jpg',
    '{"capacidad": "64 GB", "interfaz": "USB 3.0", "velocidad_lectura": "100 MB/s", "velocidad_escritura": "15 MB/s", "garantia": "5 años", "tapa": "Deslizante sin capuchón"}'::jsonb
  )
  ON CONFLICT (sku_ct) DO UPDATE
    SET nombre = EXCLUDED.nombre, costo_ct = EXCLUDED.costo_ct,
        precio_publico = EXCLUDED.precio_publico, margen_aplicado = EXCLUDED.margen_aplicado,
        existencia_total = EXCLUDED.existencia_total, activo = EXCLUDED.activo,
        destacado = EXCLUDED.destacado, en_oferta = EXCLUDED.en_oferta,
        fecha_actualizacion = NOW();

  -- ── REDES Y CONECTIVIDAD (3 productos) ───────────────────────────────────
  INSERT INTO products (sku_ct, nombre, slug, descripcion, marca_id, categoria_id, subcategoria,
    costo_ct, precio_publico, margen_aplicado, margen_override,
    existencia_total, activo, destacado, en_oferta, descontinuado,
    peso_kg, imagen_principal, especificaciones)
  VALUES
  (
    'TPL-ARCHERC6-V4',
    'TP-Link Archer C6 Router WiFi Doble Banda AC1200',
    'tp-link-archer-c6-router-wifi-doble-banda-ac1200-tpl-archerc6-v4',
    'Router TP-Link Archer C6 con WiFi doble banda AC1200 (300 Mbps a 2.4 GHz + 867 Mbps a 5 GHz). Incluye 4 antenas externas y un puerto WAN Gigabit más 4 puertos LAN.',
    id_tplink, id_cat_redes, 'Routers WiFi',
    923.08, ROUND(923.08 * 1.30, 2), 30, NULL,
    55, TRUE, FALSE, FALSE, FALSE,
    0.32, 'https://www.ctonline.mx/images/products/tp-link-archer-c6.jpg',
    '{"tipo": "Router WiFi", "estandar": "802.11ac (WiFi 5)", "bandas": "Doble banda 2.4 GHz + 5 GHz", "velocidad_combinada": "1200 Mbps", "puertos": "1x WAN Gigabit, 4x LAN Gigabit", "antenas": "4 externas"}'::jsonb
  ),
  (
    'TPL-TL-SG108-8PORT',
    'TP-Link TL-SG108 Switch No Administrable 8 Puertos Gigabit',
    'tp-link-tl-sg108-switch-no-administrable-8-puertos-gigabit-tpl-tl-sg108-8port',
    'Switch Gigabit de 8 puertos TP-Link TL-SG108 sin administración. Carcasa metálica, diseño plug-and-play, ideal para ampliar la red de oficinas y hogares.',
    id_tplink, id_cat_redes, 'Switches',
    692.31, ROUND(692.31 * 1.30, 2), 30, NULL,
    40, TRUE, FALSE, FALSE, FALSE,
    0.34, 'https://www.ctonline.mx/images/products/tp-link-tl-sg108.jpg',
    '{"tipo": "Switch No Administrable", "puertos": "8x Gigabit Ethernet", "velocidad": "10/100/1000 Mbps", "carcasa": "Metálica", "montaje": "Escritorio / pared", "plug_and_play": "Sí"}'::jsonb
  ),
  (
    'TPL-UB500-BT5-ADAPT',
    'TP-Link UB500 Adaptador USB Bluetooth 5.0',
    'tp-link-ub500-adaptador-usb-bluetooth-5-0-tpl-ub500-bt5-adapt',
    'Adaptador Bluetooth 5.0 TP-Link UB500 para PC de escritorio sin Bluetooth. Compatible con auriculares, ratones, teclados y altavoces. Plug-and-Play en Windows 10/11.',
    id_tplink, id_cat_redes, 'Adaptadores',
    230.77, ROUND(230.77 * 1.30, 2), 30, NULL,
    110, TRUE, FALSE, TRUE, FALSE,
    0.01, 'https://www.ctonline.mx/images/products/tp-link-ub500.jpg',
    '{"tipo": "Adaptador USB Bluetooth", "version": "Bluetooth 5.0", "conector": "USB-A Nano", "alcance": "Hasta 20 metros", "compatibilidad": "Windows 11/10/8.1", "plug_and_play": "Sí"}'::jsonb
  )
  ON CONFLICT (sku_ct) DO UPDATE
    SET nombre = EXCLUDED.nombre, costo_ct = EXCLUDED.costo_ct,
        precio_publico = EXCLUDED.precio_publico, margen_aplicado = EXCLUDED.margen_aplicado,
        existencia_total = EXCLUDED.existencia_total, activo = EXCLUDED.activo,
        destacado = EXCLUDED.destacado, en_oferta = EXCLUDED.en_oferta,
        fecha_actualizacion = NOW();

  -- ── ACCESORIOS Y COMPONENTES (3 productos) ───────────────────────────────
  INSERT INTO products (sku_ct, nombre, slug, descripcion, marca_id, categoria_id, subcategoria,
    costo_ct, precio_publico, margen_aplicado, margen_override,
    existencia_total, activo, destacado, en_oferta, descontinuado,
    peso_kg, imagen_principal, especificaciones)
  VALUES
  (
    'LOG-C920-HD-WEBCAM',
    'Logitech C920 HD Pro Webcam 1080p 30fps Autofocus',
    'logitech-c920-hd-pro-webcam-1080p-30fps-autofocus-log-c920-hd-webcam',
    'Webcam Logitech C920 con resolución Full HD 1080p a 30 fps y autofoco rápido. Micrófonos duales estéreo para videollamadas con sonido nítido. Compatible con Zoom y Teams.',
    id_logitech, id_cat_acc, 'Webcams',
    1538.46, ROUND(1538.46 * 1.30, 2), 30, NULL,
    35, TRUE, TRUE, FALSE, FALSE,
    0.16, 'https://www.ctonline.mx/images/products/logitech-c920.jpg',
    '{"tipo": "Webcam", "resolucion": "1080p Full HD 30 fps", "autofoco": "Sí", "microfonos": "Duales estéreo con reducción de ruido", "conexion": "USB 2.0", "compatibilidad": "Zoom, Teams, Google Meet"}'::jsonb
  ),
  (
    'HP-USB-C-DOCK-G5',
    'HP USB-C Dock G5 Estación de Acoplamiento 65W',
    'hp-usb-c-dock-g5-estacion-acoplamiento-65w-hp-usb-c-dock-g5',
    'Estación de acoplamiento HP USB-C Dock G5 con carga de 65W, un puerto DisplayPort, dos HDMI, USB-A 3.0 x3, USB-C, RJ-45 Gigabit y audio combo. Un solo cable para todo.',
    id_hp, id_cat_acc, 'Docking Stations',
    3076.92, ROUND(3076.92 * 1.30, 2), 30, NULL,
    20, TRUE, TRUE, FALSE, FALSE,
    0.29, 'https://www.ctonline.mx/images/products/hp-usb-c-dock-g5.jpg',
    '{"tipo": "Docking Station", "conexion_host": "USB-C con Power Delivery 65W", "video": "1x DisplayPort 1.4, 2x HDMI 2.0", "usb": "3x USB-A 3.0, 1x USB-C", "red": "RJ-45 Gigabit", "audio": "Combo 3.5 mm"}'::jsonb
  ),
  (
    'KIN-SKC100G3-512G',
    'Kingston Canvas Select Plus microSD 512GB Clase 10 UHS-I U3',
    'kingston-canvas-select-plus-microsd-512gb-clase-10-kin-skc100g3-512g',
    'Tarjeta microSD Kingston Canvas Select Plus de 512 GB, Clase 10, UHS-I con velocidades de lectura hasta 100 MB/s y escritura 85 MB/s. Incluye adaptador SD.',
    id_kingston, id_cat_acc, 'Tarjetas de Memoria',
    692.31, ROUND(692.31 * 1.30, 2), 30, NULL,
    85, TRUE, FALSE, FALSE, FALSE,
    0.002, 'https://www.ctonline.mx/images/products/kingston-microsd-512gb.jpg',
    '{"capacidad": "512 GB", "tipo": "microSD", "clase": "Clase 10 UHS-I U3 V30 A1", "velocidad_lectura": "100 MB/s", "velocidad_escritura": "85 MB/s", "incluye": "Adaptador SD", "garantia": "Limitada de por vida"}'::jsonb
  )
  ON CONFLICT (sku_ct) DO UPDATE
    SET nombre = EXCLUDED.nombre, costo_ct = EXCLUDED.costo_ct,
        precio_publico = EXCLUDED.precio_publico, margen_aplicado = EXCLUDED.margen_aplicado,
        existencia_total = EXCLUDED.existencia_total, activo = EXCLUDED.activo,
        destacado = EXCLUDED.destacado, en_oferta = EXCLUDED.en_oferta,
        fecha_actualizacion = NOW();

END $$;


-- ───────────────────────────────────────────────────────────────────────────
-- 4. INVENTARIO POR ALMACÉN
-- Almacenes CT simulados: GDL (Guadalajara), MTY (Monterrey), CDMX (Central)
-- La existencia_total en products ya fue insertada directamente.
-- Aquí registramos el detalle por almacén para la vista de producto.
-- ON CONFLICT DO UPDATE para idempotencia.
-- ───────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Para cada producto, insertar registros de inventario por almacén.
  -- Distribuimos la existencia_total en 3 almacenes de forma proporcional.

  FOR r IN
    SELECT id, sku_ct, existencia_total FROM products
    WHERE sku_ct IN (
      'HP-LAP-15-EH3001','DELL-INS-15-3535','LEN-IDEA-3-15IAU7',
      'ASUS-VIV-15-X1504VA','ACER-ASP-5-A515-58P','DELL-LAT-5440-I5',
      'HP-290-G9-MT-I5','DELL-OPT-3000-SFF','LEN-THK-M70Q-GEN3',
      'HP-PRODESK-400-G9','EPSON-L3210-ECOTANK','HP-SMART-TANK-520',
      'EPSON-L3250-WIFI','HP-LASERJET-M110W','SAM-MON-F24T450FQN',
      'SAM-MON-LS27C360EANXZA','ASUS-MON-VP249QGR',
      'LOG-MK540-ADV-COMBO','LOG-MX-MASTER-3S','LOG-K380-BT-TECLADO',
      'KIN-KVR32N22S8-8','KIN-KVR32N22D8-16','KIN-KVR48S40BS6-8',
      'SAM-MZ-V8V500B-AM','SAM-MZ-V8V1T0B-AM',
      'KIN-DT100G3-32GBCR','KIN-DT100G3-64GBCR',
      'TPL-ARCHERC6-V4','TPL-TL-SG108-8PORT','TPL-UB500-BT5-ADAPT',
      'LOG-C920-HD-WEBCAM','HP-USB-C-DOCK-G5','KIN-SKC100G3-512G'
    )
  LOOP
    -- CDMX recibe ~50% del stock
    INSERT INTO inventory (product_id, almacen, almacen_nombre, existencia)
    VALUES (r.id, 'CDMX', 'Almacén Central CDMX', FLOOR(r.existencia_total * 0.50))
    ON CONFLICT (product_id, almacen) DO UPDATE
      SET existencia = EXCLUDED.existencia, updated_at = NOW();

    -- GDL recibe ~30% del stock
    INSERT INTO inventory (product_id, almacen, almacen_nombre, existencia)
    VALUES (r.id, 'GDL', 'Almacén Guadalajara', FLOOR(r.existencia_total * 0.30))
    ON CONFLICT (product_id, almacen) DO UPDATE
      SET existencia = EXCLUDED.existencia, updated_at = NOW();

    -- MTY recibe el resto ~20%
    INSERT INTO inventory (product_id, almacen, almacen_nombre, existencia)
    VALUES (r.id, 'MTY', 'Almacén Monterrey', r.existencia_total - FLOOR(r.existencia_total * 0.50) - FLOOR(r.existencia_total * 0.30))
    ON CONFLICT (product_id, almacen) DO UPDATE
      SET existencia = EXCLUDED.existencia, updated_at = NOW();
  END LOOP;
END $$;


-- ───────────────────────────────────────────────────────────────────────────
-- 5. REGISTRO DE SINCRONIZACIÓN SIMULADA
-- Para que el dashboard no muestre "Sin sincronizaciones registradas"
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO sync_logs (
  proceso, estado, productos_procesados, productos_nuevos, productos_actualizados,
  productos_descontinuados, precios_actualizados, mensaje, duracion_segundos,
  archivo_ftp, inicio, fin
) VALUES (
  'seed_datos_prueba',
  'completado',
  30,
  30,
  0,
  0,
  30,
  'Datos de prueba insertados manualmente (seed.sql). 30 productos, 10 marcas, 10 categorías.',
  1.5,
  'seed_datos_prueba.json',
  NOW() - INTERVAL '2 minutes',
  NOW()
);

-- ───────────────────────────────────────────────────────────────────────────
-- 6. VERIFICACIÓN FINAL
-- ───────────────────────────────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM brands      WHERE activo = TRUE)     AS marcas_activas,
  (SELECT COUNT(*) FROM categories  WHERE activo = TRUE)     AS categorias_activas,
  (SELECT COUNT(*) FROM products    WHERE activo = TRUE
                                    AND descontinuado = FALSE) AS productos_activos,
  (SELECT COUNT(*) FROM inventory)                            AS registros_inventario,
  (SELECT COUNT(*) FROM v_products_catalog)                   AS productos_en_catalogo,
  (SELECT COUNT(*) FROM products WHERE destacado = TRUE)      AS productos_destacados,
  (SELECT COUNT(*) FROM products WHERE en_oferta = TRUE)      AS productos_en_oferta;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DEL SEED
-- Resultado esperado:
--   marcas_activas:       10
--   categorias_activas:   >= 10
--   productos_activos:    30
--   registros_inventario: 90  (30 productos x 3 almacenes)
--   productos_en_catalogo: 30
--   productos_destacados:  10
--   productos_en_oferta:    6
-- ═══════════════════════════════════════════════════════════════════════════
