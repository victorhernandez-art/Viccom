-- VICCOM - Organizacion incremental de categorias para menu tipo proveedor
-- Objetivo:
--   - No elimina tablas ni productos.
--   - Reutiliza categorias actuales cuando existen productos asociados.
--   - Mueve Laptops debajo de Hardware > Computadoras > Equipos de computo.
--   - Mantiene la compatibilidad de productos porque products.categoria_id no cambia.

BEGIN;

CREATE OR REPLACE FUNCTION viccom_seed_category(
  p_name TEXT,
  p_slug TEXT,
  p_parent_id UUID DEFAULT NULL,
  p_order INTEGER DEFAULT 0,
  p_reuse_existing_slug BOOLEAN DEFAULT TRUE
) RETURNS UUID AS $$
DECLARE
  v_existing UUID;
  v_id UUID;
  v_parent categories%ROWTYPE;
  v_nivel INTEGER;
  v_path TEXT;
BEGIN
  SELECT id INTO v_existing
  FROM categories
  WHERE slug = p_slug
    AND (
      (p_parent_id IS NULL AND parent_id IS NULL)
      OR parent_id = p_parent_id
    )
  LIMIT 1;

  IF v_existing IS NULL AND p_reuse_existing_slug THEN
    SELECT id INTO v_existing
    FROM categories
    WHERE slug = p_slug
    LIMIT 1;
  END IF;

  IF p_parent_id IS NOT NULL THEN
    SELECT * INTO v_parent FROM categories WHERE id = p_parent_id;
    v_nivel := COALESCE(v_parent.nivel, 0) + 1;
    v_path := COALESCE(v_parent.path, v_parent.slug) || '/' || p_slug;
  ELSE
    v_nivel := 0;
    v_path := p_slug;
  END IF;

  IF v_existing IS NOT NULL THEN
    UPDATE categories
    SET
      nombre = p_name,
      parent_id = p_parent_id,
      nivel = v_nivel,
      path = v_path,
      ct_key = COALESCE(NULLIF(ct_key, ''), v_path),
      ct_parent_key = CASE
        WHEN p_parent_id IS NULL THEN NULL
        ELSE COALESCE(v_parent.path, v_parent.slug)
      END,
      orden = p_order,
      activo = TRUE,
      updated_at = NOW()
    WHERE id = v_existing
    RETURNING id INTO v_id;

    RETURN v_id;
  END IF;

  INSERT INTO categories (
    nombre, slug, parent_id, nivel, path, ct_key, ct_parent_key, orden, activo
  ) VALUES (
    p_name,
    p_slug,
    p_parent_id,
    v_nivel,
    v_path,
    v_path,
    CASE WHEN p_parent_id IS NULL THEN NULL ELSE COALESCE(v_parent.path, v_parent.slug) END,
    p_order,
    TRUE
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  hardware UUID;
  cables UUID;
  componentes UUID;
  computadoras UUID;
  equipos_computo UUID;
  pcs_escritorio UUID;
  tabletas UUID;
  workstations UUID;
  apple UUID;
  almacenamiento_portatil UUID;
BEGIN
  hardware := viccom_seed_category('Hardware', 'hardware', NULL, 10, TRUE);

  cables := viccom_seed_category('Cables', 'cables', hardware, 10, TRUE);
  PERFORM viccom_seed_category('Adaptadores', 'adaptadores', cables, 1, TRUE);
  PERFORM viccom_seed_category('Cables HDMI', 'cables-hdmi', cables, 2, TRUE);
  PERFORM viccom_seed_category('Cables DisplayPort', 'cables-displayport', cables, 3, TRUE);
  PERFORM viccom_seed_category('Cables VGA', 'cables-vga', cables, 4, TRUE);
  PERFORM viccom_seed_category('Cables USB', 'cables-usb', cables, 5, TRUE);

  componentes := viccom_seed_category('Componentes', 'componentes', hardware, 20, TRUE);
  PERFORM viccom_seed_category('Memorias RAM', 'memorias-ram', componentes, 1, TRUE);
  PERFORM viccom_seed_category('Discos SSD', 'discos-ssd', componentes, 2, TRUE);
  PERFORM viccom_seed_category('Tarjetas madre', 'tarjetas-madre', componentes, 3, TRUE);
  PERFORM viccom_seed_category('Procesadores', 'procesadores', componentes, 4, TRUE);
  PERFORM viccom_seed_category('Gabinetes', 'gabinetes', componentes, 5, TRUE);

  computadoras := viccom_seed_category('Computadoras', 'computadoras', hardware, 30, TRUE);

  equipos_computo := viccom_seed_category('Equipos de computo', 'equipos-de-computo', computadoras, 1, TRUE);
  PERFORM viccom_seed_category('Laptops', 'laptops', equipos_computo, 1, TRUE);

  SELECT id INTO tabletas
  FROM categories
  WHERE slug IN ('tabletas', 'tablets')
  ORDER BY CASE WHEN slug = 'tablets' THEN 0 ELSE 1 END
  LIMIT 1;

  IF tabletas IS NOT NULL THEN
    UPDATE categories
    SET
      nombre = 'Tabletas',
      slug = 'tabletas',
      parent_id = equipos_computo,
      nivel = 3,
      path = 'hardware/computadoras/equipos-de-computo/tabletas',
      ct_key = COALESCE(NULLIF(ct_key, ''), 'hardware/computadoras/equipos-de-computo/tabletas'),
      ct_parent_key = 'hardware/computadoras/equipos-de-computo',
      orden = 2,
      activo = TRUE,
      updated_at = NOW()
    WHERE id = tabletas;
  ELSE
    PERFORM viccom_seed_category('Tabletas', 'tabletas', equipos_computo, 2, TRUE);
  END IF;

  SELECT id INTO pcs_escritorio
  FROM categories
  WHERE slug IN ('pcs-de-escritorio', 'computadoras-escritorio')
  ORDER BY CASE WHEN slug = 'computadoras-escritorio' THEN 0 ELSE 1 END
  LIMIT 1;

  IF pcs_escritorio IS NOT NULL THEN
    UPDATE categories
    SET
      nombre = 'PCs de Escritorio',
      slug = 'pcs-de-escritorio',
      parent_id = equipos_computo,
      nivel = 3,
      path = 'hardware/computadoras/equipos-de-computo/pcs-de-escritorio',
      ct_key = COALESCE(NULLIF(ct_key, ''), 'hardware/computadoras/equipos-de-computo/pcs-de-escritorio'),
      ct_parent_key = 'hardware/computadoras/equipos-de-computo',
      orden = 3,
      activo = TRUE,
      updated_at = NOW()
    WHERE id = pcs_escritorio;
  ELSE
    PERFORM viccom_seed_category('PCs de Escritorio', 'pcs-de-escritorio', equipos_computo, 3, TRUE);
  END IF;

  PERFORM viccom_seed_category('All in One', 'all-in-one', equipos_computo, 4, TRUE);
  PERFORM viccom_seed_category('Mini PC', 'mini-pc', equipos_computo, 5, TRUE);
  PERFORM viccom_seed_category('Extension de Garantias', 'extension-de-garantias', equipos_computo, 6, TRUE);

  workstations := viccom_seed_category('Workstations', 'workstations', computadoras, 2, TRUE);
  PERFORM viccom_seed_category('Moviles', 'moviles', workstations, 1, TRUE);
  PERFORM viccom_seed_category('De escritorio', 'de-escritorio', workstations, 2, TRUE);

  apple := viccom_seed_category('Apple', 'apple', computadoras, 3, TRUE);
  PERFORM viccom_seed_category('MacBook', 'macbook', apple, 1, TRUE);
  PERFORM viccom_seed_category('Ipad', 'ipad', apple, 2, TRUE);
  PERFORM viccom_seed_category('IMac', 'imac', apple, 3, TRUE);
  PERFORM viccom_seed_category('Audio', 'audio', apple, 4, TRUE);

  almacenamiento_portatil := viccom_seed_category('Almacenamiento Portatil', 'almacenamiento-portatil', computadoras, 4, TRUE);
  PERFORM viccom_seed_category('Gabinetes para discos duros', 'gabinetes-para-discos-duros', almacenamiento_portatil, 1, TRUE);
  PERFORM viccom_seed_category('Memorias USB', 'memorias-usb', almacenamiento_portatil, 2, TRUE);
  PERFORM viccom_seed_category('Discos duros externos', 'discos-duros-externos', almacenamiento_portatil, 3, TRUE);
  PERFORM viccom_seed_category('Memorias Flash', 'memorias-flash', almacenamiento_portatil, 4, TRUE);
  PERFORM viccom_seed_category('Almacenamiento Optico', 'almacenamiento-optico', almacenamiento_portatil, 5, TRUE);
END $$;

SELECT refresh_category_paths();

DROP FUNCTION IF EXISTS viccom_seed_category(TEXT, TEXT, UUID, INTEGER, BOOLEAN);

COMMIT;

-- ROLLBACK MANUAL:
-- Esta migracion reubica categorias existentes para conservar productos.
-- Para revertir una categoria concreta, actualizar parent_id = NULL y ejecutar:
-- SELECT refresh_category_paths();
