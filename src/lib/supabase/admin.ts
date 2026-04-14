import { createClient } from '@supabase/supabase-js'

// Service-role client — server-side only, never expose to browser
// Lazy-initialized to avoid build-time errors when env vars are not yet set
export function getAdminClient() {
  return createClient(
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
