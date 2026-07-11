-- VICCOM - Seed demo de categorias jerarquicas estilo CT Connect
-- La marca CT solo se usa como referencia de estructura del proveedor.
-- En el sitio publico se muestra VICCOM como negocio.
-- Requisitos:
--   1. Ejecutar migration_categories_hierarchy.sql
--   2. Ejecutar migration_categories_relax_slug_unique.sql
-- No reasigna productos actuales; solo crea arbol de prueba.

BEGIN;

CREATE OR REPLACE FUNCTION seed_ct_demo_category(
  p_name TEXT,
  p_parent_id UUID DEFAULT NULL,
  p_order INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  v_slug TEXT;
  v_parent categories%ROWTYPE;
  v_existing UUID;
  v_id UUID;
  v_nivel INTEGER;
  v_path TEXT;
BEGIN
  v_slug := regexp_replace(
    lower(unaccent(trim(p_name))),
    '[^a-z0-9]+',
    '-',
    'g'
  );
  v_slug := regexp_replace(v_slug, '(^-|-$)', '', 'g');

  SELECT id INTO v_existing
  FROM categories
  WHERE slug = v_slug
    AND (
      (p_parent_id IS NULL AND parent_id IS NULL)
      OR parent_id = p_parent_id
    )
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  IF p_parent_id IS NOT NULL THEN
    SELECT * INTO v_parent FROM categories WHERE id = p_parent_id;
    v_nivel := COALESCE(v_parent.nivel, 0) + 1;
    v_path := COALESCE(v_parent.path, v_parent.slug) || '/' || v_slug;
  ELSE
    v_nivel := 0;
    v_path := v_slug;
  END IF;

  INSERT INTO categories (
    nombre, slug, parent_id, nivel, path, ct_key, ct_parent_key, orden, activo
  ) VALUES (
    trim(p_name),
    v_slug,
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
  workstations UUID;
  apple UUID;
  almacenamiento_portatil UUID;
  impresion UUID;
  software UUID;
BEGIN
  hardware := seed_ct_demo_category('Hardware', NULL, 100);
  cables := seed_ct_demo_category('Cables', hardware, 10);
  PERFORM seed_ct_demo_category('Adaptadores', cables, 1);
  PERFORM seed_ct_demo_category('Cables HDMI', cables, 2);
  PERFORM seed_ct_demo_category('Cables DisplayPort', cables, 3);
  PERFORM seed_ct_demo_category('Cables VGA', cables, 4);
  PERFORM seed_ct_demo_category('Cables USB', cables, 5);

  componentes := seed_ct_demo_category('Componentes', hardware, 20);
  PERFORM seed_ct_demo_category('Memorias RAM', componentes, 1);
  PERFORM seed_ct_demo_category('Discos SSD', componentes, 2);
  PERFORM seed_ct_demo_category('Tarjetas madre', componentes, 3);
  PERFORM seed_ct_demo_category('Procesadores', componentes, 4);
  PERFORM seed_ct_demo_category('Gabinetes', componentes, 5);

  computadoras := seed_ct_demo_category('Computadoras', hardware, 30);
  equipos_computo := seed_ct_demo_category('Equipos de computo', computadoras, 1);
  PERFORM seed_ct_demo_category('Laptops', equipos_computo, 1);
  PERFORM seed_ct_demo_category('Tabletas', equipos_computo, 2);
  PERFORM seed_ct_demo_category('PCs de Escritorio', equipos_computo, 3);
  PERFORM seed_ct_demo_category('All in One', equipos_computo, 4);
  PERFORM seed_ct_demo_category('Mini PC', equipos_computo, 5);
  PERFORM seed_ct_demo_category('Extension de Garantias', equipos_computo, 6);

  workstations := seed_ct_demo_category('Workstations', computadoras, 2);
  PERFORM seed_ct_demo_category('Moviles', workstations, 1);
  PERFORM seed_ct_demo_category('De escritorio', workstations, 2);

  apple := seed_ct_demo_category('Apple', computadoras, 3);
  PERFORM seed_ct_demo_category('MacBook', apple, 1);
  PERFORM seed_ct_demo_category('Ipad', apple, 2);
  PERFORM seed_ct_demo_category('IMac', apple, 3);
  PERFORM seed_ct_demo_category('Audio', apple, 4);

  almacenamiento_portatil := seed_ct_demo_category('Almacenamiento Portatil', computadoras, 4);
  PERFORM seed_ct_demo_category('Gabinetes para discos duros', almacenamiento_portatil, 1);
  PERFORM seed_ct_demo_category('Memorias USB', almacenamiento_portatil, 2);
  PERFORM seed_ct_demo_category('Discos duros externos', almacenamiento_portatil, 3);
  PERFORM seed_ct_demo_category('Memorias Flash', almacenamiento_portatil, 4);
  PERFORM seed_ct_demo_category('Almacenamiento Optico', almacenamiento_portatil, 5);

  impresion := seed_ct_demo_category('Impresion', NULL, 200);
  PERFORM seed_ct_demo_category('Impresoras', impresion, 1);
  PERFORM seed_ct_demo_category('Multifuncionales', impresion, 2);
  PERFORM seed_ct_demo_category('Toner', impresion, 3);
  PERFORM seed_ct_demo_category('Cartuchos', impresion, 4);
  PERFORM seed_ct_demo_category('Consumibles', impresion, 5);

  software := seed_ct_demo_category('Software', NULL, 300);
  PERFORM seed_ct_demo_category('Licencias', software, 1);
  PERFORM seed_ct_demo_category('Antivirus', software, 2);
  PERFORM seed_ct_demo_category('Office', software, 3);
  PERFORM seed_ct_demo_category('Sistemas operativos', software, 4);
END $$;

SELECT refresh_category_paths();

DROP FUNCTION IF EXISTS seed_ct_demo_category(TEXT, UUID, INTEGER);

COMMIT;
