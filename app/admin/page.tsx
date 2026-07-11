import { type Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatNumber, formatDate, timeAgo } from '@/lib/utils'
import {
  Package,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Tag,
  Layers,
  TrendingUp,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { type DashboardStats } from '@/types'

export const metadata: Metadata = {
  title: 'Dashboard Admin | VICCOM',
  robots: 'noindex',
}

export const dynamic = 'force-dynamic'

async function getDashboardStats(supabase: ReturnType<Awaited<typeof createClient>>): Promise<DashboardStats> {
  const [
    totalRes,
    activosRes,
    sinExistenciaRes,
    destacadosRes,
    marcasRes,
    categoriasRes,
    lastSyncRes,
    erroresRes,
  ] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('activo', true).eq('descontinuado', false),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('activo', true).eq('existencia_total', 0),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('destacado', true),
    supabase.from('brands').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('categories').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('sync_logs').select('inicio,estado').order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('sync_logs').select('id', { count: 'exact', head: true })
      .eq('estado', 'error')
      .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
  ])

  return {
    total_productos:          totalRes.count         ?? 0,
    productos_activos:        activosRes.count        ?? 0,
    productos_sin_existencia: sinExistenciaRes.count  ?? 0,
    productos_destacados:     destacadosRes.count      ?? 0,
    total_marcas:             marcasRes.count          ?? 0,
    total_categorias:         categoriasRes.count      ?? 0,
    ultima_sincronizacion:    lastSyncRes.data?.inicio ?? null,
    ultima_sincronizacion_estado: lastSyncRes.data?.estado ?? null,
    errores_ultimo_dia:       erroresRes.count         ?? 0,
  }
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [stats, recentSyncs] = await Promise.all([
    getDashboardStats(supabase as any),
    supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const syncs = recentSyncs.data ?? []

  const statCards = [
    {
      label: 'Total Productos',
      value: formatNumber(stats.total_productos),
      icon: Package,
      color: 'bg-blue-500',
      href: '/admin/productos',
    },
    {
      label: 'Productos Activos',
      value: formatNumber(stats.productos_activos),
      icon: CheckCircle,
      color: 'bg-green-500',
      href: '/admin/productos?activo=true',
    },
    {
      label: 'Sin Existencia',
      value: formatNumber(stats.productos_sin_existencia),
      icon: XCircle,
      color: 'bg-red-500',
      href: '/admin/productos?sin_existencia=true',
    },
    {
      label: 'Marcas',
      value: formatNumber(stats.total_marcas),
      icon: Tag,
      color: 'bg-purple-500',
      href: '/admin/marcas',
    },
    {
      label: 'Categorías',
      value: formatNumber(stats.total_categorias),
      icon: Layers,
      color: 'bg-orange-500',
      href: '/admin/categorias',
    },
    {
      label: 'Errores (24h)',
      value: formatNumber(stats.errores_ultimo_dia),
      icon: AlertTriangle,
      color: stats.errores_ultimo_dia > 0 ? 'bg-red-600' : 'bg-gray-400',
      href: '/admin/sincronizacion',
    },
  ]

  return (
    <div className="p-6 md:p-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Resumen del sistema VICCOM — CT Connect
        </p>
      </div>

      {/* Estado última sincronización */}
      {stats.ultima_sincronizacion && (
        <div className={`flex items-center gap-3 rounded-xl px-5 py-3 mb-6 text-sm font-medium ${
          stats.ultima_sincronizacion_estado === 'completado'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : stats.ultima_sincronizacion_estado === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <RefreshCw className="w-4 h-4 flex-shrink-0" />
          <span>
            Última sincronización:{' '}
            <strong>{timeAgo(stats.ultima_sincronizacion)}</strong>
            {' — Estado: '}
            <strong>{stats.ultima_sincronizacion_estado}</strong>
          </span>
          <Link href="/admin/sincronizacion" className="ml-auto underline text-xs">
            Ver logs
          </Link>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 group-hover:text-[#1B2B6B]">
              {card.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/configuracion"
          className="flex items-center gap-4 bg-[#1B2B6B] text-white rounded-xl p-5 hover:bg-[#253680] transition-colors"
        >
          <TrendingUp className="w-8 h-8 opacity-80" />
          <div>
            <p className="font-bold">Configurar Márgenes</p>
            <p className="text-blue-200 text-xs">Ajusta los márgenes de ganancia</p>
          </div>
        </Link>
        <Link
          href="/admin/sincronizacion"
          className="flex items-center gap-4 bg-[#CC0000] text-white rounded-xl p-5 hover:bg-[#A30000] transition-colors"
        >
          <RefreshCw className="w-8 h-8 opacity-80" />
          <div>
            <p className="font-bold">Forzar Sincronización</p>
            <p className="text-red-200 text-xs">Actualizar catálogo CT Connect</p>
          </div>
        </Link>
        <Link
          href="/admin/productos"
          className="flex items-center gap-4 bg-green-700 text-white rounded-xl p-5 hover:bg-green-600 transition-colors"
        >
          <Package className="w-8 h-8 opacity-80" />
          <div>
            <p className="font-bold">Gestionar Productos</p>
            <p className="text-green-200 text-xs">Ver y editar el catálogo</p>
          </div>
        </Link>
      </div>

      {/* Últimas sincronizaciones */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Últimas sincronizaciones
          </h2>
          <Link href="/admin/sincronizacion" className="text-xs text-[#CC0000] hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Proceso</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Procesados</th>
                <th className="px-4 py-3 text-right">Nuevos</th>
                <th className="px-4 py-3 text-right">Actualizados</th>
                <th className="px-4 py-3 text-left">Inicio</th>
                <th className="px-4 py-3 text-right">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {syncs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Sin sincronizaciones registradas
                  </td>
                </tr>
              ) : (
                syncs.map(sync => (
                  <tr key={sync.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{sync.proceso}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        sync.estado === 'completado' ? 'bg-green-100 text-green-700' :
                        sync.estado === 'error'      ? 'bg-red-100 text-red-700' :
                        sync.estado === 'parcial'    ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {sync.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatNumber(sync.productos_procesados)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{formatNumber(sync.productos_nuevos)}</td>
                    <td className="px-4 py-3 text-right text-blue-600">{formatNumber(sync.productos_actualizados)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(sync.inicio, true)}</td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                      {sync.duracion_segundos ? `${sync.duracion_segundos}s` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
