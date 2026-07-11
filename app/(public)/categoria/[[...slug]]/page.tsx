import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buildCategoryMetadata } from '@/lib/seo'
import { formatNumber } from '@/lib/utils'
import ProductCard from '@/components/catalog/ProductCard'
import Pagination from '@/components/catalog/Pagination'
import SortSelect from '@/components/catalog/SortSelect'
import { type ProductCatalog, type CatalogSortOption } from '@/types'

const PAGE_SIZE = 24

interface CategoryPageProps {
  params: Promise<{ slug?: string[] }>
  searchParams: Promise<Record<string, string | undefined>>
}

function getPath(slug?: string[]): string {
  return (slug ?? []).map(part => part.trim()).filter(Boolean).join('/')
}

async function getCategoryByPathOrLegacySlug(supabase: any, path: string) {
  const byPath = await supabase
    .from('categories')
    .select('*')
    .eq('path', path)
    .eq('activo', true)
    .maybeSingle()

  if (byPath.data || path.includes('/')) {
    return byPath
  }

  return supabase
    .from('categories')
    .select('*')
    .eq('slug', path)
    .eq('activo', true)
    .maybeSingle()
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const path = getPath(slug)
  if (!path) return { title: 'Categoria no encontrada' }

  const supabase = await createClient()
  const { data } = await getCategoryByPathOrLegacySlug(supabase, path)

  if (!data) return { title: 'Categoria no encontrada' }
  return buildCategoryMetadata(data as any)
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const path = getPath(slug)
  if (!path) notFound()

  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const orderBy = (sp.orderBy ?? 'relevancia') as CatalogSortOption
  const offset = (page - 1) * PAGE_SIZE
  const supabase = await createClient()

  const [categoryRes, settingsRes] = await Promise.all([
    getCategoryByPathOrLegacySlug(supabase, path),
    supabase
      .from('settings')
      .select('key,value')
      .in('key', ['whatsapp_number']),
  ]) as [any, any]

  if (!categoryRes.data) notFound()

  const category = categoryRes.data as any
  const settings = Object.fromEntries((settingsRes.data ?? []).map((s: any) => [s.key, s.value]))
  const whatsapp = settings['whatsapp_number'] ?? ''

  const { data: descendantRows } = await supabase.rpc('get_category_descendants', {
    p_category_id: category.id,
  } as any)
  const categoryIds = ((descendantRows ?? []) as { id: string }[]).map(row => row.id)

  let query = supabase
    .from('v_products_catalog')
    .select('*', { count: 'exact' })

  if (categoryIds.length > 0) {
    query = query.in('categoria_id', categoryIds)
  } else {
    query = query.eq('categoria_id', category.id)
  }

  switch (orderBy) {
    case 'precio_asc':     query = query.order('precio_publico', { ascending: true }); break
    case 'precio_desc':    query = query.order('precio_publico', { ascending: false }); break
    case 'recientes':      query = query.order('fecha_actualizacion', { ascending: false }); break
    case 'disponibilidad': query = query.order('existencia_total', { ascending: false }); break
    case 'nombre_asc':     query = query.order('nombre', { ascending: true }); break
    default:               query = query.order('destacado', { ascending: false }).order('existencia_total', { ascending: false })
  }

  const { data, count } = await query.range(offset, offset + PAGE_SIZE - 1)
  const products = (data ?? []) as ProductCatalog[]
  const total = count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const parts = path.split('/')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1 text-xs text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#1B2B6B] hover:underline">Inicio</Link>
        <span className="text-gray-300">/</span>
        <Link href="/catalogo" className="hover:text-[#1B2B6B] hover:underline">Catalogo</Link>
        {parts.map((part, index) => {
          const href = `/categoria/${parts.slice(0, index + 1).join('/')}`
          const isLast = index === parts.length - 1
          return (
            <span key={href} className="flex items-center gap-1">
              <span className="text-gray-300">/</span>
              {isLast ? (
                <span className="text-gray-700 font-medium">{category.nombre}</span>
              ) : (
                <Link href={href} className="hover:text-[#1B2B6B] hover:underline">
                  {part}
                </Link>
              )}
            </span>
          )
        })}
      </nav>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1B2B6B] mb-2">
          {category.nombre}
        </h1>
        {category.descripcion && (
          <p className="text-gray-500 text-sm max-w-2xl">{category.descripcion}</p>
        )}
        <p className="text-gray-400 text-sm mt-3">{formatNumber(total)} productos disponibles</p>
      </div>

      <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-gray-200 px-4 py-3">
        <span className="text-sm text-gray-500">
          Pagina {page} de {totalPages || 1}
        </span>
        <SortSelect value={orderBy} />
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} whatsappNumber={whatsapp} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} totalItems={total} />
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center text-gray-400">
          Sin productos en esta categoria aun.
        </div>
      )}
    </div>
  )
}
