import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = !!(url && key)

// Fall back to placeholder strings so createClient doesn't throw on import.
// All API calls will fail gracefully when not configured.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-key'
)
