import * as fs   from 'fs'
import { logger } from '../../utils/logger'

export interface CTProduct {
  clave:        string
  nombre:       string
  numParte:     string
  modelo:       string
  precio:       number
  moneda:       string
  marca:        string
  categoria:    string
  subcategoria: string
  categoriaPath: string[]
  imagen:       string
  descripcion:  string
  peso:         number
  alto:         number
  largo:        number
  ancho:        number
  upc:          string
  activo:       boolean
  existencia:   CTAlmacen[]
  tipoCambio:   number
  especificaciones_tecnicas: any[]
  precioPromocion?: number
  promocionVigenciaFin?: string
}

/**
 * Construye una descripción enriquecida combinando todos los datos disponibles
 * del catálogo de CT (descripcion_corta + especificaciones + metadatos),
 * simulando la descripción detallada que CT muestra en su sitio web.
 */
function buildRichDescription(item: Record<string, unknown>, specs: any[]): string {
  const nombre   = String(item.nombre ?? '')
  const descCorta = String(item.descripcion_corta ?? '')
  const marca    = String(item.marca ?? '')
  const modelo   = String(item.modelo ?? '')
  const numParte = String(item.numParte ?? '')
  const subcategoria = String(item.subcategoria ?? '')

  // Inicio: descripción corta del catálogo
  const parts: string[] = []

  // Encabezado descriptivo
  if (subcategoria && marca) {
    parts.push(`${subcategoria} ${marca} ${modelo || nombre}.`)
  }

  // Descripción corta original de CT
  if (descCorta) {
    parts.push(descCorta + '.')
  }

  // Metadatos del producto
  const meta: string[] = []
  if (numParte) meta.push(`Número de parte: ${numParte}`)
  if (modelo)   meta.push(`Modelo: ${modelo}`)
  if (meta.length > 0) {
    parts.push(meta.join('. ') + '.')
  }

  // Especificaciones técnicas completas redactadas
  if (specs && specs.length > 0) {
    const specText = specs
      .map((s: any) => `${s.tipo}: ${s.valor}`)
      .join('; ')
    parts.push('Especificaciones: ' + specText + '.')
  }

  // Disclaimer estándar
  parts.push('Consulte características y ficha técnica para validar que cubra sus necesidades antes de adquirir el producto. Precio y disponibilidad sujetos a cambios sin previo aviso.')

  return parts.join(' ')
}

export interface CTAlmacen {
  almacen:    string
  existencia: number
}

function readCategoryPath(item: Record<string, unknown>): string[] {
  const rawPath = item.categoria_path ?? item.category_path ?? item.categorias ?? item.categories

  if (Array.isArray(rawPath)) {
    return rawPath.map(value => String(value)).filter(Boolean)
  }

  if (typeof rawPath === 'string' && rawPath.trim()) {
    return rawPath
      .split(/[>/|]/)
      .map(value => value.trim())
      .filter(Boolean)
  }

  return [
    item.categoria ?? item.category ?? item.linea ?? item.departamento,
    item.subcategoria ?? item.subcategory ?? item.familia,
    item.subsubcategoria ?? item.subsubcategory ?? item.subfamilia,
  ].map(value => String(value ?? '')).filter(Boolean)
}

export async function processCatalog(filePath: string): Promise<CTProduct[]> {
  logger.info(`Parsing catalog file: ${filePath}`)

  const raw  = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw)

  // CT Connect puede enviar el array directamente o dentro de una propiedad
  let items: unknown[]
  if (Array.isArray(data)) {
    items = data
  } else if (data?.productos && Array.isArray(data.productos)) {
    items = data.productos
  } else if (data?.data && Array.isArray(data.data)) {
    items = data.data
  } else {
    throw new Error('Formato de catálogo CT Connect no reconocido')
  }

  const products: CTProduct[] = items.map((item: unknown) => {
    const i = item as Record<string, unknown>
    const categoriaPath = readCategoryPath(i)
    const specs = Array.isArray(i.especificaciones) ? i.especificaciones : []

    let precioPromocion: number | undefined = undefined
    let promocionVigenciaFin: string | undefined = undefined

    if (Array.isArray(i.promociones) && i.promociones.length > 0) {
      const promoImporte = i.promociones.find((p: any) => p.tipo === 'importe' && Number(p.promocion) > 0)
      if (promoImporte) {
        precioPromocion = Number(promoImporte.promocion)
        if (promoImporte.vigencia?.fin) {
          promocionVigenciaFin = String(promoImporte.vigencia.fin)
        }
      }
    }

    return {
      clave:        String(i.clave ?? i.sku ?? ''),
      nombre:       String(i.nombre ?? i.descripcion ?? ''),
      numParte:     String(i.numParte ?? i.num_parte ?? ''),
      modelo:       String(i.modelo ?? i.model ?? ''),
      precio:       Number(i.precio ?? i.precio_lista ?? 0),
      moneda:       String(i.moneda ?? 'MXN'),
      marca:        String(i.marca ?? i.brand ?? ''),
      categoria:    categoriaPath[0] ?? String(i.categoria ?? i.category ?? ''),
      subcategoria: categoriaPath[1] ?? String(i.subcategoria ?? ''),
      categoriaPath,
      imagen:       String(i.imagen ?? i.img ?? ''),
      descripcion:  buildRichDescription(i, specs),
      peso:         Number(i.peso ?? 0),
      alto:         Number(i.alto ?? 0),
      largo:        Number(i.largo ?? 0),
      ancho:        Number(i.ancho ?? 0),
      upc:          String(i.upc && String(i.upc).trim() !== '' ? i.upc : (i.ean ?? i.gtin ?? '')),
      activo:       i.activo !== false,
      tipoCambio:   Number(i.tipoCambio ?? i.tipo_cambio ?? 1),
      especificaciones_tecnicas: specs,
      precioPromocion,
      promocionVigenciaFin,
      existencia: (i.existencia && typeof i.existencia === 'object' && !Array.isArray(i.existencia))
        ? Object.entries(i.existencia).map(([almacen, cantidad]) => ({
            almacen,
            existencia: Number(cantidad ?? 0)
          }))
        : (Array.isArray(i.existencia) ? (i.existencia as CTAlmacen[]) : []),
    }
  }).filter(p => p.clave !== '')

  logger.info(`Parsed ${products.length} valid products`)
  return products
}
