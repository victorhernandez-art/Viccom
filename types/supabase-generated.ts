// Auto-generated type definitions for Supabase
// Run: npx supabase gen types typescript --project-id <id> > types/supabase-generated.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          nombre: string
          slug: string
          logo_url: string | null
          descripcion: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          slug: string
          logo_url?: string | null
          descripcion?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          slug?: string
          logo_url?: string | null
          descripcion?: string | null
          activo?: boolean
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          nombre: string
          slug: string
          parent_id: string | null
          nivel: number
          path: string | null
          ct_key: string | null
          ct_parent_key: string | null
          descripcion: string | null
          imagen_url: string | null
          margen_override: number | null
          orden: number
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
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
          orden?: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          slug?: string
          parent_id?: string | null
          nivel?: number
          path?: string | null
          ct_key?: string | null
          ct_parent_key?: string | null
          descripcion?: string | null
          imagen_url?: string | null
          margen_override?: number | null
          orden?: number
          activo?: boolean
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          sku_ct: string
          nombre: string
          slug: string
          descripcion: string | null
          marca_id: string | null
          categoria_id: string | null
          subcategoria: string | null
          costo_ct: number
          margen_override: number | null
          precio_publico: number
          precio_antes: number | null
          margen_aplicado: number
          existencia_total: number
          imagen_principal: string | null
          imagenes_adicionales: string[] | null
          activo: boolean
          destacado: boolean
          en_oferta: boolean
          fecha_fin_oferta: string | null
          descontinuado: boolean
          peso_kg: number | null
          dimensiones: Json | null
          especificaciones: Json | null
          fecha_actualizacion: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
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
          precio_antes?: number | null
          margen_aplicado?: number
          existencia_total?: number
          imagen_principal?: string | null
          imagenes_adicionales?: string[] | null
          activo?: boolean
          destacado?: boolean
          en_oferta?: boolean
          fecha_fin_oferta?: string | null
          descontinuado?: boolean
          peso_kg?: number | null
          dimensiones?: Json | null
          especificaciones?: Json | null
          fecha_actualizacion?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku_ct?: string
          nombre?: string
          slug?: string
          descripcion?: string | null
          marca_id?: string | null
          categoria_id?: string | null
          subcategoria?: string | null
          costo_ct?: number
          margen_override?: number | null
          precio_publico?: number
          precio_antes?: number | null
          margen_aplicado?: number
          existencia_total?: number
          imagen_principal?: string | null
          imagenes_adicionales?: string[] | null
          activo?: boolean
          destacado?: boolean
          en_oferta?: boolean
          fecha_fin_oferta?: string | null
          descontinuado?: boolean
          peso_kg?: number | null
          dimensiones?: Json | null
          especificaciones?: Json | null
          fecha_actualizacion?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          almacen: string
          almacen_nombre: string | null
          existencia: number
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          almacen: string
          almacen_nombre?: string | null
          existencia?: number
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          almacen?: string
          almacen_nombre?: string | null
          existencia?: number
          updated_at?: string
        }
      }
      sync_logs: {
        Row: {
          id: string
          proceso: string
          estado: string
          productos_procesados: number
          productos_nuevos: number
          productos_actualizados: number
          productos_descontinuados: number
          precios_actualizados: number
          mensaje: string | null
          error_detalle: string | null
          duracion_segundos: number | null
          archivo_ftp: string | null
          inicio: string
          fin: string | null
          created_at: string
        }
        Insert: {
          id?: string
          proceso: string
          estado: string
          productos_procesados?: number
          productos_nuevos?: number
          productos_actualizados?: number
          productos_descontinuados?: number
          precios_actualizados?: number
          mensaje?: string | null
          error_detalle?: string | null
          duracion_segundos?: number | null
          archivo_ftp?: string | null
          inicio?: string
          fin?: string | null
          created_at?: string
        }
        Update: {
          estado?: string
          productos_procesados?: number
          productos_nuevos?: number
          productos_actualizados?: number
          productos_descontinuados?: number
          precios_actualizados?: number
          mensaje?: string | null
          error_detalle?: string | null
          duracion_segundos?: number | null
          fin?: string | null
        }
      }
      price_history: {
        Row: {
          id: string
          product_id: string
          producto_nombre: string
          sku_ct: string
          costo_anterior: number | null
          margen_anterior: number | null
          precio_anterior: number | null
          costo_nuevo: number | null
          margen_nuevo: number | null
          precio_nuevo: number | null
          motivo: string | null
          usuario: string
          created_at: string
        }
        Insert: {
          id?: string
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
          usuario?: string
          created_at?: string
        }
        Update: Record<string, never>
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string
          description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string | null
          updated_at?: string
        }
        Update: {
          value?: string
          description?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      v_products_catalog: {
        Row: {
          id: string
          sku_ct: string
          nombre: string
          slug: string
          descripcion: string | null
          subcategoria: string | null
          costo_ct: number
          precio_publico: number
          precio_antes: number | null
          margen_aplicado: number
          existencia_total: number
          existencia_tuxtla: number | null
          imagen_principal: string | null
          activo: boolean
          destacado: boolean
          en_oferta: boolean
          fecha_fin_oferta: string | null
          fecha_actualizacion: string
          marca_id: string | null
          marca_nombre: string | null
          marca_slug: string | null
          marca_logo: string | null
          categoria_id: string | null
          categoria_nombre: string | null
          categoria_slug: string | null
          categoria_parent_id: string | null
          categoria_nivel: number | null
          categoria_path: string | null
        }
      }
    }
    Functions: {
      calcular_precio_publico: {
        Args: { p_product_id: string }
        Returns: number
      }
      recalcular_precios_masivo: {
        Args: {
          p_categoria_id?: string
          p_usuario?: string
          p_motivo?: string
        }
        Returns: number
      }
      buscar_productos: {
        Args: {
          p_query: string
          p_limit?: number
          p_offset?: number
        }
        Returns: Array<{
          id: string
          nombre: string
          slug: string
          precio_publico: number
          imagen_principal: string | null
          marca_nombre: string | null
          categoria_nombre: string | null
          existencia_total: number
          rank: number
        }>
      }
      get_category_descendants: {
        Args: { p_category_id: string }
        Returns: Array<{ id: string }>
      }
      get_category_by_path: {
        Args: { p_path: string }
        Returns: Array<{
          id: string
          nombre: string
          slug: string
          parent_id: string | null
          nivel: number
          path: string | null
        }>
      }
    }
  }
}
