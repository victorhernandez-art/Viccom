import { type Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Historial de Precios | Admin VICCOM',
  robots: 'noindex',
}

export const dynamic = 'force-dynamic'

interface PreciosPageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function AdminPreciosPage({ searchParams }: PreciosPageProps) {
  const sp      = await searchParams
  const page    = Number(sp.page ?? 1)
  const PAGE    = 50
  const offset  = (page - 1) * PAGE
  const supabase = await createClient()

  const { data, count } = await supabase
    .from('price_history')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE - 1)

  const rows       = data ?? []
  const total      = count ?? 0
  const totalPages = Math.ceil(total / PAGE)

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Historial de Precios</h1>
        <p className="text-gray-500 text-sm mt-1">
          Auditoría completa de cambios de precios y márgenes. {formatNumber(total)} registros.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-right">Costo ant.</th>
                <th className="px-4 py-3 text-right">Costo nuevo</th>
                <th className="px-4 py-3 text-right">Margen ant.</th>
                <th className="px-4 py-3 text-right">Margen nuevo</th>
                <th className="px-4 py-3 text-right">Precio ant.</th>
                <th className="px-4 py-3 text-right">Precio nuevo</th>
                <th className="px-4 py-3 text-left">Motivo</th>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                    Sin registros aún.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-xs">
                      <Link
                        href={`/admin/productos`}
                        className="font-medium text-[#1B2B6B] hover:underline line-clamp-1"
                      >
                        {row.producto_nombre}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.sku_ct}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {row.costo_anterior != null ? formatCurrency(row.costo_anterior) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.costo_nuevo != null ? formatCurrency(row.costo_nuevo) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {row.margen_anterior != null ? `${row.margen_anterior}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.margen_nuevo != null ? `${row.margen_nuevo}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {row.precio_anterior != null ? formatCurrency(row.precio_anterior) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#1B2B6B]">
                      {row.precio_nuevo != null ? formatCurrency(row.precio_nuevo) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        {row.motivo ?? 'manual'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{row.usuario}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(row.created_at, true)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/precios?page=${page - 1}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/precios?page=${page + 1}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
