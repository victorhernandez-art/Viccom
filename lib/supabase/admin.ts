import { createClient } from '@supabase/supabase-js'
import { type Database } from '@/types/supabase-generated'

// Cliente con service role — SOLO usar en Server Actions y API Routes del servidor
// Nunca exponer al cliente
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
