import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buildProductMetadata } from '@/lib/seo'
import { formatCurrency, getProductImageUrl, getAvailabilityLabel, formatDate, getDisplayStock } from '@/lib/utils'
import RecommendedCarousel from '@/components/product/RecommendedCarousel'
import IcecatGallery from '@/components/product/IcecatGallery'
import IcecatSpecs from '@/components/product/IcecatSpecs'
import { type ProductCatalog } from '@/types'
import {
  MessageCircle,
  Tag,
  Package,
  Clock,
  ChevronRight,
  Warehouse,
} from 'lucide-react'

export const revalidate = 300 // Revalidar la caché en segundo plano cada 5 minutos para ahorrar ancho de banda y minutos de Netlify

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase  = await createClient()
  const { data }  = (await supabase
    .from('v_products_catalog')
    .select('nombre,descripcion,imagen_principal,slug,marca_nombre,categoria_nombre')
    .eq('slug', slug)
    .single()) as any

  if (!data) return { title: 'Producto no encontrado' }
  return buildProductMetadata(data)
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase  = await createClient()

  // Producto principal
  const { data: product } = (await supabase
    .from('v_products_catalog')
    .select('*')
    .eq('slug', slug)
    .single()) as any

  if (!product) notFound()

  // Inventario + recomendados + settings en paralelo
  const [inventoryRes, relatedRes, settingsRes] = await Promise.all([
    supabase
      .from('inventory')
      .select('*')
      .eq('product_id', product.id)
      .gt('existencia', 0)
      .order('existencia', { ascending: false }),

    supabase
      .from('v_products_catalog')
      .select('*')
      .neq('id', product.id)
      .gt('existencia_total', 0)
      .order('destacado', { ascending: false })
      .order('existencia_total', { ascending: false })
      .limit(24),

    supabase
      .from('settings')
      .select('key,value')
      .in('key', ['whatsapp_number', 'whatsapp_message']),
  ]) as [any, any, any]

  const inventory = inventoryRes.data ?? []
  const relatedPool = (relatedRes.data ?? []) as ProductCatalog[]
  const related = relatedPool
    .sort((a, b) => {
      const aSameCategory = a.categoria_id === product.categoria_id ? 1 : 0
      const bSameCategory = b.categoria_id === product.categoria_id ? 1 : 0
      if (aSameCategory !== bSameCategory) return bSameCategory - aSameCategory
      return (b.existencia_total ?? 0) - (a.existencia_total ?? 0)
    })
    .slice(0, 16)
  const settings  = Object.fromEntries((settingsRes.data ?? []).map((s: any) => [s.key, s.value]))
  const whatsapp  = settings['whatsapp_number'] ?? ''
  const waMsgBase = settings['whatsapp_message'] ?? 'Hola, me interesa cotizar el producto:'

  // Calcular stock real en vivo sumando los almacenes de la tabla inventory
  const tuxtlaStock = inventory
    .filter((inv: any) => inv.almacen === 'TXA' || inv.almacen === 'TXL')
    .reduce((sum: number, inv: any) => sum + Number(inv.existencia ?? 0), 0)

  // Almacenes de envío nacional autorizados por CT
  const almacenesNacionales = [
    'DFA', 'GDL', 'MTY', 'HMO', 'MID', 'VER', 'PUE', 'LEO', 'QRO', 'SLP', 
    'TOL', 'TRN', 'CUN', 'VHA', 'D2A', 'DFP', 'MOR', 'CHI', 'ZAC', 'AGS',
    'CEL', 'CHI', 'CLN', 'DGO', 'MID', 'OAX', 'PAC', 'SLT', 'VER', 'XLP'
  ]

  const otherStock = inventory
    .filter((inv: any) => almacenesNacionales.includes(inv.almacen))
    .reduce((sum: number, inv: any) => sum + Number(inv.existencia ?? 0), 0)

  const totalLiveStock = tuxtlaStock + otherStock

  const availability = getAvailabilityLabel(totalLiveStock)
  const imageUrl     = getProductImageUrl(product.imagen_principal)
  const stock = getDisplayStock(product.slug, totalLiveStock, tuxtlaStock)
  const detailTone = stock.stockTone

  const waMessage = encodeURIComponent(
    `${waMsgBase}\n\n*${product.nombre}*\nSKU: ${product.sku_ct}\nPrecio: ${formatCurrency(product.precio_publico)}\n\n${process.env.NEXT_PUBLIC_SITE_URL}/producto/${product.slug}`
  )

  // Breadcrumb
  const breadcrumb = [
    { label: 'Inicio', href: '/' },
    { label: 'Catálogo', href: '/catalogo' },
    ...(product.categoria_nombre
      ? [{ label: product.categoria_nombre, href: `/categoria/${product.categoria_slug}` }]
      : []),
    { label: product.nombre, href: '#' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-500 mb-6 flex-wrap">
        {breadcrumb.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
            {idx < breadcrumb.length - 1 ? (
              <Link href={crumb.href} className="hover:text-[#1B2B6B] hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-700 font-medium truncate max-w-xs">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* ─── Galería / Imagen (Icecat integrada) ──────────────────── */}
        <IcecatGallery
          upc={(product.especificaciones as any)?.upc}
          imagenFallback={imageUrl}
          nombreProducto={product.nombre}
        />

        {/* ─── Información ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Marca y categoría */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.marca_nombre && (
              <Link
                href={`/marca/${product.marca_slug}`}
                className="px-3 py-1 rounded-full bg-[#1B2B6B] text-white text-xs font-semibold hover:bg-[#253680] transition-colors"
              >
                {product.marca_nombre}
              </Link>
            )}
            {product.categoria_nombre && (
              <Link
                href={`/categoria/${product.categoria_slug}`}
                className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                {product.categoria_nombre}
              </Link>
            )}
            {product.subcategoria && (
              <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-xs">
                {product.subcategoria}
              </span>
            )}
          </div>

          {/* Nombre */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
            {product.nombre}
          </h1>

          {/* SKU */}
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <Tag className="w-4 h-4" />
            <span>SKU: <span className="font-mono font-semibold text-gray-700">{product.sku_ct}</span></span>
          </p>

          {/* Precio */}
          <div className="bg-gradient-to-r from-[#1B2B6B] to-[#253680] rounded-xl p-5 text-white">
            <p className="text-sm text-blue-200 mb-1">Precio público</p>
            <p className="text-4xl font-extrabold">{formatCurrency(product.precio_publico)}</p>
            <p className="text-xs text-blue-200 mt-1">IVA incluido · Precio sujeto a cambio sin previo aviso</p>
          </div>

          {/* Disponibilidad */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
              detailTone === 'green'
                ? 'bg-green-50 text-green-700'
                : detailTone === 'amber'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
            }`}>
              <Package className="w-4 h-4" />
              {availability.label}
              {totalLiveStock > 0 && (
                <span className="text-xs font-normal">
                  (Tuxtla {stock.displayTuxtlaStock} [Sobre pedido {stock.displayOtherStock}] · {totalLiveStock} uds.)
                </span>
              )}
            </div>
          </div>

          {/* Almacenes con existencia */}
          {totalLiveStock > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Warehouse className="w-4 h-4" />
                Disponibilidad por almacén
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tuxtla Gutiérrez, Chiapas</span>
                  <span className={`font-semibold ${stock.displayTuxtlaStock > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                    {stock.displayTuxtlaStock} uds.
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Disponible sobre pedido</span>
                  <span className={`font-semibold ${stock.displayOtherStock > 0 ? 'text-amber-700' : 'text-gray-500'}`}>
                    {stock.displayOtherStock} uds.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-base transition-all hover:shadow-lg hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                Solicitar cotización WhatsApp
              </a>
            )}
            <a
              href={`mailto:vic_computo@hotmail.com?subject=Cotización: ${product.nombre}&body=Hola, me interesa cotizar el producto: ${product.nombre} (SKU: ${product.sku_ct})`}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-[#1B2B6B] text-[#1B2B6B] font-bold hover:bg-[#1B2B6B] hover:text-white transition-all"
            >
              Cotizar por Email
            </a>
          </div>

          {/* Última actualización */}
          <p className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            Actualizado: {formatDate(product.fecha_actualizacion, true)}
          </p>
        </div>
      </div>

      {/* ─── Descripción ────────────────────────────────────────────── */}
      {product.descripcion && (
        <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-[#1B2B6B] mb-4">Descripción</h2>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {product.descripcion}
          </div>
        </section>
      )}

      {/* ─── Ficha Técnica Extendida (Icecat) ─────────────────────────── */}
      <IcecatSpecs 
        upc={(product.especificaciones as any)?.upc} 
        fichaTecnicaCt={(product.especificaciones as any)?.ficha_tecnica}
      />

      {/* ─── Recomendado para ti ─────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mb-8">
          <RecommendedCarousel products={related} />
        </section>
      )}

    </div>
  )
}
