import { supabaseAdmin }   from '../../utils/supabase'
import { slugify }         from '../../utils/slugify'
import { logger }          from '../../utils/logger'
import { type CTProduct }  from './processCatalog'
import { syncCategoryTreeFromCT } from './categories'

interface SyncStats {
  productos_nuevos:         number
  productos_actualizados:   number
  productos_descontinuados: number
}

export async function syncProducts(ctProducts: CTProduct[]): Promise<SyncStats> {
  const stats: SyncStats = {
    productos_nuevos:         0,
    productos_actualizados:   0,
    productos_descontinuados: 0,
  }

  // Obtener todas las marcas y categorías existentes (o crearlas)
  const brandMap = await ensureBrands(ctProducts)

  // Log diagnóstico: cuantos productos tienen precio de promoción
  const conPromocion = ctProducts.filter(p => p.precioPromocion && p.precioPromocion > 0)
  logger.info(`[syncProducts] Productos con promoción en catálogo CT: ${conPromocion.length} / ${ctProducts.length}`)
  if (conPromocion.length > 0 && conPromocion.length <= 10) {
    conPromocion.forEach(p => logger.info(`  SKU=${p.clave} precioPromo=${p.precioPromocion} vigencia=${p.promocionVigenciaFin ?? 'sin fecha'}`))
  }

  // Obtener productos existentes con campos mínimos para diff inteligente
  const existingProductMap = new Map<string, {
    costo_ct: number
    costo_promocion: number | null
    existencia_total: number
    activo: boolean
    descontinuado: boolean
  }>()

  let page = 0
  const PAGE_SIZE = 1000
  let hasMore = true

  while (hasMore) {
    const { data: chunk, error } = await supabaseAdmin
      .from('products')
      .select('sku_ct, costo_ct, costo_promocion, existencia_total, activo, descontinuado')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      logger.error('Error fetching existing products for smart diff', { error: error.message })
      break
    }

    if (chunk && chunk.length > 0) {
      for (const row of chunk) {
        existingProductMap.set(row.sku_ct, {
          costo_ct: Number(row.costo_ct ?? 0),
          costo_promocion: row.costo_promocion !== null ? Number(row.costo_promocion) : null,
          existencia_total: Number(row.existencia_total ?? 0),
          activo: Boolean(row.activo),
          descontinuado: Boolean(row.descontinuado),
        })
      }
      page++
      if (chunk.length < PAGE_SIZE) hasMore = false
    } else {
      hasMore = false
    }
  }

  const existingSet = new Set(existingProductMap.keys())
  const incomingSet = new Set(ctProducts.map(p => p.clave))
  logger.info(`[syncProducts] Loaded ${existingProductMap.size} existing products for change detection`)

  // Filtrar solo productos con cambios reales o nuevos
  const productsToUpsert: CTProduct[] = []

  for (const p of ctProducts) {
    const existing = existingProductMap.get(p.clave)
    const existenciaTotal = p.existencia.reduce((total, item) => total + Number(item.existencia ?? 0), 0)
    const isUsd = p.moneda?.toUpperCase() === 'USD'
    const tipoCambio = Number(p.tipoCambio ?? 1)
    const costoPesos = Number((p.precio * (isUsd ? tipoCambio : 1)).toFixed(2))

    let costoPromocionPesos: number | null = null
    if (p.precioPromocion && p.precioPromocion > 0) {
      costoPromocionPesos = Number((p.precioPromocion * (isUsd ? tipoCambio : 1)).toFixed(2))
    }

    if (!existing) {
      // Producto nuevo -> debe guardarse
      productsToUpsert.push(p)
      stats.productos_nuevos++
    } else {
      // Comparar cambios reales
      const costoCambio = Math.abs(existing.costo_ct - costoPesos) > 0.01
      const promoCambio = existing.costo_promocion !== costoPromocionPesos
      const stockCambio = existing.existencia_total !== existenciaTotal
      const activoCambio = existing.activo !== p.activo || existing.descontinuado === true

      if (costoCambio || promoCambio || stockCambio || activoCambio) {
        productsToUpsert.push(p)
        stats.productos_actualizados++
      }
    }
  }

  logger.info(`[syncProducts] Smart diff result: ${productsToUpsert.length} modified/new products to upsert out of ${ctProducts.length} total (${ctProducts.length - productsToUpsert.length} unchanged skipped)`)

  // Upsert de productos únicamente modificados en lotes de 500
  const BATCH = 500
  for (let i = 0; i < productsToUpsert.length; i += BATCH) {
    const batch = productsToUpsert.slice(i, i + BATCH)
    const categoryIds = await resolveCategoryIds(batch)

    const rows = batch.map(p => {
      const existenciaTotal = p.existencia.reduce((total, item) => {
        return total + Number(item.existencia ?? 0)
      }, 0)

      const isUsd = p.moneda?.toUpperCase() === 'USD'
      const tipoCambio = Number(p.tipoCambio ?? 1)
      const costoPesos = Number((p.precio * (isUsd ? tipoCambio : 1)).toFixed(2))

      let costoPromocionPesos: number | null = null
      if (p.precioPromocion && p.precioPromocion > 0) {
        costoPromocionPesos = Number((p.precioPromocion * (isUsd ? tipoCambio : 1)).toFixed(2))
      }

      const categoryPath = getProductCategoryPath(p)

      return {
        sku_ct:       p.clave,
        nombre:       p.nombre,
        slug:         slugify(p.nombre) + '-' + p.clave.toLowerCase(),
        descripcion:  p.descripcion,
        imagen_principal: p.imagen,
        marca_id:     brandMap.get(p.marca.toLowerCase()) ?? null,
        categoria_id: categoryIds.get(categoryPath.join('/').toLowerCase()) ?? null,
        subcategoria: p.subcategoria,
        costo_ct:     costoPesos,
        costo_promocion: costoPromocionPesos,
        precio_publico: costoPromocionPesos ?? costoPesos,
        existencia_total: existenciaTotal,
        peso_kg:      p.peso,
        dimensiones: {
          alto:  p.alto,
          largo: p.largo,
          ancho: p.ancho,
          unidad: 'cm',
        },
        especificaciones: {
          upc:    p.upc,
          moneda: 'MXN',
          ficha_tecnica: p.especificaciones_tecnicas || []
        },
        activo:       p.activo,
        en_oferta:    costoPromocionPesos !== null,
        fecha_fin_oferta: p.promocionVigenciaFin ? new Date(p.promocionVigenciaFin).toISOString() : null,
        descontinuado: false,
        fecha_actualizacion: new Date().toISOString(),
      }
    })

    const { error } = await supabaseAdmin
      .from('products')
      .upsert(rows, { onConflict: 'sku_ct' })

    if (error) {
      logger.error('Error upserting products batch', { error: error.message, offset: i })
      continue
    }
  }

  // Marcar descontinuados: SKUs que están en DB pero no en el catálogo
  const descontinuados = [...existingSet].filter(sku => !incomingSet.has(sku))
  if (descontinuados.length > 0) {
    const { error } = await supabaseAdmin
      .from('products')
      .update({ descontinuado: true, activo: false })
      .in('sku_ct', descontinuados)

    if (error) {
      logger.error('Error marking discontinued products', { error: error.message })
    } else {
      stats.productos_descontinuados = descontinuados.length
      logger.info(`Marked ${descontinuados.length} products as discontinued`)
    }
  }

  return stats
}

