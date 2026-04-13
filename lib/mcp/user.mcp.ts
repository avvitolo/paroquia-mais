// Camada MCP — acesso ao Supabase para dados do usuário autenticado
// REGRA: nenhum arquivo fora de /lib/mcp pode importar de @/lib/supabase/server diretamente
import { createClient } from '@/lib/supabase/server'

export type AppRole = 'admin' | 'coordinator' | 'member'

export type AppUser = {
  id: string
  parish_id: string
  full_name: string
  email: string
  role: AppRole
  created_at: string
}

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

// Verifica se o usuário possui um dos papéis especificados
export function hasRole(user: AppUser, ...roles: AppRole[]): boolean {
  return roles.includes(user.role)
}
