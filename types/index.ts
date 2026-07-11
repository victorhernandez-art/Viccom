// ─────────────────────────────────────────────────────────────────────────────
// VICCOM — Tipos TypeScript globales
// ─────────────────────────────────────────────────────────────────────────────

// ─── MODELOS DE BASE DE DATOS ─────────────────────────────────────────────────

export interface Brand {
  id: string
  nombre: string
  slug: string
  logo_url?: string | null
  descripcion?: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  nombre: string
  slug: string
  parent_id?: string | null
  nivel?: number
  path?: string | null
  ct_key?: string | null
  ct_parent_key?: string | null
  descripcion?: string | null
  imagen_url?: string | null
  margen_override?: number | null
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  sku_ct: string
  nombre: string
  slug: string
  descripcion?: string | null
  marca_id?: string | null
  categoria_id?: string | null
  subcategoria?: string | null
  costo_ct: number
  margen_override?: number | null
  precio_publico: number
  precio_antes?: number | null        // precio original antes de la promoción
  margen_aplicado: number
  existencia_total: number
  imagen_principal?: string | null
  imagenes_adicionales?: string[] | null
  activo: boolean
  destacado: boolean
  en_oferta: boolean
  fecha_fin_oferta?: string | null    // fecha límite de la promoción (fin de mes)
  descontinuado: boolean
  peso_kg?: number | null
  dimensiones?: ProductDimensions | null
  especificaciones?: Record<string, string> | null
  fecha_actualizacion: string
  created_at: string
  updated_at: string
}

export interface ProductDimensions {
  largo?: number
  ancho?: number
  alto?: number
  unidad?: string
}

export interface InventoryItem {
  id: string
  product_id: string
  almacen: string
  almacen_nombre?: string | null
  existencia: number
  updated_at: string
}

export interface SyncLog {
  id: string
  proceso: string
  estado: 'iniciado' | 'completado' | 'error' | 'parcial'
  productos_procesados: number
  productos_nuevos: number
  productos_actualizados: number
  productos_descontinuados: number
  precios_actualizados: number
  mensaje?: string | null
  error_detalle?: string | null
  duracion_segundos?: number | null
  archivo_ftp?: string | null
  inicio: string
  fin?: string | null
  created_at: string
}

export interface PriceHistory {
  id: string
  product_id: string
  producto_nombre: string
  sku_ct: string
  costo_anterior?: number | null
  margen_anterior?: number | null
  precio_anterior?: number | null
  costo_nuevo?: number | null
  margen_nuevo?: number | null
  precio_nuevo?: number | null
  motivo?: string | null
  usuario: string
  created_at: string
}

export interface Setting {
  id: string
  key: string
  value: string
  description?: string | null
  updated_at: string
}

// ─── VISTAS ENRIQUECIDAS ──────────────────────────────────────────────────────

export interface ProductCatalog extends Product {
  existencia_tuxtla?: number | null
  marca_id: string | null
  marca_nombre?: string | null
  marca_slug?: string | null
  marca_logo?: string | null
  categoria_id: string | null
  categoria_nombre?: string | null
  categoria_slug?: string | null
  categoria_parent_id?: string | null
  categoria_nivel?: number | null
  categoria_path?: string | null
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
}

// ─── PARÁMETROS DE FILTRADO ───────────────────────────────────────────────────

export interface CatalogFilters {
  query?: string
  marcas?: string[]
  categorias?: string[]
  subcategorias?: string[]
  precio_min?: number
  precio_max?: number
  disponible?: boolean
  destacado?: boolean
  en_oferta?: boolean
  orderBy?: CatalogSortOption
  page?: number
  pageSize?: number
}

export type CatalogSortOption =
  | 'precio_asc'
  | 'precio_desc'
  | 'recientes'
  | 'disponibilidad'
  | 'nombre_asc'
  | 'relevancia'

// ─── RESPUESTAS PAGINADAS ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

// ─── RESPUESTA API ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ─── CONFIGURACIÓN DEL SISTEMA ────────────────────────────────────────────────

export interface SystemSettings {
  margen_global: number
  whatsapp_number: string
  whatsapp_message: string
  empresa_nombre: string
  empresa_correo: string
  empresa_telefono: string
  sync_activo: boolean
  sync_intervalo_min: number
  productos_por_pagina: number
}

// ─── ESTADÍSTICAS DEL DASHBOARD ──────────────────────────────────────────────

export interface DashboardStats {
  total_productos: number
  productos_activos: number
  productos_sin_existencia: number
  productos_destacados: number
  total_marcas: number
  total_categorias: number
  ultima_sincronizacion: string | null
  ultima_sincronizacion_estado: string | null
  errores_ultimo_dia: number
}

// ─── CT CONNECT ──────────────────────────────────────────────────────────────

export interface CTProduct {
  clave: string           // SKU del producto en CT
  numParte: string        // número de parte del fabricante
  nombre: string
  nombreCorto: string
  descripcion?: string
  especificaciones?: Record<string, string>
  marca: string
  categoria: string
  subcategoria?: string
  imagen?: string
  precio: number          // precio de costo
  moneda?: string         // 'MXN' por defecto
  existencia: CTInventory[]
  activo: boolean
}

export interface CTInventory {
  almacen: string
  existencia: number
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export interface PageMetadata {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  canonical?: string
  noIndex?: boolean
}
