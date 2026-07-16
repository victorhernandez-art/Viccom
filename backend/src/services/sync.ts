import { downloadCatalog }  from './ctconnect/downloadCatalog'
import { processCatalog }   from './ctconnect/processCatalog'
import { syncProducts }     from './ctconnect/syncProducts'
import { syncInventory }    from './ctconnect/syncInventory'
import { calculatePrices }  from './ctconnect/calculatePrices'
import { saveLogs }         from './ctconnect/saveLogs'
import { logger }           from '../utils/logger'

export async function runFullSync(): Promise<void> {
  const startTime = Date.now()
  const proceso   = 'full_sync'

  logger.info(`[${proceso}] Starting full catalog sync`)

  const logData = {
    proceso,
    inicio:                  new Date().toISOString(),
    estado:                  'iniciado' as string,
    productos_procesados:    0,
    productos_nuevos:        0,
    productos_actualizados:  0,
    precios_actualizados:    0,
    productos_descontinuados: 0,
    duracion_segundos:       0,
    archivo_ftp:             null as string | null,
    error_detalle:           null as string | null,
    mensaje:                 null as string | null,
  }

  try {
    // 1. Descargar catálogo vía FTP
    logger.info(`[${proceso}] Downloading catalog from CT Connect FTP`)
    const { filePath, fileName } = await downloadCatalog()
    logData.archivo_ftp = fileName
    logger.info(`[${proceso}] Downloaded: ${fileName}`)

    // 2. Parsear JSON del catálogo
    logger.info(`[${proceso}] Parsing catalog JSON`)
    const ctProducts = await processCatalog(filePath)
    logger.info(`[${proceso}] Parsed ${ctProducts.length} products`)

    // 3. Sincronizar productos en Supabase
    logger.info(`[${proceso}] Syncing products to Supabase`)
    const syncStats = await syncProducts(ctProducts)
    Object.assign(logData, syncStats)
    logData.productos_procesados = ctProducts.length
    logger.info(`[${proceso}] Products synced — new: ${syncStats.productos_nuevos}, updated: ${syncStats.productos_actualizados}`)

    // 4. Sincronizar inventario por almacén
    logger.info(`[${proceso}] Syncing inventory`)
    const inventoryStats = await syncInventory(ctProducts)
    logger.info(`[${proceso}] Inventory synced`)

    // 5. Calcular precios con márgenes
    logger.info(`[${proceso}] Calculating prices`)
    const priceStats = await calculatePrices()
    logData.precios_actualizados = priceStats.precios_actualizados
    logger.info(`[${proceso}] Prices calculated: ${priceStats.precios_actualizados}`)

    logData.estado  = 'completado'
    logData.mensaje = `Sincronización completada: ${ctProducts.length} productos procesados.`

  } catch (err) {
    logData.estado       = 'error'
    logData.error_detalle = err instanceof Error 
      ? `${err.message}\n${err.stack}` 
      : (typeof err === 'object' && err !== null 
          ? JSON.stringify(err, null, 2) 
          : String(err))
    logData.mensaje      = 'Error durante la sincronización.'
    logger.error(`[${proceso}] Sync failed`, { error: logData.error_detalle })
  } finally {
    logData.duracion_segundos = Math.round((Date.now() - startTime) / 1000)
    await saveLogs(logData)
    logger.info(`[${proceso}] Completed in ${logData.duracion_segundos}s — state: ${logData.estado}`)
  }
}
