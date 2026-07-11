import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// API pública para buscar productos (para autocompletado, etc.)
export async function GET(request: NextRequest) {
  const q     = request.nextUrl.searchParams.get('q') ?? ''
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? 10), 50)

  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, data: [] })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('v_products_catalog')
    .select('id,nombre,slug,precio_publico,imagen_principal,marca_nombre,sku_ct')
    .or(`nombre.ilike.%${q}%,sku_ct.ilike.%${q}%`)
    .order('destacado', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: data ?? [] })
}
