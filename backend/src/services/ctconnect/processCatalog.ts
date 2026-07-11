import * as fs   from 'fs'
import { logger } from '../../utils/logger'

export interface CTProduct {
  clave:        string
  nombre:       string
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

    return {
      clave:        String(i.clave ?? i.sku ?? ''),
      nombre:       String(i.nombre ?? i.descripcion ?? ''),
      precio:       Number(i.precio ?? i.precio_lista ?? 0),
      moneda:       String(i.moneda ?? 'MXN'),
      marca:        String(i.marca ?? i.brand ?? ''),
      categoria:    categoriaPath[0] ?? String(i.categoria ?? i.category ?? ''),
      subcategoria: categoriaPath[1] ?? String(i.subcategoria ?? ''),
      categoriaPath,
      imagen:       String(i.imagen ?? i.img ?? ''),
      descripcion:  String(i.descripcion_larga ?? i.descripcion ?? ''),
      peso:         Number(i.peso ?? 0),
      alto:         Number(i.alto ?? 0),
      largo:        Number(i.largo ?? 0),
      ancho:        Number(i.ancho ?? 0),
      upc:          String(i.upc ?? ''),
      activo:       i.activo !== false,
      existencia:   Array.isArray(i.existencia) ? (i.existencia as CTAlmacen[]) : [],
    }
  }).filter(p => p.clave !== '')

  logger.info(`Parsed ${products.length} valid products`)
  return products
}
