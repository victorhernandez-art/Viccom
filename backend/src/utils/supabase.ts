import { createClient } from '@supabase/supabase-js'

const url    = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!url || !secret) {
  throw new Error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
}

export const supabaseAdmin = createClient(url, secret, {
  auth: {
    autoRefreshToken: false,
    persistSession:   false,
  },
})
