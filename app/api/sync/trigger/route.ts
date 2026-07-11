import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Este endpoint recibe la llamada del panel admin y la redirige al VPS
// El VPS tiene IP fija y se conecta directamente a CT Connect

export async function POST(request: NextRequest) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
  }

  const syncServiceUrl    = process.env.SYNC_SERVICE_URL
  const syncServiceSecret = process.env.SYNC_SERVICE_SECRET

  if (!syncServiceUrl) {
    return NextResponse.json(
      { success: false, error: 'SYNC_SERVICE_URL no configurado' },
      { status: 500 }
    )
  }

  try {
    const res = await fetch(`${syncServiceUrl}/sync/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${syncServiceSecret}`,
      },
      signal: AbortSignal.timeout(10000), // 10 s timeout
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { success: false, error: `VPS respondió ${res.status}: ${text}` },
        { status: 502 }
      )
    }

    const data = await res.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error de conexión con el VPS'
    return NextResponse.json({ success: false, error: msg }, { status: 502 })
  }
}
