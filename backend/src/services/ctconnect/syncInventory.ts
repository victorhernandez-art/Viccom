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

  // Conjunto de product_ids que vienen en el FTP (para borrar sus registros viejos)
  const productIdsInSync = new Set<string>()

  for (const p of ctProducts) {
    const productId = skuToId.get(p.clave)
    if (!productId) continue

    productIdsInSync.add(productId)

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

  // PASO 1: Borrar los registros OBSOLETOS de inventario (almacenes que CT ya no envía)
  // NOTA: Se usa lote de 100 UUIDs máximo para respetar el límite de URL de PostgREST (~8 KB)
  // Con 500 UUIDs la URL supera 18 KB y Supabase devuelve null silenciosamente.
  const productIdArray = Array.from(productIdsInSync)
  const SELECT_BATCH = 100
  const freshKeys = new Set(rows.map(r => `${r.product_id}:${r.almacen}`))
  let totalStaleDeleted = 0

  for (let i = 0; i < productIdArray.length; i += SELECT_BATCH) {
    const batchIds = productIdArray.slice(i, i + SELECT_BATCH)

    // Obtener los almacenes actuales en la BD para estos productos
    const { data: existingRows, error: selErr } = await supabaseAdmin
      .from('inventory')
      .select('product_id, almacen')
      .in('product_id', batchIds)

    if (selErr) {
      logger.error('Error fetching existing inventory for stale check', { error: selErr.message })
      continue
    }

    if (!existingRows || existingRows.length === 0) continue

    // Filtrar los registros que ya NO están en el FTP (registros fantasma)
    const staleRows = existingRows.filter(
      r => !freshKeys.has(`${r.product_id}:${r.almacen}`)
    )

    if (staleRows.length === 0) continue

    logger.info(`Deleting ${staleRows.length} stale inventory records (batch ${Math.floor(i / SELECT_BATCH) + 1})`)

    // Agrupar por almacen para borrar en micro-lotes
    const staleByAlmacen = new Map<string, string[]>()
    for (const r of staleRows) {
      if (!staleByAlmacen.has(r.almacen)) staleByAlmacen.set(r.almacen, [])
      staleByAlmacen.get(r.almacen)!.push(r.product_id)
    }

    for (const [almacen, pIds] of staleByAlmacen) {
      const { error, count } = await supabaseAdmin
        .from('inventory')
        .delete({ count: 'exact' })
        .eq('almacen', almacen)
        .in('product_id', pIds)

      if (error) {
        logger.error('Error deleting stale inventory', { error: error.message, almacen })
      } else {
        totalStaleDeleted += count ?? 0
      }
    }
  }

  if (totalStaleDeleted > 0) {
    logger.info(`Total stale inventory records deleted: ${totalStaleDeleted}`)
  }

  // PASO 2: Upsert con los datos frescos del FTP
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
