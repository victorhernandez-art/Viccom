import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import HeroBanner from '@/components/home/HeroBanner'
import ValueProposition from '@/components/home/ValueProposition'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import { type Category, type ProductCatalog } from '@/types'

export const metadata: Metadata = {
  title: 'VICCOM — Distribuidor de Equipos de Cómputo | Cotiza en Línea',
  description:
    'VICCOM — Tu distribuidor confiable de equipos de cómputo, laptops, impresoras, accesorios y tecnología. Catálogo actualizado con los mejores precios.',
  openGraph: {
    images: [{ url: '/img/logo.png' }],
  },
}

export const revalidate = 300 // revalidar cada 5 minutos

export default async function HomePage() {
  const supabase = await createClient()

  // Obtener datos en paralelo
  // Obtener datos en paralelo
  const [categoriesRes, featuredRes, laptopsRes, othersRes, settingsRes] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true })
      .limit(8),

    supabase
      .from('v_products_catalog')
      .select('*')
      .eq('destacado', true)
      .gt('existencia_total', 0)
      .order('fecha_actualizacion', { ascending: false })
      .limit(10),

    // 1. Laptops baratas en oferta (precio de venta final <= $25,000 MXN)
    supabase
      .from('v_products_catalog')
      .select('*')
      .eq('en_oferta', true)
      .gt('existencia_total', 0)
      .in('categoria_slug', ['computadoras-laptops', 'computadoras-gaming-laptops-gaming'])
      .lte('precio_publico', 25000)
      .limit(60),

    // 2. Otros accesorios y equipos en oferta comunes (Mouses, Teclados, SSDs, Impresoras, Monitores, NoBreaks, Mochilas, Audífonos, etc.)
    supabase
      .from('v_products_catalog')
      .select('*')
      .eq('en_oferta', true)
      .gt('existencia_total', 0)
      .in('categoria_slug', [
        'impresion-multifuncionales',
        'impresion-impresoras',
        'almacenamiento-ssd',
        'accesorios-para-componentes-mouse',
        'accesorios-para-componentes-teclados',
        'accesorios-gaming-mouse-gaming',
        'accesorios-gaming-teclados-gaming',
        'accesorios-para-componentes-kits-para-teclado-y-mouse',
        'ensamble-monitores',
        'computadoras-gaming-monitores-gaming',
        'respaldo-y-regulacion-no-breaks-y-ups',
        'accesorios-para-computo-mochilas-y-maletines',
        'computadoras-pcs-de-escritorio',
        'computadoras-all-in-one',
        'computadoras-tabletas',
        'accesorios-para-electronica-audifonos',
        'accesorios-para-electronica-diademas',
        'electronica-auriculares',
        'accesorios-gaming-gabinetes-gaming',
        'electronica-proyectores'
      ])
      .limit(150),

    supabase
      .from('settings')
      .select('key,value')
      .in('key', ['whatsapp_number']),
  ]) as [any, any, any, any, any]

  const categories    = (categoriesRes.data ?? []) as Category[]
  const featuredProds = (featuredRes.data  ?? []) as ProductCatalog[]
  
  // Rotación dinámica cada 24 horas basada en la fecha del día actual
  const rawLaptops = (laptopsRes.data ?? []) as ProductCatalog[]
  const rawOthers  = (othersRes.data  ?? []) as ProductCatalog[]

  const todayStr = new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
  
  // LCG (Linear Congruential Generator) simple para barajar de forma determinista por día
  const createRandom = (seedStr: string) => {
    let seed = 0
    for (let i = 0; i < seedStr.length; i++) {
      seed = (seed << 5) - seed + seedStr.charCodeAt(i)
      seed |= 0
    }
    return () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
  }

  const randLaptops = createRandom(todayStr + '_laptops_viccom')
  const randOthers  = createRandom(todayStr + '_others_viccom')

  function shuffle<T>(array: T[], randomFn: () => number): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(randomFn() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const laptopsPool = shuffle(rawLaptops, randLaptops)
  const othersPool  = shuffle(rawOthers, randOthers)

  // Intercalar Laptops <= $25k y Accesorios para dar variedad y precios accesibles
  const offersProds: ProductCatalog[]  = []
  const maxLen = Math.max(laptopsPool.length, othersPool.length)
  
  for (let i = 0; i < maxLen; i++) {
    if (laptopsPool[i]) {
      offersProds.push(laptopsPool[i])
    }
    if (othersPool[i * 2]) {
      offersProds.push(othersPool[i * 2])
    }
    if (othersPool[i * 2 + 1]) {
      offersProds.push(othersPool[i * 2 + 1])
    }
  }

  const finalOffersProds = offersProds.slice(0, 12)

  const settings     = Object.fromEntries(
    (settingsRes.data ?? []).map((s: any) => [s.key, s.value])
  )
  const whatsapp = settings['whatsapp_number'] ?? ''

  return (
    <>
      <HeroBanner />
      <ValueProposition />
      <CategoryGrid categories={categories} />

      {featuredProds.length > 0 && (
        <FeaturedProducts
          products={featuredProds}
          title="Productos Destacados"
          subtitle="Los equipos más populares en VICCOM"
          viewAllLink="/catalogo?destacado=true"
          whatsappNumber={whatsapp}
        />
      )}

      {finalOffersProds.length > 0 && (
        <FeaturedProducts
          products={finalOffersProds}
          title="Ofertas Especiales"
          subtitle="Aprovecha los mejores precios"
          viewAllLink="/catalogo?en_oferta=true"
          whatsappNumber={whatsapp}
        />
      )}

      {/* CTA WhatsApp */}
      <section className="py-16 bg-gray-100 border-y border-gray-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#1B2B6B]">
            ¿Necesitas una cotización personalizada?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Contáctanos por WhatsApp y un asesor te atenderá de inmediato.
          </p>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, quisiera solicitar una cotización de equipos de cómputo.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Cotizar por WhatsApp
          </a>
        </div>
      </section>
    </>
  )
}
