import { type Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import MarginSettings from '@/components/admin/MarginSettings'
import { type Category } from '@/types'

export const metadata: Metadata = {
  title: 'Configuración | Admin VICCOM',
  robots: 'noindex',
}

export const dynamic = 'force-dynamic'

export default async function AdminConfiguracionPage() {
  const supabase = await createClient()

  const [settingsRes, categoriesRes] = await Promise.all([
    supabase.from('settings').select('key,value'),
    supabase.from('categories').select('id,nombre,slug,margen_override').eq('activo', true).order('orden'),
  ])

  const settings = Object.fromEntries((settingsRes.data ?? []).map(s => [s.key, s.value]))
  const categories = (categoriesRes.data ?? []) as Pick<Category, 'id' | 'nombre' | 'slug' | 'margen_override'>[]

  const globalMargin = Number(settings['margen_global'] ?? 30)

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Configuración Comercial</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestiona los márgenes de ganancia y parámetros del sistema.
        </p>
      </div>

      <MarginSettings
        globalMargin={globalMargin}
        categories={categories as any}
      />
    </div>
  )
}
