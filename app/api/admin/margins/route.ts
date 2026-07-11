import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { margen_global, categorias } = body as {
      margen_global: number
      categorias: { id: string; margen_override: number | null }[]
    }

    const supabase = createAdminClient() as any

    // Actualizar margen global
    if (typeof margen_global === 'number' && margen_global >= 0) {
      await supabase
        .from('settings')
        .update({ value: String(margen_global) })
        .eq('key', 'margen_global')
    }

    // Actualizar márgenes por categoría
    if (Array.isArray(categorias)) {
      for (const cat of categorias) {
        await supabase
          .from('categories')
          .update({ margen_override: cat.margen_override })
          .eq('id', cat.id)
      }
    }

    // Recalcular precios automáticamente
    const { data: affected } = await supabase.rpc('recalcular_precios_masivo', {
      p_motivo: 'margen_configuracion',
      p_usuario: 'admin',
    })

    return NextResponse.json({
      success: true,
      data: { precios_recalculados: affected ?? 0 },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
