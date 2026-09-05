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

    const precioBase = Number(i.precio ?? i.precio_lista ?? 0)

    let precioPromocion: number | undefined = undefined
    let promocionVigenciaFin: string | undefined = undefined

    if (precioBase > 0 && Array.isArray(i.promociones) && i.promociones.length > 0) {
      // Filtrar y calcular el costo neto de cada promoción según su tipo:
      // - 'porcentaje': p.promocion representa el % de descuento (ej: 10, 20, 50%).
      //                 costo = precioBase * (1 - p.promocion / 100)
      // - 'importe':    p.promocion representa el costo promocional directo en moneda (ej: 76.20).
      //                 costo = p.promocion
      interface EvaluatedPromo {
        costoPromo: number
        vigenciaFin?: string
      }

      const promosEvaluadas: EvaluatedPromo[] = i.promociones
        .map((p: any): EvaluatedPromo | null => {
          const val = Number(p?.promocion)
          if (isNaN(val) || val <= 0) return null

          const tipo = String(p?.tipo ?? '').toLowerCase().trim()
          let costoPromo: number | null = null

          if (tipo === 'porcentaje' || tipo.includes('porcent')) {
            if (val > 0 && val < 100) {
              costoPromo = Number((precioBase * (1 - val / 100)).toFixed(2))
            }
          } else if (tipo === 'importe' || tipo === 'precio') {
            if (val < precioBase) {
              costoPromo = Number(val.toFixed(2))
            }
          } else {
            // Fallback para tipos sin especificar: si el valor es menor al costo base
            if (val < precioBase) {
              costoPromo = Number(val.toFixed(2))
            }
          }

          if (costoPromo === null || costoPromo <= 0 || costoPromo >= precioBase) {
            return null
          }

          return {
            costoPromo,
            vigenciaFin: p?.vigencia?.fin ? String(p.vigencia.fin) : undefined,
          }
        })
        .filter((p): p is EvaluatedPromo => p !== null)

      if (promosEvaluadas.length > 0) {
        // Elegir la promoción que resulta en el MENOR costo (mayor ahorro para el cliente)
        const mejorPromo = promosEvaluadas.reduce((best, curr) =>
          curr.costoPromo < best.costoPromo ? curr : best
        )
        precioPromocion = mejorPromo.costoPromo
        promocionVigenciaFin = mejorPromo.vigenciaFin
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
