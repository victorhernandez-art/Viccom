'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { formatCurrency, getDisplayStock, getProductImageUrl } from '@/lib/utils'
import { type ProductCatalog } from '@/types'

interface RecommendedCarouselProps {
  products: ProductCatalog[]
}

const VISIBLE_ITEMS = 4

export default function RecommendedCarousel({ products }: RecommendedCarouselProps) {
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(products.length / VISIBLE_ITEMS))

  const groups = useMemo(() => {
    const chunks: ProductCatalog[][] = []
    for (let i = 0; i < products.length; i += VISIBLE_ITEMS) {
      chunks.push(products.slice(i, i + VISIBLE_ITEMS))
    }
    return chunks
  }, [products])

  const canSlide = pages > 1
  const currentGroup = groups[page] ?? []

  return (
    <section className="bg-gray-200 p-3 md:p-4 rounded-sm">
      <h2 className="text-center text-[#51637A] text-xl md:text-2xl font-semibold uppercase tracking-wide mb-3">
        Recomendado para ti
      </h2>

      <div className="relative bg-white border border-gray-200 px-12 py-3 overflow-hidden">
        <button
          type="button"
          onClick={() => canSlide && setPage(p => (p - 1 + pages) % pages)}
          disabled={!canSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-9 h-9" />
        </button>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-1">
          {currentGroup.map(product => {
            const totalStock = product.existencia_total ?? 0
            const tuxtlaStock = product.existencia_tuxtla ?? 0
            const stock = getDisplayStock(product.slug, totalStock, tuxtlaStock)
            const stockTone = stock.stockTone
            const carouselImage = getProductImageUrl(product.imagen_principal)

            return (
              <article key={product.id} className="min-w-0">
                <Link href={`/producto/${product.slug}`} className="block">
                  <div className="relative h-16 mb-2 bg-gray-50 rounded-md">
                    <Image
                      src={carouselImage}
                      alt={product.nombre}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-contain"
                    />
                  </div>

                  <p className="text-lg font-bold text-black leading-tight mb-1">
                    {formatCurrency(product.precio_publico)}
                  </p>

                  <p
                    className={`text-sm font-semibold flex items-center gap-1 mb-1 ${
                      stockTone === 'green' ? 'text-green-600' : stockTone === 'amber' ? 'text-amber-500' : 'text-gray-500'
                    }`}
                  >
                    {stock.displayTuxtlaStock}
                    <Flag className="w-3.5 h-3.5" />
                    <span>[{totalStock}]</span>
                  </p>

                  <p className="text-xs text-gray-600 leading-tight line-clamp-2 mb-1">{product.nombre}</p>

                  <p className="text-base font-extrabold text-black mb-2 line-clamp-1">{product.sku_ct}</p>

                  <span className="inline-block bg-[#2E4A95] text-white text-xs font-semibold px-3 py-1 hover:bg-[#253D7A] transition-colors">
                    Ver producto
                  </span>
                </Link>
              </article>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => canSlide && setPage(p => (p + 1) % pages)}
          disabled={!canSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-9 h-9" />
        </button>
      </div>
    </section>
  )
}
