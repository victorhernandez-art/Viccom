import { supabaseAdmin } from '../../utils/supabase'
import { slugify }       from '../../utils/slugify'
import { logger }        from '../../utils/logger'

export interface CategoryNode {
  id: string
  nombre: string
  slug: string
  parent_id: string | null
  nivel: number
  path: string
  orden: number
  children: CategoryNode[]
}

interface DbCategory {
  id: string
  nombre: string
  slug: string
  parent_id: string | null
  nivel: number | null
  path: string | null
  orden: number | null
  activo: boolean | null
}

const categoryCache = new Map<string, DbCategory>()

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

function cacheKey(parentId: string | null, slug: string): string {
  return `${parentId ?? 'root'}:${slug}`
}

function buildPath(parent: DbCategory | null, slug: string): string {
  return parent?.path ? `${parent.path}/${slug}` : slug
}

async function getCategoryByParentAndSlug(
  parentId: string | null,
  slug: string
): Promise<DbCategory | null> {
  const key = cacheKey(parentId, slug)
  const cached = categoryCache.get(key)
  if (cached) return cached

  let query = supabaseAdmin
    .from('categories')
    .select('id,nombre,slug,parent_id,nivel,path,orden,activo')
    .eq('slug', slug)
    .limit(1)

  query = parentId ? query.eq('parent_id', parentId) : query.is('parent_id', null)

  const { data, error } = await query.maybeSingle()
  if (error) {
    throw new Error(`Error searching category ${slug}: ${error.message}`)
  }

  if (data) categoryCache.set(key, data as DbCategory)
  return (data as DbCategory | null) ?? null
}

async function insertCategory(
  name: string,
  parent: DbCategory | null,
  order = 0
): Promise<DbCategory> {
  const nombre = normalizeName(name)
  const slug = parent ? `${parent.slug}-${slugify(nombre)}` : slugify(nombre)
  const nivel = parent ? Number(parent.nivel ?? 0) + 1 : 0
  const path = buildPath(parent, slugify(nombre))

  const row = {
    nombre,
    slug,
    parent_id: parent?.id ?? null,
    nivel,
    path,
    ct_key: path,
    ct_parent_key: parent?.path ?? null,
    orden: order,
    activo: true,
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert(row)
    .select('id,nombre,slug,parent_id,nivel,path,orden,activo')
    .single()

  if (error) {
    const existing = await getCategoryByParentAndSlug(parent?.id ?? null, slug)
    if (existing) return existing
    throw new Error(`Error creating category ${path}: ${error.message}`)
  }

  const category = data as DbCategory
  categoryCache.set(cacheKey(parent?.id ?? null, slug), category)
  logger.info(`Created category path: ${path}`)
  return category
}

export async function findOrCreateCategory(name: string, order = 0): Promise<DbCategory> {
  const nombre = normalizeName(name)
  const slug = slugify(nombre)
  if (!slug) throw new Error('Category name is empty')

  const existing = await getCategoryByParentAndSlug(null, slug)
  if (existing) return existing

  return insertCategory(nombre, null, order)
}

export async function findOrCreateSubcategory(
  parent: DbCategory,
  name: string,
  order = 0
): Promise<DbCategory> {
  const nombre = normalizeName(name)
  const slug = `${parent.slug}-${slugify(nombre)}`
  if (!slug) throw new Error('Subcategory name is empty')

  const existing = await getCategoryByParentAndSlug(parent.id, slug)
  if (existing) return existing

  return insertCategory(nombre, parent, order)
}

export async function syncCategoryTreeFromCT(rawPath: string[]): Promise<DbCategory | null> {
  const path = rawPath.map(normalizeName).filter(Boolean)
  if (path.length === 0) return null

  let current = await findOrCreateCategory(path[0], 0)

  for (let i = 1; i < path.length; i++) {
    current = await findOrCreateSubcategory(current, path[i], i)
  }

  return current
}

export async function buildCategoryMenu(): Promise<CategoryNode[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id,nombre,slug,parent_id,nivel,path,orden,activo')
    .eq('activo', true)
    .order('nivel', { ascending: true })
    .order('orden', { ascending: true })
    .order('nombre', { ascending: true })

  if (error) {
    throw new Error(`Error loading category menu: ${error.message}`)
  }

  const byId = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const row of (data ?? []) as DbCategory[]) {
    byId.set(row.id, {
      id: row.id,
      nombre: row.nombre,
      slug: row.slug,
      parent_id: row.parent_id,
      nivel: Number(row.nivel ?? 0),
      path: row.path ?? row.slug,
      orden: Number(row.orden ?? 0),
      children: [],
    })
  }

  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
