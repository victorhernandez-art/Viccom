-- VICCOM - Raices visibles del mega menu como referencia del proveedor
-- Objetivo:
--   - No elimina tablas, productos ni categorias.
--   - Ordena las categorias principales visibles del mega menu.
--   - Reutiliza categorias existentes cuando aplica.
--   - Oculta categorias raiz antiguas que no forman parte del menu principal.

BEGIN;

CREATE OR REPLACE FUNCTION viccom_upsert_root_category(
  p_name TEXT,
  p_slug TEXT,
  p_order INTEGER,
  p_alias_slugs TEXT[] DEFAULT ARRAY[]::TEXT[]
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id
  FROM categories
  WHERE slug = p_slug
     OR slug = ANY(p_alias_slugs)
  ORDER BY CASE WHEN slug = p_slug THEN 0 ELSE 1 END
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    UPDATE categories
    SET
      nombre = p_name,
      slug = p_slug,
      parent_id = NULL,
      nivel = 0,
      path = p_slug,
      ct_parent_key = NULL,
      orden = p_order,
      activo = TRUE,
      updated_at = NOW()
    WHERE id = v_id
    RETURNING id INTO v_id;

    RETURN v_id;
  END IF;

  INSERT INTO categories (
    nombre, slug, parent_id, nivel, path, ct_key, ct_parent_key, orden, activo
  ) VALUES (
    p_name, p_slug, NULL, 0, p_slug, p_slug, NULL, p_order, TRUE
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  PERFORM viccom_upsert_root_category('Computadoras', 'computadoras', 10);
  PERFORM viccom_upsert_root_category('Impresión', 'impresion', 20, ARRAY['impresoras']);
  PERFORM viccom_upsert_root_category('Electrónica', 'electronica', 30);
  PERFORM viccom_upsert_root_category('Cables', 'cables', 40);
  PERFORM viccom_upsert_root_category('Componentes', 'componentes', 50);
  PERFORM viccom_upsert_root_category('Conectividad', 'conectividad', 60, ARRAY['redes']);
  PERFORM viccom_upsert_root_category('Energía', 'energia', 70);
  PERFORM viccom_upsert_root_category('Gaming', 'gaming', 80);
  PERFORM viccom_upsert_root_category('Punto de Venta', 'punto-de-venta', 90);
  PERFORM viccom_upsert_root_category('Hogar y Línea Blanca', 'hogar-y-linea-blanca', 100);
  PERFORM viccom_upsert_root_category('Accesorios', 'accesorios', 110);

  UPDATE categories
  SET
    activo = FALSE,
    updated_at = NOW()
  WHERE parent_id IS NULL
    AND slug IN (
      'hardware',
      'consumibles',
      'monitores',
      'teclados-ratones',
      'almacenamiento',
      'software',
      'servidores',
      'smart-home'
    );
END $$;

SELECT refresh_category_paths();

DROP FUNCTION IF EXISTS viccom_upsert_root_category(TEXT, TEXT, INTEGER, TEXT[]);

COMMIT;

-- ROLLBACK MANUAL:
-- Reactivar las categorias raiz ocultas y ajustar nombres/ordenes manualmente;
-- luego ejecutar:
-- SELECT refresh_category_paths();
