import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buildBrandMetadata } from '@/lib/seo'
import { formatNumber } from '@/lib/utils'
import ProductCard from '@/components/catalog/ProductCard'
import Pagination from '@/components/catalog/Pagination'
import SortSelect from '@/components/catalog/SortSelect'
import { type ProductCatalog, type CatalogSortOption } from '@/types'
import { ChevronRight } from 'lucide-react'

const PAGE_SIZE = 24

interface BrandPageProps {
  params:       Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase  = await createClient()
  const { data }  = await supabase.from('brands').select('*').eq('slug', slug).single()
  if (!data) return { title: 'Marca no encontrada' }
  return buildBrandMetadata(data)
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug }  = await params
  const sp        = await searchParams
  const page      = Number(sp.page ?? 1)
  const orderBy   = (sp.orderBy ?? 'relevancia') as CatalogSortOption
  const offset    = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  const [brandRes, settingsRes] = await Promise.all([
    supabase.from('brands').select('*').eq('slug', slug).eq('activo', true).single(),
    supabase.from('settings').select('key,value').in('key', ['whatsapp_number']),
  ])

  if (!brandRes.data) notFound()
  const brand    = brandRes.data
  const settings = Object.fromEntries((settingsRes.data ?? []).map((s: any) => [s.key, s.value]))
  const whatsapp = settings['whatsapp_number'] ?? ''

  let query = supabase
    .from('v_products_catalog')
    .select('*', { count: 'exact' })
    .eq('marca_id', brand.id)

  switch (orderBy) {
    case 'precio_asc':     query = query.order('precio_publico', { ascending: true }); break
    case 'precio_desc':    query = query.order('precio_publico', { ascending: false }); break
    case 'recientes':      query = query.order('fecha_actualizacion', { ascending: false }); break
    case 'disponibilidad': query = query.order('existencia_total', { ascending: false }); break
    default:               query = query.order('destacado', { ascending: false }).order('existencia_total', { ascending: false })
  }

  const { data, count } = await query.range(offset, offset + PAGE_SIZE - 1)
  const products   = (data ?? []) as ProductCatalog[]
  const total      = count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#1B2B6B] hover:underline">Inicio</Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <Link href="/catalogo" className="hover:text-[#1B2B6B] hover:underline">Catálogo</Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-gray-700 font-medium">{brand.nombre}</span>
      </nav>

      {/* Encabezado de marca */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-8 flex items-center gap-6">
        {brand.logo_url ? (
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image src={brand.logo_url} alt={brand.nombre} fill className="object-contain" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl bg-[#1B2B6B] flex items-center justify-center text-white font-extrabold text-3xl flex-shrink-0">
            {brand.nombre.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-extrabold text-[#1B2B6B]">{brand.nombre}</h1>
          {brand.descripcion && (
            <p className="text-gray-500 text-sm mt-1">{brand.descripcion}</p>
          )}
          <p className="text-gray-400 text-sm mt-2">{formatNumber(total)} productos</p>
        </div>
      </div>

      {/* Barra ordenamiento */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-gray-200 px-4 py-3">
        <span className="text-sm text-gray-500">Página {page} de {totalPages || 1}</span>
        <SortSelect value={orderBy} />
      </div>

      {/* Grid */}
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
          Sin productos de esta marca aún.
        </div>
      )}
    </div>
  )
}
