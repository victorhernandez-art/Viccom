'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { formatCurrency, getDisplayStock, getProductImageUrl } from '@/lib/utils'

interface RecommendedProduct {
  id: string
  nombre: string
  sku_ct: string
  slug: string
  precio_publico: number
  existencia_total: number
  existencia_tuxtla: number
  imagen_principal: string | null
}

interface RecommendedCarouselProps {
  products: RecommendedProduct[]
  whatsappNumber: string
}

export default function RecommendedCarousel({ products }: RecommendedCarouselProps) {
  const [page, setPage] = useState(0)
  const itemsPerPage = 4
  const pages = Math.ceil(products.length / itemsPerPage)

  const canSlide = products.length > itemsPerPage
  const startIndex = page * itemsPerPage
  const currentGroup = products.slice(startIndex, startIndex + itemsPerPage)

  if (products.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#1B2B6B] rounded-full"></span>
        Productos Recomendados
      </h2>

      <div className="relative group">
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
                      unoptimized
                      referrerPolicy="no-referrer"
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
