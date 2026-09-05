import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = (searchParams.get('q') ?? '').trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ success: true, matches: {} })
  }

  // Buscar hasta 60 productos activos que coincidan por nombre o SKU
  const { data: products, error } = (await authClient
    .from('products')
    .select('categoria_id, nombre, sku_ct')
    .eq('activo', true)
    .or(`nombre.ilike.%${query}%,sku_ct.ilike.%${query}%`)
    .not('categoria_id', 'is', null)
    .limit(60)) as {
    data: { categoria_id: string; nombre: string; sku_ct: string }[] | null
    error: any
  }

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // Agrupar coincidencias por categoria_id: { [catId]: [nombres de productos] }
  const matches: Record<string, string[]> = {}
  for (const p of (products ?? [])) {
    if (!p.categoria_id) continue
    if (!matches[p.categoria_id]) {
      matches[p.categoria_id] = []
    }
    if (matches[p.categoria_id].length < 2) {
      matches[p.categoria_id].push(p.nombre)
    }
  }

  return NextResponse.json({ success: true, matches })
}
