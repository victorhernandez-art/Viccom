// ─────────────────────────────────────────────────────────────────────────────
// Motor de cálculo de precios VICCOM
// Fórmula: Precio Público = Costo CT × (1 + Margen%)
// Prioridad: margen_producto > margen_categoria > margen_global (30%)
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_MARGIN = 30 // % por defecto

/**
 * Calcula el precio público a partir del costo y el margen.
 * Nueva versión: Aplica 16% de IVA y luego el margen de ganancia.
 */
export function calcularPrecioPublico(costoCt: number, margen: number): number {
  return Math.round(costoCt * 1.16 * (1 + margen / 100) * 100) / 100
}

/**
 * Determina el margen efectivo a aplicar según la jerarquía de prioridad.
 */
export function resolverMargen(
  margenProducto: number | null | undefined,
  margenCategoria: number | null | undefined,
  margenGlobal: number | null | undefined
): number {
  return margenProducto ?? margenCategoria ?? margenGlobal ?? DEFAULT_MARGIN
}

/**
 * Calcula precio y margen efectivo de forma unificada.
 */
export function calcularPrecioConMargen(
  costoCt: number,
  margenProducto?: number | null,
  margenCategoria?: number | null,
  margenGlobal?: number | null
): { precio: number; margenAplicado: number } {
  const margenAplicado = resolverMargen(margenProducto, margenCategoria, margenGlobal)
  const precio = calcularPrecioPublico(costoCt, margenAplicado)
  return { precio, margenAplicado }
}

/**
 * Extrae el costo a partir del precio público y el margen.
 * Útil para auditoría.
 */
export function calcularCostoDesdePrecio(precioPublico: number, margen: number): number {
  if (margen === -100) return 0
  return Math.round((precioPublico / 1.16 / (1 + margen / 100)) * 100) / 100
}

/**
 * Formatea el margen como porcentaje legible.
 */
export function formatMargen(margen: number): string {
  return `${margen}%`
}
