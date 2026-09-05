'use client'

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  X,
  Loader2,
  FolderTree,
  Tag,
  ChevronRight,
  ArrowRight,
  Package,
} from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'

interface SearchProduct {
  id: string
  nombre: string
  slug: string
  precio_publico: number
  precio_antes?: number | null
  imagen_principal?: string | null
  marca_nombre?: string | null
  sku_ct: string
  categoria_nombre?: string | null
  existencia_total?: number
  en_oferta?: boolean
}

interface SearchCategory {
  id: string
  nombre: string
  slug: string
  path?: string | null
}

interface SearchBrand {
  id: string
  nombre: string
  slug: string
}

interface HeaderSearchProps {
  className?: string
  placeholder?: string
  onNavigate?: () => void
}

export default function HeaderSearch({
  className,
  placeholder = 'Buscar productos, marcas, SKU (ej. lap, antivirus, brother)...',
  onNavigate,
}: HeaderSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [products, setProducts] = useState<SearchProduct[]>([])
  const [categories, setCategories] = useState<SearchCategory[]>([])
  const [brands, setBrands] = useState<SearchBrand[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Búsqueda en vivo debounced
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setProducts([])
      setCategories([])
      setBrands([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`)
        const data = await res.json()
        if (data.success) {
          setProducts(data.products || [])
          setCategories(data.categories || [])
          setBrands(data.brands || [])
          setIsOpen(true)
        }
      } catch (err) {
        console.error('Error en búsqueda:', err)
      } finally {
        setLoading(false)
      }
    }, 220)

    return () => clearTimeout(timer)
  }, [query])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      setIsOpen(false)
      onNavigate?.()
      router.push(`/buscar?q=${encodeURIComponent(q)}`)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const hasResults = products.length > 0 || categories.length > 0 || brands.length > 0
  const canShowDropdown = isOpen && query.trim().length >= 2

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="flex w-full rounded-xl border border-gray-300 focus-within:border-[#1B2B6B] focus-within:ring-2 focus-within:ring-blue-100 bg-white transition-all overflow-hidden shadow-2xs">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (!isOpen && e.target.value.trim().length >= 2) {
                setIsOpen(true)
              }
            }}
            onFocus={() => {
              if (query.trim().length >= 2) {
                setIsOpen(true)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-4 py-2.5 text-sm outline-none bg-white text-gray-900 placeholder:text-gray-400"
            aria-label="Buscar productos"
            autoComplete="off"
          />

          {/* Botón de limpiar o spinner */}
          <div className="flex items-center pr-2">
            {loading ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin mr-1" />
            ) : query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setProducts([])
                  setCategories([])
                  setBrands([])
                  setIsOpen(false)
                  inputRef.current?.focus()
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors mr-1"
                title="Limpiar"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}

            <button
              type="submit"
              className="bg-[#CC0000] hover:bg-[#A30000] px-4 py-2.5 text-white transition-colors flex items-center justify-center -mr-2"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Popover / Dropdown de Resultados en Vivo */}
      {canShowDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden divide-y divide-gray-100 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          {/* Categorías sugeridas */}
          {categories.length > 0 && (
            <div className="p-3 bg-gray-50/60">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
                <FolderTree className="w-3.5 h-3.5 text-[#1B2B6B]" />
                Categorías coincidentes
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categoria/${cat.path || cat.slug}`}
                    onClick={() => {
                      setIsOpen(false)
                      onNavigate?.()
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1B2B6B] bg-white hover:bg-[#1B2B6B] hover:text-white rounded-lg border border-gray-200 shadow-2xs transition-colors"
                  >
                    <span>{cat.nombre}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Marcas sugeridas */}
          {brands.length > 0 && (
            <div className="p-3 bg-gray-50/30">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
                <Tag className="w-3.5 h-3.5 text-[#CC0000]" />
                Marcas
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/marca/${b.slug}`}
                    onClick={() => {
                      setIsOpen(false)
                      onNavigate?.()
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-[#CC0000] hover:text-white rounded-lg border border-gray-200 shadow-2xs transition-colors"
                  >
                    <span>{b.nombre}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Productos encontrados */}
          {products.length > 0 && (
            <div className="p-2 max-h-[380px] overflow-y-auto divide-y divide-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-1 px-2">
                Productos destacados
              </p>
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/producto/${p.slug}`}
                  onClick={() => {
                    setIsOpen(false)
                    onNavigate?.()
                  }}
                  className="flex items-center gap-3 p-2.5 hover:bg-blue-50/60 rounded-lg transition-colors group"
                >
                  <div className="relative w-12 h-12 shrink-0 bg-white rounded-md border border-gray-100 p-1 flex items-center justify-center overflow-hidden">
                    {p.imagen_principal ? (
                      <Image
                        src={p.imagen_principal}
                        alt={p.nombre}
                        width={48}
                        height={48}
                        className="object-contain w-full h-full group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 group-hover:text-[#1B2B6B] truncate">
                      {p.nombre}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                      <span className="font-mono">{p.sku_ct}</span>
                      {p.categoria_nombre && (
                        <>
                          <span>•</span>
                          <span className="truncate">{p.categoria_nombre}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 justify-end">
                      <p className="text-sm font-extrabold text-[#1B2B6B]">
                        {formatCurrency(p.precio_publico)}
                      </p>
                      {p.en_oferta && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wide bg-[#CC0000] text-white px-1.5 py-0.5 rounded">
                          Oferta
                        </span>
                      )}
                    </div>
                    {p.en_oferta && p.precio_antes && (
                      <p className="text-[11px] text-gray-400 line-through">
                        {formatCurrency(p.precio_antes)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Sin resultados */}
          {!loading && !hasResults && (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm font-medium">No se encontraron productos para &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-gray-400 mt-1">
                Intenta con términos más generales (ej. <em>lap</em>, <em>impresora</em>, <em>antivirus</em>).
              </p>
            </div>
          )}

          {/* Botón inferior: Ver todos los resultados */}
          <div className="p-2.5 bg-gray-50 text-center">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-[#1B2B6B] hover:text-[#CC0000] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
            >
              <span>Ver todos los resultados para &ldquo;{query}&rdquo;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
