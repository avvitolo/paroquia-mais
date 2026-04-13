// Camada MCP — acesso ao Supabase para dados do usuário autenticado (server-only)
// REGRA: nenhum arquivo fora de /lib/mcp pode importar de @/lib/supabase/server diretamente
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
export type { AppRole, AppUser } from './user.types'
export { hasRole } from './user.types'
import type { AppUser } from './user.types'

// Busca o usuário autenticado com seus dados completos de public.users
// Usa admin client como fallback para contornar problemas de RLS/JWT
export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('[getCurrentUser] auth.getUser error:', authError.message)
      return null
    }
    if (!user) return null

    // Tenta via client normal (respeita RLS)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!error && data) return data as AppUser

    // Fallback: usa admin client (ignora RLS) — necessário se parish_id não está no JWT ainda
    console.warn('[getCurrentUser] RLS fallback para user:', user.id, error?.message)
    const admin = createAdminClient()
    const { data: adminData, error: adminError } = await admin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (adminError) {
      console.error('[getCurrentUser] admin fallback error:', adminError.message)
      return null
    }

    return adminData as AppUser
  } catch (e) {
    console.error('[getCurrentUser] exception:', e)
    return null
  }
}
