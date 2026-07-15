'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../catalog/ProductCard'
import { type ProductCatalog } from '@/types'

interface RecommendedCarouselProps {
  products: ProductCatalog[]
  whatsappNumber?: string
}

export default function RecommendedCarousel({ products, whatsappNumber }: RecommendedCarouselProps) {
  const [page, setPage] = useState(0)
  const itemsPerPage = 4
  const pages = Math.ceil(products.length / itemsPerPage)

  const canSlide = products.length > itemsPerPage
  const startIndex = page * itemsPerPage
  const currentGroup = products.slice(startIndex, startIndex + itemsPerPage)

  if (products.length === 0) return null

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#1B2B6B] flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#1B2B6B] rounded-full"></span>
          Productos Recomendados
        </h2>
        {canSlide && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(p => (p - 1 + pages) % pages)}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-[#1B2B6B] hover:text-white transition-all shadow-sm focus:outline-none"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setPage(p => (p + 1) % pages)}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-[#1B2B6B] hover:text-white transition-all shadow-sm focus:outline-none"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {currentGroup.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            whatsappNumber={whatsappNumber}
          />
        ))}
      </div>
    </section>
  )
}

