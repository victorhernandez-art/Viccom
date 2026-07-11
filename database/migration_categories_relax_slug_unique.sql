-- VICCOM - Permite slugs repetidos en ramas distintas del arbol de categorias
-- Requiere haber ejecutado migration_categories_hierarchy.sql primero.
-- No elimina tablas ni datos. Solo reemplaza unicidad global por unicidad por rama.

BEGIN;

-- El schema original creo categories.slug como UNIQUE global. Eso impide rutas
-- validas como /categoria/laptops y /categoria/computadoras/laptops al mismo
-- tiempo. La jerarquia debe garantizar unicidad por parent_id, no global.
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_key;

-- Por si la unicidad global existiera como indice y no como constraint.
DROP INDEX IF EXISTS categories_slug_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_root_slug_unique
  ON categories(slug)
  WHERE parent_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_parent_slug_unique
  ON categories(parent_id, slug)
  WHERE parent_id IS NOT NULL;

COMMIT;

-- ROLLBACK MANUAL:
-- Solo ejecutar si no existen slugs repetidos entre ramas.
--
-- BEGIN;
-- DROP INDEX IF EXISTS idx_categories_root_slug_unique;
-- DROP INDEX IF EXISTS idx_categories_parent_slug_unique;
-- ALTER TABLE categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
-- COMMIT;
