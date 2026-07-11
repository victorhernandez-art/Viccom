import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    supabase
      .from('products')
      .select('slug,updated_at')
      .eq('activo', true)
      .eq('descontinuado', false)
      .order('updated_at', { ascending: false })
      .limit(50000),
    supabase
      .from('categories')
      .select('slug,updated_at')
      .eq('activo', true),
    supabase
      .from('brands')
      .select('slug,updated_at')
      .eq('activo', true),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/catalogo`, lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${SITE_URL}/buscar`,   lastModified: new Date(), changeFrequency: 'daily',   priority: 0.5 },
  ]

  const productPages: MetadataRoute.Sitemap = (productsRes.data ?? []).map(p => ({
    url:             `${SITE_URL}/producto/${p.slug}`,
    lastModified:    new Date(p.updated_at),
    changeFrequency: 'hourly' as const,
    priority:        0.8,
  }))

  const categoryPages: MetadataRoute.Sitemap = (categoriesRes.data ?? []).map(c => ({
    url:             `${SITE_URL}/categoria/${c.slug}`,
    lastModified:    new Date(c.updated_at),
    changeFrequency: 'daily' as const,
    priority:        0.7,
  }))

  const brandPages: MetadataRoute.Sitemap = (brandsRes.data ?? []).map(b => ({
    url:             `${SITE_URL}/marca/${b.slug}`,
    lastModified:    new Date(b.updated_at),
    changeFrequency: 'daily' as const,
    priority:        0.6,
  }))

  return [...staticPages, ...categoryPages, ...brandPages, ...productPages]
}
