'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useCallback } from 'react'
import { type Category, type Brand, type CatalogFilters } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { X, SlidersHorizontal } from 'lucide-react'

interface FilterSidebarProps {
  categories: Category[]
  brands: Brand[]
  filters: CatalogFilters
}

export default function FilterSidebar({ categories, brands, filters }: FilterSidebarProps) {
  const router     = useRouter()
  const pathname   = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete('page') // reset paginación
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [router, pathname, searchParams]
  )

  const toggleArrayFilter = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key)?.split(',').filter(Boolean) ?? []
      const idx = current.indexOf(value)
      const next = idx >= 0 ? current.filter(v => v !== value) : [...current, value]
      updateFilter(key, next.join(',') || null)
    },
    [searchParams, updateFilter]
  )

  const hasFilters = !!(
    filters.query || filters.marcas?.length || filters.categorias?.length ||
    filters.precio_min || filters.precio_max || filters.disponible
  )

  function clearAll() {
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }

  const activeCategorias = filters.categorias ?? []
  const activeMarcas     = filters.marcas ?? []
  const categoryTree = buildCategoryTree(categories)

  return (
    <aside className="w-full">
      {/* Header filtros */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-bold text-[#1B2B6B]">
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filtros</span>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-600 hover:underline"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Disponibilidad */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 text-sm mb-2">Disponibilidad</h4>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
          <input
            type="checkbox"
            checked={!!filters.disponible}
            onChange={() => updateFilter('disponible', filters.disponible ? null : 'true')}
            className="w-4 h-4 accent-[#1B2B6B]"
          />
          Solo con existencia
        </label>
      </div>

      {/* Categorías */}
      {categories.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 text-sm mb-2">Categoría</h4>
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {categoryTree.map(cat => (
              <CategoryFilterItem
                key={cat.id}
                category={cat}
                activeCategorias={activeCategorias}
                onToggle={(slug) => toggleArrayFilter('categorias', slug)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Marcas */}
      {brands.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 text-sm mb-2">Marca</h4>
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {brands.map(brand => (
              <label
                key={brand.id}
                className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 py-0.5"
              >
                <input
                  type="checkbox"
                  checked={activeMarcas.includes(brand.slug)}
                  onChange={() => toggleArrayFilter('marcas', brand.slug)}
                  className="w-4 h-4 accent-[#1B2B6B]"
                />
                <span className="flex-1">{brand.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Rango de precio */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 text-sm mb-2">Precio MXN</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Mín"
            min={0}
            value={filters.precio_min ?? ''}
            onChange={e => updateFilter('precio_min', e.target.value || null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1B2B6B]"
          />
          <span className="text-gray-400 flex-shrink-0">—</span>
          <input
            type="number"
            placeholder="Máx"
            min={0}
            value={filters.precio_max ?? ''}
            onChange={e => updateFilter('precio_max', e.target.value || null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1B2B6B]"
          />
        </div>
        {(filters.precio_min || filters.precio_max) && (
          <p className="text-xs text-gray-400 mt-1">
            {filters.precio_min ? formatCurrency(filters.precio_min) : '...'} —{' '}
            {filters.precio_max ? formatCurrency(filters.precio_max) : '...'}
          </p>
        )}
      </div>
    </aside>
  )
}

type CategoryNode = Category & { children: CategoryNode[] }

function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const byId = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const category of categories) {
    byId.set(category.id, { ...category, children: [] })
  }

  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.nombre.localeCompare(b.nombre))
    nodes.forEach(node => sortNodes(node.children))
  }
  sortNodes(roots)

  return roots
}

function CategoryFilterItem({
  category,
  activeCategorias,
  onToggle,
}: {
  category: CategoryNode
  activeCategorias: string[]
  onToggle: (categoryKey: string) => void
}) {
  const categoryKey = category.path || category.slug

  return (
    <div>
      <label
        className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 py-0.5"
        style={{ paddingLeft: `${(category.nivel ?? 0) * 12}px` }}
      >
        <input
          type="checkbox"
          checked={activeCategorias.includes(categoryKey) || activeCategorias.includes(category.slug)}
          onChange={() => onToggle(categoryKey)}
          className="w-4 h-4 accent-[#1B2B6B]"
        />
        <span className="flex-1">{category.nombre}</span>
      </label>
      {category.children.map(child => (
        <CategoryFilterItem
          key={child.id}
          category={child}
          activeCategorias={activeCategorias}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}
