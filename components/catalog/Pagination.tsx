'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
}

export default function Pagination({ currentPage, totalPages, totalItems }: PaginationProps) {
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    return `${pathname}?${params.toString()}`
  }

  // Rango de páginas a mostrar
  const range: number[] = []
  const delta = 2
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    range.push(i)
  }

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1 mt-8">
      {/* Anterior */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-[#1B2B6B] hover:text-white hover:border-[#1B2B6B] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-300 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </span>
      )}

      {/* Primera página si no está en el rango */}
      {range[0] > 1 && (
        <>
          <Link href={buildHref(1)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-sm hover:bg-[#1B2B6B] hover:text-white hover:border-[#1B2B6B] transition-colors">
            1
          </Link>
          {range[0] > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}

      {/* Rango de páginas */}
      {range.map(page => (
        <Link
          key={page}
          href={buildHref(page)}
          className={cn(
            'w-9 h-9 flex items-center justify-center rounded-lg border text-sm transition-colors',
            page === currentPage
              ? 'bg-[#1B2B6B] text-white border-[#1B2B6B] font-bold'
              : 'border-gray-300 text-gray-700 hover:bg-[#1B2B6B] hover:text-white hover:border-[#1B2B6B]'
          )}
        >
          {page}
        </Link>
      ))}

      {/* Última página si no está en el rango */}
      {range[range.length - 1] < totalPages && (
        <>
          {range[range.length - 1] < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
          <Link href={buildHref(totalPages)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-sm hover:bg-[#1B2B6B] hover:text-white hover:border-[#1B2B6B] transition-colors">
            {totalPages}
          </Link>
        </>
      )}

      {/* Siguiente */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-[#1B2B6B] hover:text-white hover:border-[#1B2B6B] transition-colors"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-300 cursor-not-allowed">
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  )
}
