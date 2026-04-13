// Camada MCP — acesso ao Supabase para dados de membros
// REGRA: nenhum arquivo fora de /lib/mcp pode importar de @/lib/supabase/server diretamente
import { createClient } from '@/lib/supabase/server'

export type Member = {
  id: string
  parish_id: string
  full_name: string
  email: string
  pastoral_id: string | null
  is_active: boolean
  created_at: string
}

// Busca membros ativos da paróquia
export async function getMembersByParish(parishId: string): Promise<Member[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('parish_id', parishId)
    .eq('is_active', true)
    .order('full_name')
  if (error) throw error
  return data ?? []
}

// Cria um novo membro
export async function createMember(
  parishId: string,
  fullName: string,
  email: string,
  pastoralId?: string
): Promise<Member> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .insert({
      parish_id: parishId,
      full_name: fullName,
      email,
      pastoral_id: pastoralId ?? null,
      is_active: true,
    })
    .select()
    .single()
  if (error) throw error
  return data
}
