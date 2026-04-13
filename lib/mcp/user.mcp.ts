// Camada MCP — acesso ao Supabase para dados do usuário autenticado (server-only)
// REGRA: nenhum arquivo fora de /lib/mcp pode importar de @/lib/supabase/server diretamente
import { createClient } from '@/lib/supabase/server'
export type { AppRole, AppUser } from './user.types'
export { hasRole } from './user.types'
import type { AppUser } from './user.types'

// Busca o usuário autenticado com seus dados completos de public.users
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data as AppUser
}

