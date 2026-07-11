import { type Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatNumber, formatDate, timeAgo } from '@/lib/utils'
import ForceSyncButton from './ForceSyncButton'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sincronización CT Connect | Admin VICCOM',
  robots: 'noindex',
}

export const dynamic = 'force-dynamic'

export default async function AdminSyncPage() {
  const supabase = await createClient()

  const [logsRes, statsRes] = await Promise.all([
    supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('sync_logs')
      .select('estado')
      .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
  ])

  const logs  = logsRes.data  ?? []
  const stats = statsRes.data ?? []

  const completados = stats.filter(s => s.estado === 'completado').length
  const errores     = stats.filter(s => s.estado === 'error').length
  const parciales   = stats.filter(s => s.estado === 'parcial').length
  const lastSync    = logs[0]

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Sincronización CT Connect</h1>
          <p className="text-gray-500 text-sm mt-1">
            Estado del proceso de actualización automática del catálogo.
          </p>
        </div>
        <ForceSyncButton />
      </div>

      {/* Estado actual */}
      {lastSync && (
        <div className={`rounded-xl p-5 mb-6 border ${
          lastSync.estado === 'completado' ? 'bg-green-50 border-green-200' :
          lastSync.estado === 'error'      ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            {lastSync.estado === 'completado'
              ? <CheckCircle className="w-6 h-6 text-green-600" />
              : lastSync.estado === 'error'
              ? <XCircle className="w-6 h-6 text-red-600" />
              : <Clock className="w-6 h-6 text-blue-600" />}
            <div>
              <p className="font-bold text-gray-800">
                Última sincronización: {timeAgo(lastSync.inicio)}
              </p>
              <p className="text-sm text-gray-600">
                {lastSync.mensaje ?? `${formatNumber(lastSync.productos_procesados)} productos procesados`}
              </p>
            </div>
          </div>
          {lastSync.error_detalle && (
            <pre className="mt-3 text-xs text-red-700 bg-red-100 rounded p-3 overflow-x-auto whitespace-pre-wrap">
              {lastSync.error_detalle}
            </pre>
          )}
        </div>
      )}

      {/* Estadísticas últimas 24h */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{completados}</p>
            <p className="text-xs text-gray-500">Completados (24h)</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{errores}</p>
            <p className="text-xs text-gray-500">Errores (24h)</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{parciales}</p>
            <p className="text-xs text-gray-500">Parciales (24h)</p>
          </div>
        </div>
      </div>

      {/* Tabla de logs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Historial de sincronizaciones</h2>
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
                <th className="px-4 py-3 text-right">Precios</th>
                <th className="px-4 py-3 text-right">Descontinuados</th>
                <th className="px-4 py-3 text-left">Inicio</th>
                <th className="px-4 py-3 text-right">Duración</th>
                <th className="px-4 py-3 text-left">Archivo FTP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    Sin logs registrados aún.
                  </td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">{log.proceso}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      log.estado === 'completado' ? 'bg-green-100 text-green-700' :
                      log.estado === 'error'      ? 'bg-red-100 text-red-700' :
                      log.estado === 'parcial'    ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {log.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{formatNumber(log.productos_procesados)}</td>
                  <td className="px-4 py-3 text-right text-green-600">{formatNumber(log.productos_nuevos)}</td>
                  <td className="px-4 py-3 text-right text-blue-600">{formatNumber(log.productos_actualizados)}</td>
                  <td className="px-4 py-3 text-right text-purple-600">{formatNumber(log.precios_actualizados)}</td>
                  <td className="px-4 py-3 text-right text-red-600">{formatNumber(log.productos_descontinuados)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(log.inicio, true)}</td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs">
                    {log.duracion_segundos != null ? `${log.duracion_segundos}s` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono truncate max-w-xs">
                    {log.archivo_ftp ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
