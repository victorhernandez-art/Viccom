'use client'

import { useState, useTransition } from 'react'
import { Save, RefreshCw, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { calcularPrecioPublico } from '@/lib/pricing'

interface MarginSettingsProps {
  globalMargin: number
  categories: { id: string; nombre: string; slug: string; margen_override: number | null }[]
}

export default function MarginSettings({ globalMargin, categories }: MarginSettingsProps) {
  const [global,     setGlobal]     = useState(globalMargin)
  const [catMargins, setCatMargins] = useState<Record<string, string>>(
    Object.fromEntries(categories.map(c => [c.id, c.margen_override?.toString() ?? '']))
  )
  const [saving,    setSaving]    = useState(false)
  const [recalcing, setRecalcing] = useState(false)
  const [msg,       setMsg]       = useState<string | null>(null)
  const [, start] = useTransition()

  async function saveMargins() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/margins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          margen_global: global,
          categorias:    Object.entries(catMargins).map(([id, val]) => ({
            id,
            margen_override: val === '' ? null : Number(val),
          })),
        }),
      })
      const json = await res.json()
      setMsg(json.success ? '✓ Márgenes guardados correctamente.' : `Error: ${json.error}`)
    } catch {
      setMsg('Error de conexión al guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function triggerRecalc() {
    setRecalcing(true)
    setMsg(null)
    try {
      const res  = await fetch('/api/admin/recalculate', { method: 'POST' })
      const json = await res.json()
      setMsg(json.success
        ? `✓ ${json.data?.productos_afectados ?? 0} precios recalculados.`
        : `Error: ${json.error}`)
    } catch {
      setMsg('Error al recalcular.')
    } finally {
      setRecalcing(false)
    }
  }

  // Ejemplo de cálculo para mostrar al usuario
  const exampleCost = 10000
  const previewPrice = calcularPrecioPublico(exampleCost, global)

  return (
    <div className="space-y-8">
      {/* Mensaje de estado */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          msg.startsWith('✓') ? 'bg-green-50 text-green-800 border border-green-200'
                               : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {msg}
        </div>
      )}

      {/* Margen global */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-[#1B2B6B] mb-1">Margen Global</h2>
        <p className="text-gray-500 text-sm mb-4">
          Se aplica a todos los productos que no tengan margen de categoría o producto.
        </p>

        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Margen (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={999}
                step={0.5}
                value={global}
                onChange={e => setGlobal(Number(e.target.value))}
                className="w-28 border-2 border-gray-300 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none focus:border-[#1B2B6B]"
              />
              <span className="text-2xl font-light text-gray-400">%</span>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-[#1B2B6B]">
            <p className="font-medium flex items-center gap-1">
              <Info className="w-4 h-4" />
              Ejemplo con costo {formatCurrency(exampleCost)}
            </p>
            <p className="mt-1 text-2xl font-extrabold">{formatCurrency(previewPrice)}</p>
            <p className="text-xs text-gray-500">Precio público calculado</p>
          </div>
        </div>
      </section>

      {/* Márgenes por categoría */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-[#1B2B6B] mb-1">Margen por Categoría</h2>
        <p className="text-gray-500 text-sm mb-4">
          Deja el campo vacío para usar el margen global ({global}%).
          Tiene prioridad sobre el margen global.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => {
            const val       = catMargins[cat.id] ?? ''
            const effective = val !== '' ? Number(val) : global
            const preview   = calcularPrecioPublico(exampleCost, effective)

            return (
              <div key={cat.id} className="border border-gray-200 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {cat.nombre}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={999}
                    step={0.5}
                    placeholder={`${global} (global)`}
                    value={val}
                    onChange={e => setCatMargins(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B2B6B]"
                  />
                  <span className="text-gray-400 text-sm">%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Precio ej.: <span className="font-semibold text-[#1B2B6B]">{formatCurrency(preview)}</span>
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={saveMargins}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B2B6B] text-white font-bold hover:bg-[#253680] transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando…' : 'Guardar Márgenes'}
        </button>
        <button
          onClick={triggerRecalc}
          disabled={recalcing}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#CC0000] text-white font-bold hover:bg-[#A30000] transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${recalcing ? 'animate-spin' : ''}`} />
          {recalcing ? 'Recalculando…' : 'Forzar Recálculo Masivo'}
        </button>
      </div>
    </div>
  )
}
