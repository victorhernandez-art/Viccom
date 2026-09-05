'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import {
  Save,
  RefreshCw,
  Info,
  Search,
  X,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  PackageSearch,
  CheckCircle2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { calcularPrecioPublico } from '@/lib/pricing'

interface CategoryItem {
  id: string
  nombre: string
  slug: string
  margen_override: number | null
  path?: string | null
}

interface MarginSettingsProps {
  globalMargin: number
  categories: CategoryItem[]
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export default function MarginSettings({ globalMargin, categories }: MarginSettingsProps) {
  const [global, setGlobal] = useState(globalMargin)
  const [catMargins, setCatMargins] = useState<Record<string, string>>(
    Object.fromEntries(categories.map(c => [c.id, c.margen_override?.toString() ?? '']))
  )
  const [saving, setSaving] = useState(false)
  const [recalcing, setRecalcing] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [, start] = useTransition()

  // Buscador y filtros
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'custom' | 'global'>('all')
  const [productMatches, setProductMatches] = useState<Record<string, string[]>>({})
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Atajo de teclado: presionar '/' para enfocar el buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Búsqueda inteligente por nombre de producto en el servidor (debounced)
  useEffect(() => {
    const query = search.trim()
    if (query.length < 2) {
      setProductMatches({})
      setIsSearchingProducts(false)
      return
    }

    setIsSearchingProducts(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/categories/search-by-product?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data.success && data.matches) {
          setProductMatches(data.matches)
        }
      } catch (err) {
        console.error('Error buscando categorías por producto:', err)
      } finally {
        setIsSearchingProducts(false)
      }
    }, 280)

