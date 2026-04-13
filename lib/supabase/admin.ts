// Cliente Supabase com service role — operações administrativas server-side
// NUNCA expor este cliente no browser ou em client components
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error(
      '[createAdminClient] SUPABASE_SERVICE_ROLE_KEY não está configurada. ' +
      'Adicione esta variável nos Environment Variables da Vercel.'
    )
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        // Ignora cookies de sessão do usuário — usa service role diretamente
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
