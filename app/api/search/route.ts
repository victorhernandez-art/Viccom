import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// API pública para autocompletado y búsqueda rápida en vivo
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim()
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? 6), 20)

  if (!q || q.length < 2) {
    return NextResponse.json({
      success: true,
      products: [],
      categories: [],
      brands: [],
      data: [],
    })
  }

  const supabase = await createClient()

  try {
    const [productsRes, categoriesRes, brandsRes] = await Promise.all([
      // 1. Productos más relevantes
      supabase
        .from('v_products_catalog')
        .select(
          'id,nombre,slug,precio_publico,precio_antes,imagen_principal,marca_nombre,sku_ct,categoria_nombre,existencia_total,en_oferta'
        )
        .or(
          `nombre.ilike.%${q}%,sku_ct.ilike.%${q}%,subcategoria.ilike.%${q}%,marca_nombre.ilike.%${q}%,categoria_nombre.ilike.%${q}%`
        )
        .order('destacado', { ascending: false })
        .order('existencia_total', { ascending: false })
        .limit(limit),

      // 2. Categorías coincidentes
      supabase
        .from('categories')
        .select('id,nombre,slug,path')
        .eq('activo', true)
        .or(`nombre.ilike.%${q}%,slug.ilike.%${q}%`)
        .order('orden')
        .limit(4),

      // 3. Marcas coincidentes
      supabase
        .from('brands')
        .select('id,nombre,slug')
        .eq('activo', true)
        .ilike('nombre', `%${q}%`)
        .limit(3),
    ])

    const products = productsRes.data ?? []
    const categories = categoriesRes.data ?? []
    const brands = brandsRes.data ?? []

    return NextResponse.json({
      success: true,
      products,
      categories,
      brands,
      data: products, // retrocompatibilidad
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al buscar'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
