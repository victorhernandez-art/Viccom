import { type PageMetadata } from '@/types'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'VICCOM'
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  ?? 'https://www.viccom.mx'

export function buildMetadata(meta: PageMetadata) {
  const title       = `${meta.title} | ${SITE_NAME}`
  const description = meta.description
  const canonical   = meta.canonical ? `${SITE_URL}${meta.canonical}` : undefined

  return {
    title,
    description,
    keywords: meta.keywords?.join(', '),
    robots: meta.noIndex ? 'noindex,nofollow' : 'index,follow',
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      url:       canonical,
      siteName:  SITE_NAME,
      locale:    'es_MX',
      type:      'website' as const,
      images:    meta.ogImage ? [{ url: meta.ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card:        'summary_large_image' as const,
      title,
      description,
      images:      meta.ogImage ? [meta.ogImage] : undefined,
    },
  }
}

export function buildProductMetadata(product: {
  nombre: string
  descripcion?: string | null
  imagen_principal?: string | null
  slug: string
  marca_nombre?: string | null
  categoria_nombre?: string | null
}) {
  return buildMetadata({
    title:       product.nombre,
    description: product.descripcion
      ? product.descripcion.substring(0, 155)
      : `${product.nombre}${product.marca_nombre ? ` de ${product.marca_nombre}` : ''}. Cotiza en VICCOM.`,
    keywords:    [
      product.nombre,
      product.marca_nombre ?? '',
      product.categoria_nombre ?? '',
      'precio',
      'cotización',
      'VICCOM',
    ].filter(Boolean),
    ogImage:     product.imagen_principal ?? undefined,
    canonical:   `/producto/${product.slug}`,
  })
}

export function buildCategoryMetadata(category: { nombre: string; slug: string; descripcion?: string | null }) {
  return buildMetadata({
    title:       category.nombre,
    description: category.descripcion ?? `Catálogo de ${category.nombre} en VICCOM. Encuentra los mejores precios.`,
    canonical:   `/categoria/${category.slug}`,
  })
}

export function buildBrandMetadata(brand: { nombre: string; slug: string; descripcion?: string | null }) {
  return buildMetadata({
    title:       brand.nombre,
    description: brand.descripcion ?? `Productos ${brand.nombre} en VICCOM. Los mejores precios garantizados.`,
    canonical:   `/marca/${brand.slug}`,
  })
}

export { SITE_URL, SITE_NAME }
