import { type Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/catalog/ProductCard'
import { type ProductCatalog } from '@/types'
import { Search } from 'lucide-react'

interface BuscarPageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateMetadata({ searchParams }: BuscarPageProps): Promise<Metadata> {
  const sp = await searchParams
  const q  = sp.q ?? ''
  return {
    title: q ? `Resultados para "${q}"` : 'Buscar productos',
    description: `Busca equipos de cómputo, laptops, impresoras y accesorios en VICCOM.`,
    robots: 'noindex',
  }
}

export const dynamic = 'force-dynamic'

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  const sp    = await searchParams
  const query = (sp.q ?? '').trim()

  const supabase = await createClient()

  const settingsRes = await supabase
    .from('settings')
    .select('key,value')
    .in('key', ['whatsapp_number'])

  const settings = Object.fromEntries((settingsRes.data ?? []).map((s: any) => [s.key, s.value]))
  const whatsapp = settings['whatsapp_number'] ?? ''

  let products: ProductCatalog[] = []
  let total = 0

  if (query.length >= 2) {
    const { data, count } = await supabase
      .from('v_products_catalog')
      .select('*', { count: 'exact' })
      .or(`nombre.ilike.%${query}%,sku_ct.ilike.%${query}%,subcategoria.ilike.%${query}%`)
      .order('destacado', { ascending: false })
      .order('existencia_total', { ascending: false })
      .limit(48)

    products = (data ?? []) as ProductCatalog[]
    total    = count ?? 0
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-6 h-6 text-[#1B2B6B]" />
          <h1 className="text-2xl font-bold text-[#1B2B6B]">
            {query ? `Resultados para "${query}"` : 'Búsqueda'}
          </h1>
        </div>
        {query && (
          <p className="text-gray-500 text-sm">
            {total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Sin búsqueda */}
      {!query && (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">Escribe algo para buscar</p>
          <p className="text-sm mt-1">Puedes buscar por nombre, marca o SKU</p>
        </div>
      )}

      {/* Sin resultados */}
      {query && products.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">Sin resultados para &quot;{query}&quot;</p>
          <p className="text-sm mt-1">Intenta con otro término o revisa la ortografía.</p>
        </div>
      )}

      {/* Grid de resultados */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} whatsappNumber={whatsapp} />
          ))}
        </div>
      )}
    </div>
  )
}
