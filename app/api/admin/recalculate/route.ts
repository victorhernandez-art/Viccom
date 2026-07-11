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
    const supabase = createAdminClient() as any

    const { data: affected, error } = await supabase.rpc('recalcular_precios_masivo', {
      p_motivo: 'recalculo_manual',
      p_usuario: 'admin',
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: { productos_afectados: affected ?? 0 },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
