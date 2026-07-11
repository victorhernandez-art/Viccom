import { type Database } from './supabase-generated'

export type { Database }

// Tipos derivados de las tablas
export type DbProduct    = Database['public']['Tables']['products']['Row']
export type DbBrand      = Database['public']['Tables']['brands']['Row']
export type DbCategory   = Database['public']['Tables']['categories']['Row']
export type DbInventory  = Database['public']['Tables']['inventory']['Row']
export type DbSyncLog    = Database['public']['Tables']['sync_logs']['Row']
export type DbPriceHist  = Database['public']['Tables']['price_history']['Row']
export type DbSetting    = Database['public']['Tables']['settings']['Row']

// Tipos para INSERT
export type InsertProduct   = Database['public']['Tables']['products']['Insert']
export type InsertBrand     = Database['public']['Tables']['brands']['Insert']
export type InsertCategory  = Database['public']['Tables']['categories']['Insert']
export type InsertInventory = Database['public']['Tables']['inventory']['Insert']
export type InsertSyncLog   = Database['public']['Tables']['sync_logs']['Insert']
export type InsertPriceHist = Database['public']['Tables']['price_history']['Insert']

// Tipos para UPDATE
export type UpdateProduct   = Database['public']['Tables']['products']['Update']
export type UpdateBrand     = Database['public']['Tables']['brands']['Update']
export type UpdateCategory  = Database['public']['Tables']['categories']['Update']