    return () => clearTimeout(timeout)
  }, [search])

  async function saveMargins() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/margins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          margen_global: global,
          categorias: Object.entries(catMargins).map(([id, val]) => ({
            id,
            margen_override: val === '' ? null : Number(val),
          })),
        }),
      })
      const json = await res.json()
      setMsg(json.success ? '✓ Márgenes guardados correctamente y precios recalculados.' : `Error: ${json.error}`)
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
      const res = await fetch('/api/admin/recalculate', { method: 'POST' })
      const json = await res.json()
      setMsg(
        json.success
          ? `✓ ${json.data?.productos_afectados ?? 0} precios recalculados en todo el catálogo.`
          : `Error: ${json.error}`
      )
    } catch {
      setMsg('Error al recalcular.')
    } finally {
      setRecalcing(false)
    }
  }

  // Ejemplo de cálculo para mostrar al usuario
  const exampleCost = 10000
  const previewPrice = calcularPrecioPublico(exampleCost, global)

  // Conteos
  const totalCategories = categories.length
  const customCount = categories.filter(c => (catMargins[c.id] ?? '') !== '').length
  const globalCount = totalCategories - customCount

  // Filtrado optimizado
  const cleanQuery = normalizeText(search)
  const filteredCategories = categories.filter(cat => {
    const val = catMargins[cat.id] ?? ''
    const hasCustom = val !== ''

    // Filtro por pestaña
    if (filterTab === 'custom' && !hasCustom) return false
    if (filterTab === 'global' && hasCustom) return false

    // Si no hay término de búsqueda, pasa
    if (!cleanQuery) return true

    // 1. Coincidencia directa en nombre, path o slug de la categoría
    const nameMatch = normalizeText(cat.nombre).includes(cleanQuery)
    const pathMatch = cat.path ? normalizeText(cat.path).includes(cleanQuery) : false
    const slugMatch = normalizeText(cat.slug).includes(cleanQuery)

    // 2. Coincidencia por producto perteneciente a esta categoría
    const productMatch = Boolean(productMatches[cat.id]?.length)

    return nameMatch || pathMatch || slugMatch || productMatch
  })

  return (
    <div className="space-y-8">
      {/* Mensaje de estado */}
      {msg && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
            msg.startsWith('✓')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {msg.startsWith('✓') && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
          <span>{msg}</span>
        </div>
      )}

      {/* Margen global */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1B2B6B] mb-1">Margen Global</h2>
        <p className="text-gray-500 text-sm mb-4">
          Se aplica a todos los productos que no tengan margen específico de categoría o producto.
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
                className="w-28 border-2 border-gray-300 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none focus:border-[#1B2B6B] transition-colors"
              />
              <span className="text-2xl font-light text-gray-400">%</span>
            </div>
          </div>
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 text-sm text-[#1B2B6B]">
            <p className="font-medium flex items-center gap-1.5 text-xs text-blue-900 uppercase tracking-wide">
              <Info className="w-4 h-4 text-[#1B2B6B]" />
              Simulación de costo {formatCurrency(exampleCost)}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[#1B2B6B]">{formatCurrency(previewPrice)}</p>
            <p className="text-xs text-blue-600">Precio público calculado (IVA 16% + {global}% margen)</p>
          </div>
        </div>
      </section>

      {/* Márgenes por categoría con buscador inteligente */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#1B2B6B] flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-[#1B2B6B]" />
              Margen por Categoría
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Configura un margen específico por categoría. Deja el campo vacío para heredar el margen global ({global}%).
            </p>
          </div>

          <div className="text-xs text-gray-500 font-medium self-start md:self-auto bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/80">
            Mostrando <span className="font-bold text-gray-900">{filteredCategories.length}</span> de {totalCategories} categorías
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros Rápidos */}
        <div className="mt-5 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className={`w-5 h-5 ${isSearchingProducts ? 'animate-pulse text-[#1B2B6B]' : ''}`} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por categoría o producto (ej. lap, antivirus, brother, monitor, teclado)..."
              className="w-full pl-11 pr-24 py-3 bg-gray-50 hover:bg-white focus:bg-white border-2 border-gray-200 focus:border-[#1B2B6B] rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 transition-all outline-none shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-gray-400 bg-gray-200/60 border border-gray-300 rounded">
                /
              </kbd>
            </div>
          </div>

          {/* Pestañas de filtrado rápido */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                filterTab === 'all'
                  ? 'bg-[#1B2B6B] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas ({totalCategories})
            </button>
            <button
              onClick={() => setFilterTab('custom')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                filterTab === 'custom'
                  ? 'bg-[#1B2B6B] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Margen personalizado ({customCount})
            </button>
            <button
              onClick={() => setFilterTab('global')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                filterTab === 'global'
                  ? 'bg-[#1B2B6B] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              Margen global ({globalCount})
            </button>

            {search.trim() && (
              <span className="text-xs text-blue-700 ml-auto flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                <Search className="w-3 h-3" />
                Filtro activo: &ldquo;{search}&rdquo;
              </span>
            )}
          </div>
        </div>

        {/* Grid de categorías */}
        <div className="mt-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <PackageSearch className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No se encontraron categorías</p>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                No hay coincidencias para &ldquo;{search}&rdquo; con el filtro seleccionado.
              </p>
              <button
                onClick={() => {
                  setSearch('')
                  setFilterTab('all')
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B2B6B] hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restablecer búsqueda y filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[640px] overflow-y-auto pr-1">
              {filteredCategories.map(cat => {
                const val = catMargins[cat.id] ?? ''
                const hasCustom = val !== ''
                const effective = hasCustom ? Number(val) : global
                const preview = calcularPrecioPublico(exampleCost, effective)
                const matchedProducts = productMatches[cat.id]

                return (
                  <div
                    key={cat.id}
                    className={`rounded-xl p-4 transition-all border ${
                      hasCustom
                        ? 'border-blue-300 bg-blue-50/20 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <label className="block text-sm font-bold text-gray-900 leading-snug">
                        {cat.nombre}
                      </label>
                      {hasCustom ? (
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          Propio
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          Global
                        </span>
                      )}
                    </div>

                    {/* Ruta de categoría */}
                    {cat.path && (
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-2 font-mono truncate" title={cat.path}>
                        <Layers className="w-3 h-3 shrink-0 text-gray-300" />
                        <span className="truncate">{cat.path.replace(/\//g, ' › ')}</span>
                      </p>
                    )}

                    {/* Badge de coincidencia por producto si se encontró vía API */}
                    {matchedProducts && matchedProducts.length > 0 && (
                      <div className="mb-2 bg-emerald-50 border border-emerald-200/80 rounded-lg px-2 py-1 text-[11px] text-emerald-800 flex items-center gap-1.5">
                        <PackageSearch className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate font-medium" title={matchedProducts.join(', ')}>
                          Coincide: &ldquo;{matchedProducts[0]}&rdquo;
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        min={0}
                        max={999}
                        step={0.5}
                        placeholder={`${global} (global)`}
                        value={val}
                        onChange={e =>
                          setCatMargins(prev => ({
                            ...prev,
                            [cat.id]: e.target.value,
                          }))
                        }
                        className={`flex-1 border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-[#1B2B6B] transition-colors ${
                          hasCustom ? 'border-blue-400 bg-white font-bold text-blue-900' : 'border-gray-300 bg-gray-50/50'
                        }`}
                      />
                      <span className="text-gray-400 text-sm font-medium">%</span>

                      {hasCustom && (
                        <button
                          type="button"
                          onClick={() => setCatMargins(prev => ({ ...prev, [cat.id]: '' }))}
                          title="Restablecer al margen global"
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-2 flex items-center justify-between">
                      <span>Precio ref. (ej. $10,000):</span>
                      <span className="font-bold text-[#1B2B6B]">{formatCurrency(preview)}</span>
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Barra de Acciones */}
      <div className="sticky bottom-4 bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="text-xs text-gray-500">
          <span className="font-semibold text-gray-800">{customCount}</span> categorías con margen personalizado asignado.
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={saveMargins}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B2B6B] text-white text-sm font-bold hover:bg-[#253680] shadow-sm hover:shadow transition-all disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando…' : 'Guardar Márgenes'}
          </button>
          <button
            onClick={triggerRecalc}
            disabled={recalcing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#CC0000] text-white text-sm font-bold hover:bg-[#A30000] shadow-sm hover:shadow transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${recalcing ? 'animate-spin' : ''}`} />
            {recalcing ? 'Recalculando…' : 'Forzar Recálculo Masivo'}
          </button>
        </div>
      </div>
    </div>
  )
}
