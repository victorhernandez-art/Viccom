import { supabaseAdmin } from '../../utils/supabase'
import { logger }        from '../../utils/logger'

const DEFAULT_MARGIN = 30

interface PriceStats {
  precios_actualizados: number
}

export async function calculatePrices(): Promise<PriceStats> {
  // Llamar a la función SQL que ya hace el cálculo correcto con prioridad de márgenes
  const { data, error } = await supabaseAdmin.rpc('recalcular_precios_masivo', {
    p_motivo:  'sync_ct',
    p_usuario: 'sync-service',
  })

  if (error) {
    logger.error('Error calling recalcular_precios_masivo', { error: error.message })
    throw error
  }

  const precios_actualizados = Number(data ?? 0)
  logger.info(`Prices calculated for ${precios_actualizados} products`)

  return { precios_actualizados }
}
