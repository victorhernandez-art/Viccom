import { type Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import FilterSidebar from '@/components/catalog/FilterSidebar'
import SortSelect from '@/components/catalog/SortSelect'
import ProductCard from '@/components/catalog/ProductCard'
import Pagination from '@/components/catalog/Pagination'
import { type Category, type Brand, type ProductCatalog, type CatalogFilters, type CatalogSortOption } from '@/types'
import { buildMetadata } from '@/lib/seo'
import { formatNumber } from '@/lib/utils'
import { Package } from 'lucide-react'

export const metadata: Metadata = buildMetadata({
  title: 'Catálogo de Productos',
  description: 'Explora nuestro catálogo completo de equipos de cómputo, laptops, impresoras, accesorios y más.',
  canonical: '/catalogo',
})

export const dynamic = 'force-dynamic'

interface CatalogoPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const PAGE_SIZE = 24

function parseFilters(sp: Record<string, string | string[] | undefined>): CatalogFilters {
  const get = (key: string) => (Array.isArray(sp[key]) ? sp[key][0] : sp[key]) ?? ''
  return {
    query:       get('q') || undefined,
    marcas:      get('marcas')     ? get('marcas').split(',').filter(Boolean)     : undefined,
    categorias:  get('categorias') ? get('categorias').split(',').filter(Boolean) : undefined,
    precio_min:  get('precio_min') ? Number(get('precio_min'))  : undefined,
    precio_max:  get('precio_max') ? Number(get('precio_max'))  : undefined,
    disponible:  get('disponible') === 'true',
    destacado:   get('destacado')  === 'true',
    en_oferta:   get('en_oferta')  === 'true',
    orderBy:     (get('orderBy') as CatalogSortOption) || 'relevancia',
    page:        get('page') ? Number(get('page')) : 1,
    pageSize:    PAGE_SIZE,
  }
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const sp      = await searchParams
  const filters = parseFilters(sp)
  const page    = filters.page ?? 1
  const offset  = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  // Cargar marcas, categorías y settings en paralelo
  const [brandsRes, categoriesRes, settingsRes] = await Promise.all([
    supabase.from('brands').select('*').eq('activo', true).order('nombre'),
    supabase.from('categories').select('*').eq('activo', true).order('orden'),
    supabase.from('settings').select('key,value').in('key', ['whatsapp_number']),
  ])

  const brands     = (brandsRes.data     ?? []) as Brand[]
  const categories = (categoriesRes.data ?? []) as Category[]
  const settings   = Object.fromEntries((settingsRes.data ?? []).map((s: any) => [s.key, s.value]))
  const whatsapp   = settings['whatsapp_number'] ?? ''

  // Construir query de productos
  let query = supabase
    .from('v_products_catalog')
    .select('*', { count: 'exact' })

  // Filtros
  if (filters.disponible) query = query.gt('existencia_total', 0)
  if (filters.destacado)  query = query.eq('destacado', true)
  if (filters.en_oferta)  query = query.eq('en_oferta', true)
  if (filters.precio_min) query = query.gte('precio_publico', filters.precio_min)
  if (filters.precio_max) query = query.lte('precio_publico', filters.precio_max)

  if (filters.marcas?.length) {
    const marcaSlugs = filters.marcas
    const brandIds   = brands.filter(b => marcaSlugs.includes(b.slug)).map(b => b.id)
    if (brandIds.length) query = query.in('marca_id', brandIds)
  }

  if (filters.categorias?.length) {
    const selectedCategoryKeys = filters.categorias
    const selectedCategories = categories.filter(c =>
      selectedCategoryKeys.includes(c.path || c.slug) || selectedCategoryKeys.includes(c.slug)
    )
    const descendantIds = new Set<string>()

    for (const category of selectedCategories) {
      const { data: rows } = await supabase.rpc('get_category_descendants', {
        p_category_id: category.id,
      } as any)
      ;((rows ?? []) as { id: string }[]).forEach(row => descendantIds.add(row.id))
    }

    selectedCategories.forEach(c => descendantIds.add(c.id))
    const catIds = [...descendantIds]
    if (catIds.length) query = query.in('categoria_id', catIds)
  }

  if (filters.query) {
    query = query.ilike('nombre', `%${filters.query}%`)
  }

  // Ordenamiento
  switch (filters.orderBy) {
    case 'precio_asc':     query = query.order('precio_publico', { ascending: true }); break
    case 'precio_desc':    query = query.order('precio_publico', { ascending: false }); break
    case 'recientes':      query = query.order('fecha_actualizacion', { ascending: false }); break
    case 'disponibilidad': query = query.order('existencia_total', { ascending: false }); break
    case 'nombre_asc':     query = query.order('nombre', { ascending: true }); break
    default:               query = query.order('destacado', { ascending: false })
                                         .order('existencia_total', { ascending: false })
  }

  const { data, count, error } = await query.range(offset, offset + PAGE_SIZE - 1)
  const products   = (data ?? []) as ProductCatalog[]
  const total      = count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const activeFilterCount =
    (filters.query ? 1 : 0) +
    (filters.marcas?.length ?? 0) +
    (filters.categorias?.length ?? 0) +
    (filters.precio_min ? 1 : 0) +
    (filters.precio_max ? 1 : 0) +
    (filters.disponible ? 1 : 0) +
    (filters.destacado ? 1 : 0) +
    (filters.en_oferta ? 1 : 0)

  // Título dinámico de la página
  let pageTitle = 'Catálogo de Productos'
  if (filters.query)        pageTitle = `Resultados para "${filters.query}"`
  if (filters.destacado)    pageTitle = 'Productos Destacados'
  if (filters.en_oferta)    pageTitle = 'Ofertas Especiales'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1B2B6B]">{pageTitle}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {error
            ? 'Error al cargar productos'
            : `${formatNumber(total)} producto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
        </p>
        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {filters.query && (
              <span className="inline-flex items-center rounded-full bg-blue-50 text-[#1B2B6B] border border-blue-100 px-3 py-1 text-xs font-medium">
                Busqueda: {filters.query}
              </span>
            )}
            {filters.disponible && (
              <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-100 px-3 py-1 text-xs font-medium">
                Solo disponibles
              </span>
            )}
            {filters.destacado && (
              <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 text-xs font-medium">
                Destacados
              </span>
            )}
            {filters.en_oferta && (
              <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 border border-red-100 px-3 py-1 text-xs font-medium">
                En oferta
              </span>
            )}
            {(filters.precio_min || filters.precio_max) && (
              <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 text-xs font-medium">
                Precio: {filters.precio_min ? `$${formatNumber(filters.precio_min)}` : '$0'} - {filters.precio_max ? `$${formatNumber(filters.precio_max)}` : 'max'}
              </span>
            )}
            <Link
              href="/catalogo"
              className="inline-flex items-center rounded-full bg-white text-gray-600 border border-gray-200 px-3 py-1 text-xs font-semibold hover:bg-gray-50"
            >
              Limpiar filtros
            </Link>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar de filtros */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <FilterSidebar
              categories={categories}
              brands={brands}
              filters={filters}
            />
          </div>
        </aside>

        {/* Área principal */}
        <div className="flex-1 min-w-0">
          {/* Barra superior: ordenamiento y conteo */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-gray-200 px-4 py-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              Página {page} de {totalPages || 1}
            </span>
            <SortSelect value={filters.orderBy} />
          </div>

          {/* Grid de productos */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    whatsappNumber={whatsapp}
                  />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={total}
              />
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-500 font-semibold">Sin resultados</h3>
              <p className="text-gray-400 text-sm mt-1">
                Intenta con otros filtros o términos de búsqueda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