function getProductCategoryPath(product: CTProduct): string[] {
  const path = product.categoriaPath?.length
    ? product.categoriaPath
    : [product.categoria, product.subcategoria]

  return path.map(value => value.trim()).filter(Boolean)
}

async function resolveCategoryIds(products: CTProduct[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()

  for (const product of products) {
    const path = getProductCategoryPath(product)
    if (path.length === 0) continue

    const key = path.join('/').toLowerCase()
    if (map.has(key)) continue

    const category = await syncCategoryTreeFromCT(path)
    if (category) map.set(key, category.id)
  }

  return map
}

async function ensureBrands(ctProducts: CTProduct[]): Promise<Map<string, string>> {
  const brandNames = [...new Set(ctProducts.map(p => p.marca).filter(Boolean))]
  const map        = new Map<string, string>()

  const { data: existing } = await supabaseAdmin.from('brands').select('id,nombre')
  existing?.forEach(b => map.set(b.nombre.toLowerCase(), b.id))

  const missing = brandNames.filter(n => !map.has(n.toLowerCase()))
  if (missing.length > 0) {
    const rows = missing.map(nombre => ({
      nombre,
      slug:   slugify(nombre),
      activo: true,
    }))
    const { data: inserted } = await supabaseAdmin
      .from('brands')
      .insert(rows)
      .select('id,nombre')

    inserted?.forEach(b => map.set(b.nombre.toLowerCase(), b.id))
    logger.info(`Created ${missing.length} new brands`)
  }

  return map
}
