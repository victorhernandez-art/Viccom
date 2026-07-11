'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { type CatalogSortOption } from '@/types'

const SORT_OPTIONS: { value: CatalogSortOption; label: string }[] = [
  { value: 'relevancia',   label: 'Relevancia' },
  { value: 'precio_asc',   label: 'Precio: menor a mayor' },
  { value: 'precio_desc',  label: 'Precio: mayor a menor' },
  { value: 'recientes',    label: 'Más recientes' },
  { value: 'disponibilidad', label: 'Disponibilidad' },
  { value: 'nombre_asc',   label: 'Nombre A-Z' },
]

interface SortSelectProps {
  value?: CatalogSortOption
}

export default function SortSelect({ value = 'relevancia' }: SortSelectProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [, start]    = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('orderBy', e.target.value)
    params.delete('page')
    start(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }))
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B2B6B] bg-white cursor-pointer"
      aria-label="Ordenar por"
    >
      {SORT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
