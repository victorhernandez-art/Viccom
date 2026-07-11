-- ═══════════════════════════════════════════════════════════════════════════
-- VICCOM — Actualiza almacenes del seed para reflejar lógica real:
--   TGZ  = Tuxtla Gutiérrez (sucursal principal) → bandera VERDE
--   CDMX = Ciudad de México  → bandera AMARILLA
--   GDL  = Guadalajara       → bandera AMARILLA
--   MTY  = Monterrey         → bandera AMARILLA
--
-- Productos con stock en TGZ   → Verde  (existencia_total > 5 en demo)
-- Productos sin TGZ pero otros → Amarillo
-- Sin stock en ningún lado     → Gris / sin existencia
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Para cada producto del seed, reasignar almacenes con lógica regional
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
    -- Tuxtla Gutiérrez: ~40% del stock total (sucursal principal)
    INSERT INTO inventory (product_id, almacen, almacen_nombre, existencia)
    VALUES (r.id, 'TGZ', 'Tuxtla Gutiérrez, Chiapas', FLOOR(r.existencia_total * 0.40))
    ON CONFLICT (product_id, almacen) DO UPDATE
      SET almacen_nombre = 'Tuxtla Gutiérrez, Chiapas',
          existencia     = FLOOR(r.existencia_total * 0.40),
          updated_at     = NOW();

    -- Ciudad de México: ~30%
    INSERT INTO inventory (product_id, almacen, almacen_nombre, existencia)
    VALUES (r.id, 'CDMX', 'Ciudad de México', FLOOR(r.existencia_total * 0.30))
    ON CONFLICT (product_id, almacen) DO UPDATE
      SET almacen_nombre = 'Ciudad de México',
          existencia     = FLOOR(r.existencia_total * 0.30),
          updated_at     = NOW();

    -- Guadalajara: ~20%
    INSERT INTO inventory (product_id, almacen, almacen_nombre, existencia)
    VALUES (r.id, 'GDL', 'Guadalajara, Jalisco', FLOOR(r.existencia_total * 0.20))
    ON CONFLICT (product_id, almacen) DO UPDATE
      SET almacen_nombre = 'Guadalajara, Jalisco',
          existencia     = FLOOR(r.existencia_total * 0.20),
          updated_at     = NOW();

    -- Monterrey: resto
    INSERT INTO inventory (product_id, almacen, almacen_nombre, existencia)
    VALUES (r.id, 'MTY', 'Monterrey, Nuevo León',
            r.existencia_total
            - FLOOR(r.existencia_total * 0.40)
            - FLOOR(r.existencia_total * 0.30)
            - FLOOR(r.existencia_total * 0.20))
    ON CONFLICT (product_id, almacen) DO UPDATE
      SET almacen_nombre = 'Monterrey, Nuevo León',
          existencia     = r.existencia_total
                           - FLOOR(r.existencia_total * 0.40)
                           - FLOOR(r.existencia_total * 0.30)
                           - FLOOR(r.existencia_total * 0.20),
          updated_at     = NOW();
  END LOOP;
END $$;

-- ─── Producto demo: SOLO en foráneos (amarillo), sin stock en Tuxtla ────────
-- Usamos el Dell XPS que tiene existencia_total = 0 en products
-- pero le asignamos 3 piezas en CDMX para simular "otras sucursales"
DO $$
DECLARE vid UUID;
BEGIN
  SELECT id INTO vid FROM products WHERE sku_ct = 'DELL-XPS-15-9530-TEST';
  IF vid IS NOT NULL THEN
    -- Sin stock en Tuxtla
    INSERT INTO inventory (product_id, almacen, almacen_nombre, existencia)
    VALUES (vid, 'TGZ',  'Tuxtla Gutiérrez, Chiapas', 0)
    ON CONFLICT (product_id, almacen) DO UPDATE SET existencia = 0, updated_at = NOW();

    -- 3 piezas en CDMX (foráneo → amarillo)
    INSERT INTO inventory (product_id, almacen, almacen_nombre, existencia)
    VALUES (vid, 'CDMX', 'Ciudad de México', 3)
    ON CONFLICT (product_id, almacen) DO UPDATE SET existencia = 3, updated_at = NOW();

    -- Actualizar existencia_total = 3 para que aparezca en catálogo
    UPDATE products SET existencia_total = 3 WHERE id = vid;
  END IF;
END $$;
