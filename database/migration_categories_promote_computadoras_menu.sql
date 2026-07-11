-- VICCOM - Ajuste incremental de menu principal
-- Objetivo:
--   - No elimina tablas, productos ni categorias.
--   - Convierte Cables, Componentes y Computadoras en categorias principales.
--   - Oculta Hardware del menu publico sin borrar el registro.
--   - Deja Computadoras con el contenido tipo proveedor:
--     Equipos de computo, Workstations, Apple y Almacenamiento Portatil.

BEGIN;

DO $$
DECLARE
  hardware_id UUID;
BEGIN
  SELECT id INTO hardware_id
  FROM categories
  WHERE slug = 'hardware'
  LIMIT 1;

  IF hardware_id IS NOT NULL THEN
    UPDATE categories
    SET
      parent_id = NULL,
      nivel = 0,
      orden = CASE slug
        WHEN 'cables' THEN 10
        WHEN 'componentes' THEN 20
        WHEN 'computadoras' THEN 30
        ELSE orden
      END,
      activo = TRUE,
      updated_at = NOW()
    WHERE parent_id = hardware_id;

    UPDATE categories
    SET
      activo = FALSE,
      orden = 9999,
      updated_at = NOW()
    WHERE id = hardware_id;
  END IF;
END $$;

SELECT refresh_category_paths();

COMMIT;

-- ROLLBACK MANUAL:
-- Para volver al estado anterior, reactivar Hardware y reasignar Cables,
-- Componentes y Computadoras como hijos de Hardware; luego ejecutar:
-- SELECT refresh_category_paths();
