import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import ProductCard from '@/components/catalog/ProductCard'
import { type ProductCatalog } from '@/types'

interface FeaturedProductsProps {
  products: ProductCatalog[]
  title?: string
  subtitle?: string
  viewAllLink?: string
  whatsappNumber?: string
}

export default function FeaturedProducts({
  products,
  title = 'Productos Destacados',
  subtitle = 'Selección especial de los mejores equipos',
  viewAllLink = '/catalogo?destacado=true',
  whatsappNumber,
}: FeaturedProductsProps) {
  if (!products.length) return null

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1B2B6B]">{title}</h2>
            {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          </div>
          <Link
            href={viewAllLink}
            className="hidden sm:flex items-center gap-1 text-[#CC0000] hover:underline text-sm font-medium"
          >
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.slice(0, 10).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              whatsappNumber={whatsappNumber}
            />
          ))}
        </div>

        {/* Ver más móvil */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1B2B6B] text-white font-medium hover:bg-[#253680] transition-colors"
          >
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
