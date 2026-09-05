import { type Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/catalog/ProductCard'
import { type ProductCatalog } from '@/types'
import { Search, FolderTree, Tag } from 'lucide-react'

interface BuscarPageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

export async function generateMetadata({ searchParams }: BuscarPageProps): Promise<Metadata> {
  const sp = await searchParams
  const q = sp.q ?? ''
  return {
    title: q ? `Resultados para "${q}"` : 'Buscar productos',
    description: `Busca equipos de cómputo, laptops, impresoras y accesorios en VICCOM.`,
    robots: 'noindex',
  }
}

const SEARCH_CARD_FIELDS =
  'id, sku_ct, nombre, slug, precio_publico, precio_antes, imagen_principal, existencia_total, existencia_tuxtla, en_oferta, fecha_fin_oferta, destacado, marca_id, marca_nombre, marca_slug, categoria_id, categoria_nombre, categoria_slug'

export const dynamic = 'force-dynamic'

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  const sp = await searchParams
  const query = (sp.q ?? '').trim()

  const supabase = await createClient()

  const [settingsRes, searchResultsRes, matchedCategoriesRes, matchedBrandsRes] = await Promise.all([
    supabase.from('settings').select('key,value').in('key', ['whatsapp_number']),

    // 1. Productos coincidentes
    query.length >= 2
      ? supabase
          .from('v_products_catalog')
          .select(SEARCH_CARD_FIELDS, { count: 'exact' })
          .or(
            `nombre.ilike.%${query}%,sku_ct.ilike.%${query}%,subcategoria.ilike.%${query}%,marca_nombre.ilike.%${query}%,categoria_nombre.ilike.%${query}%`
          )
          .order('destacado', { ascending: false })
          .order('existencia_total', { ascending: false })
          .limit(48)
      : Promise.resolve({ data: [], count: 0 }),

    // 2. Categorías relacionadas
    query.length >= 2
      ? supabase
          .from('categories')
          .select('id,nombre,slug,path')
          .eq('activo', true)
          .or(`nombre.ilike.%${query}%,slug.ilike.%${query}%`)
          .order('orden')
          .limit(6)
      : Promise.resolve({ data: [] }),

    // 3. Marcas relacionadas
    query.length >= 2
      ? supabase
          .from('brands')
          .select('id,nombre,slug')
          .eq('activo', true)
          .ilike('nombre', `%${query}%`)
          .limit(6)
      : Promise.resolve({ data: [] }),
  ])

  const settings = Object.fromEntries(((settingsRes as any).data ?? []).map((s: any) => [s.key, s.value]))
  const whatsapp = settings['whatsapp_number'] ?? ''

  const products = (searchResultsRes.data ?? []) as ProductCatalog[]
  const total = searchResultsRes.count ?? 0
  const relatedCategories = (matchedCategoriesRes.data ?? []) as { id: string; nombre: string; slug: string; path?: string }[]
  const relatedBrands = (matchedBrandsRes.data ?? []) as { id: string; nombre: string; slug: string }[]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-6 h-6 text-[#1B2B6B]" />
          <h1 className="text-2xl font-extrabold text-[#1B2B6B]">
            {query ? `Resultados para "${query}"` : 'Búsqueda de Productos'}
          </h1>
        </div>
        {query && (
          <p className="text-gray-500 text-sm">
            {total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Sugerencias de categorías y marcas relacionadas si las hay */}
      {query && (relatedCategories.length > 0 || relatedBrands.length > 0) && (
        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200/80 flex flex-col gap-3 text-xs">
          {relatedCategories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <FolderTree className="w-3.5 h-3.5 text-[#1B2B6B]" />
                Categorías:
              </span>
              {relatedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.path || cat.slug}`}
                  className="px-3 py-1 bg-white hover:bg-[#1B2B6B] hover:text-white text-gray-700 font-medium rounded-lg border border-gray-200 shadow-2xs transition-colors"
                >
                  {cat.nombre}
                </Link>
              ))}
            </div>
          )}

          {relatedBrands.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#CC0000]" />
                Marcas:
              </span>
              {relatedBrands.map((b) => (
                <Link
                  key={b.id}
                  href={`/marca/${b.slug}`}
                  className="px-3 py-1 bg-white hover:bg-[#CC0000] hover:text-white text-gray-700 font-medium rounded-lg border border-gray-200 shadow-2xs transition-colors"
                >
                  {b.nombre}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sin búsqueda */}
      {!query && (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">Escribe algo para buscar</p>
          <p className="text-sm mt-1">Puedes buscar por producto, modelo, marca o código SKU</p>
        </div>
      )}

      {/* Sin resultados */}
      {query && products.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-300" />
          <p className="text-lg font-medium text-gray-700">Sin resultados para &quot;{query}&quot;</p>
          <p className="text-sm mt-1 text-gray-500">
            Intenta buscando palabras más generales (ejemplo: <em>laptop</em>, <em>antivirus</em>, <em>impresora</em>, <em>monitor</em>) o revisa la ortografía.
          </p>
        </div>
      )}

      {/* Grid de resultados */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} whatsappNumber={whatsapp} />
          ))}
        </div>
      )}
    </div>
  )
}
