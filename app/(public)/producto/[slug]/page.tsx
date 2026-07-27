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

export const revalidate = 300 // Revalidar la caché en segundo plano cada 5 minutos para ahorrar ancho de banda y optimizar el consumo en Vercel

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

  // 1. Mapeo inteligente de categorías complementarias (Cross-selling)
  const crossSellingMap: Record<string, string[]> = {
    'computadoras': ['accesorios-para-computo', 'almacenamiento-portatil', 'cables', 'audio', 'computadoras'],
    'computadoras-gaming': ['accesorios-gaming', 'accesorios-para-computo', 'cables', 'audio', 'computadoras-gaming'],
    'workstations': ['accesorios-para-computo', 'accesorios-para-servidores', 'cables', 'respaldo-y-regulacion'],
    'impresion': ['consumibles', 'accesorios-para-impresion', 'papeleria', 'impresion'],
    'digitalizacion-de-imagenes': ['consumibles', 'papeleria'],
    'electronica': ['energia', 'cables', 'audio', 'baterias-banks'],
    'accesorios-para-electronica': ['energia', 'cables', 'audio', 'baterias-banks'],
    'video-vigilancia': ['cables', 'red-pasiva', 'energia', 'almacenamiento', 'video-vigilancia'],
    'seguridad': ['cables', 'red-pasiva', 'energia', 'almacenamiento', 'seguridad'],
    'solucion-para-servidores': ['accesorios-para-servidores', 'almacenamiento', 'cables', 'respaldo-y-regulacion']
  }

  const currentCatSlug = product.categoria_slug || ''
  const targetCategorySlugs = crossSellingMap[currentCatSlug] || [currentCatSlug]

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
      .in('categoria_slug', targetCategorySlugs)
      .limit(60), // Traer un pool más grande para poder variar diariamente

    supabase
      .from('settings')
      .select('key,value')
      .in('key', ['whatsapp_number', 'whatsapp_message']),
  ]) as [any, any, any]

  const inventory = inventoryRes.data ?? []
  const relatedPool = (relatedRes.data ?? []) as ProductCatalog[]

  // 2. Lógica de Rotación Diaria (Aleatorización Controlada) usando el día del año como semilla
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  
  // Función para ordenar pseudo-aleatoriamente en base a una semilla numérica
  const shuffleWithSeed = (array: any[], seed: number) => {
    let m = array.length, t, i
    while (m) {
      i = Math.floor(Math.abs(Math.sin(seed++)) * m--)
      t = array[m]
      array[m] = array[i]
      array[i] = t
    }
    return array
  }

  // Mezclar el pool de productos de manera fija por cada día
  const shuffledPool = shuffleWithSeed([...relatedPool], dayOfYear)

  // Priorizar productos de categorías diferentes a la actual (accesorios/complementos) sobre la misma categoría, y limitar a 16
  const related = shuffledPool
    .sort((a, b) => {
      const aIsComplement = a.categoria_id !== product.categoria_id ? 1 : 0
      const bIsComplement = b.categoria_id !== product.categoria_id ? 1 : 0
      if (aIsComplement !== bIsComplement) return bIsComplement - aIsComplement
      return (b.existencia_total ?? 0) - (a.existencia_total ?? 0)
    })
    .slice(0, 16)
  const settings  = Object.fromEntries((settingsRes.data ?? []).map((s: any) => [s.key, s.value]))
  const whatsapp  = settings['whatsapp_number'] ?? ''
  const waMsgBase = settings['whatsapp_message'] ?? 'Hola, me interesa cotizar el producto:'

  // Calcular stock real en vivo sumando los almacenes de la tabla inventory
  const tuxtlaStock = inventory
    .filter((inv: any) => inv.almacen === 'TXA')
    .reduce((sum: number, inv: any) => sum + Number(inv.existencia ?? 0), 0)

  // Almacenes de envío nacional: todos los almacenes registrados en Supabase excepto TXA
  const otherStock = inventory
    .filter((inv: any) => inv.almacen !== 'TXA')
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
          <div className="bg-gradient-to-r from-[#1B2B6B] to-[#253680] rounded-xl p-5 text-white relative overflow-hidden">
            {product.en_oferta && (
              <div className="absolute top-0 right-0 bg-[#CC0000] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-sm">
                Promoción
              </div>
            )}
            <p className="text-sm text-blue-200 mb-1">Precio público</p>
            {product.en_oferta && product.precio_antes ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <p className="text-4xl font-extrabold text-white">{formatCurrency(product.precio_publico)}</p>
                  <p className="text-lg text-blue-200/70 line-through decoration-red-500/80 decoration-2">{formatCurrency(product.precio_antes)}</p>
                </div>
                {product.fecha_fin_oferta && (
                  <p className="text-xs text-red-200/90 flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Vigencia hasta el {formatDate(product.fecha_fin_oferta)}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-4xl font-extrabold">{formatCurrency(product.precio_publico)}</p>
            )}
            <p className="text-xs text-blue-200/80 mt-2">IVA incluido · Precio sujeto a cambio sin previo aviso</p>
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
