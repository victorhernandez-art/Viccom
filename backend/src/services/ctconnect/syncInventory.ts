import { supabaseAdmin }  from '../../utils/supabase'
import { logger }         from '../../utils/logger'
import { type CTProduct } from './processCatalog'

export async function syncInventory(ctProducts: CTProduct[]): Promise<void> {
  // Obtener mapa sku_ct → product_id
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id,sku_ct')

  const skuToId = new Map<string, string>((products ?? []).map(p => [p.sku_ct, p.id]))

  const rows: {
    product_id:  string
    almacen:     string
    existencia:  number
  }[] = []

  for (const p of ctProducts) {
    const productId = skuToId.get(p.clave)
    if (!productId) continue

    for (const almacen of p.existencia) {
      rows.push({
        product_id:  productId,
        almacen:     almacen.almacen,
        existencia:  almacen.existencia,
      })
    }
  }

  if (rows.length === 0) {
    logger.warn('No inventory rows to sync')
    return
  }

  // Upsert en lotes
  const BATCH = 1000
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabaseAdmin
      .from('inventory')
      .upsert(batch, { onConflict: 'product_id,almacen' })

    if (error) {
      logger.error('Error upserting inventory batch', { error: error.message, offset: i })
    }
  }

  logger.info(`Synced ${rows.length} inventory records`)
}
