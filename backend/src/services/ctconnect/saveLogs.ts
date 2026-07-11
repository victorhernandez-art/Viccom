import { supabaseAdmin } from '../../utils/supabase'
import { logger }        from '../../utils/logger'

interface SyncLogEntry {
  proceso:                  string
  inicio:                   string
  estado:                   string
  productos_procesados:     number
  productos_nuevos:         number
  productos_actualizados:   number
  precios_actualizados:     number
  productos_descontinuados: number
  duracion_segundos:        number
  archivo_ftp:              string | null
  error_detalle:            string | null
  mensaje:                  string | null
}

export async function saveLogs(entry: SyncLogEntry): Promise<void> {
  const { error } = await supabaseAdmin.from('sync_logs').insert(entry)

  if (error) {
    logger.error('Failed to save sync log', { error: error.message })
  }
}
