// Cliente Supabase com service role — operações administrativas server-side
// NUNCA expor este cliente no browser ou em client components
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        // Ignora cookies de sessão do usuário — usa service role diretamente
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
