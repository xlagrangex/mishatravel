import { createClient } from '@supabase/supabase-js'

// Server-only client with service_role key - bypasses RLS
// NEVER import this from client components
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
