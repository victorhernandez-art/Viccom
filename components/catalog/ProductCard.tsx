'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { formatCurrency, getProductImageUrl, getDisplayStock } from '@/lib/utils'
import { type ProductCatalog } from '@/types'

interface ProductCardProps {
  product: ProductCatalog
  whatsappNumber?: string
}

function FlagIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-green-600' : 'text-gray-400'}`}
      aria-hidden="true"
    >
      <path d="M4 4a1 1 0 0 1 1-1h14a1 1 0 0 1 .74 1.67L16.48 8l3.26 3.33A1 1 0 0 1 19 13H6v7a1 1 0 1 1-2 0V4z" />
    </svg>
  )
}

function endOfMonthLabel(): string {
  const now = new Date()
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return last.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ProductCard({ product, whatsappNumber }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const rawImageUrl = getProductImageUrl(product.imagen_principal)
  const imageUrl = imageFailed ? '/img/product-placeholder.svg' : rawImageUrl
  const totalStock = product.existencia_total ?? 0
  const tuxtlaStock = product.existencia_tuxtla ?? 0
  const stock = getDisplayStock(product.slug, totalStock, tuxtlaStock)
  const hasStock = totalStock > 0
  const hasTuxtlaStock = stock.hasTuxtlaStock
  const stockTone = stock.stockTone

  const isPromo = product.en_oferta
  const precioAntes = product.precio_antes ?? null
  const fechaLimite = product.fecha_fin_oferta
    ? new Date(product.fecha_fin_oferta).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : endOfMonthLabel()

  const whatsappMsg = encodeURIComponent(
    `Hola, me interesa cotizar:\n*${product.nombre}*\nSKU: ${product.sku_ct}\nPrecio: ${formatCurrency(product.precio_publico)}\n${process.env.NEXT_PUBLIC_SITE_URL}/producto/${product.slug}`
  )

  return (
    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      <Link
        href={`/producto/${product.slug}`}
        className="block relative overflow-hidden bg-gradient-to-b from-gray-50 to-white rounded-t-xl"
        tabIndex={-1}
      >
        {isPromo && (
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 overflow-hidden rounded-t-xl"
            aria-label="Promocion"
          >
            <div
              className="absolute bg-[#CC0000] text-white text-[10px] font-bold tracking-wide text-center shadow"
              style={{
                width: 110,
                top: 18,
                left: -28,
                transform: 'rotate(-45deg)',
                padding: '3px 0',
              }}
            >
              Promocion
            </div>
          </div>
        )}

        <div className="aspect-square relative bg-gray-50">
          <Image
            src={imageUrl}
            alt={product.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageFailed(true)}
          />
        </div>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-1 min-h-4">
          {product.marca_nombre && (
            <Link
              href={`/marca/${product.marca_slug}`}
              className="font-semibold text-[#1B2B6B] hover:underline"
            >
              {product.marca_nombre}
            </Link>
          )}
          {product.marca_nombre && product.categoria_nombre && (
            <span className="text-gray-300">/</span>
          )}
          {product.categoria_nombre && (
            <span className="truncate">{product.categoria_nombre}</span>
          )}
        </div>

        <p className="text-xs text-gray-400 mb-auto">
          SKU: <span className="font-mono">{product.sku_ct}</span>
        </p>

        <div className="mt-2">
          {hasStock ? (
            <div className="flex items-center justify-between gap-2">
              <p
                className={`text-sm font-semibold flex items-center gap-1 ${
                  stockTone === 'green'
                    ? 'text-green-600'
                    : stockTone === 'amber'
                      ? 'text-amber-600'
                      : 'text-gray-500'
                }`}
              >
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                    stockTone === 'green'
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : stockTone === 'amber'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}
                >
                  TGZ {stock.displayTuxtlaStock}
                </span>
                <FlagIcon active={hasTuxtlaStock} />
                <span className={`text-xs ${stockTone === 'amber' ? 'text-amber-700' : 'text-gray-600'}`}>
                  [{totalStock}]
                </span>
              </p>
              <span
                className={`text-[11px] font-semibold rounded-full px-2 py-0.5 border ${
                  stockTone === 'green'
                    ? 'text-green-700 bg-green-50 border-green-100'
                    : stockTone === 'amber'
                      ? 'text-amber-700 bg-amber-50 border-amber-100'
                      : 'text-gray-600 bg-gray-50 border-gray-100'
                }`}
              >
                {stockTone === 'green' ? 'Disponible' : stockTone === 'amber' ? 'Sobre pedido' : 'Sin stock'}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span>Sin existencia</span>
              </p>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
                Agotado
              </span>
            </div>
          )}
        </div>

        <div className="mt-2 mb-3">
          {isPromo && precioAntes ? (
            <>
              <p className="text-xl font-extrabold text-[#CC0000]">
                {formatCurrency(product.precio_publico)}
              </p>
              <p className="text-sm text-gray-400 line-through">
                {formatCurrency(precioAntes)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Hasta {fechaLimite}
              </p>
            </>
          ) : isPromo ? (
            <>
              <p className="text-xl font-extrabold text-[#CC0000]">
                {formatCurrency(product.precio_publico)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Hasta {fechaLimite}
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-extrabold text-[#1B2B6B]">
                {formatCurrency(product.precio_publico)}
              </p>
              <p className="text-xs text-gray-400">Precio publico IVA incluido</p>
            </>
          )}
        </div>

        <Link href={`/producto/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-[#1B2B6B] transition-colors leading-snug mb-2 min-h-10">
            {product.nombre}
          </h3>
        </Link>

        <div className="flex gap-2 mt-auto">
          <Link
            href={`/producto/${product.slug}`}
            className="flex-1 text-center text-sm font-semibold py-2 px-3 rounded-lg bg-[#1B2B6B] text-white hover:bg-[#253680] transition-colors"
          >
            Ver producto
          </Link>
        </div>
      </div>
    </article>
  )
}
