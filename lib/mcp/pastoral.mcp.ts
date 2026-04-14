// Camada MCP — acesso ao Supabase para pastorais (server-only)
// REGRA: nenhum arquivo fora de /lib/mcp pode importar de @/lib/supabase/server diretamente
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type Pastoral = {
  id: string
  parish_id: string
  name: string
  description: string | null
  created_at: string
}

// Lista todas as pastorais da paróquia autenticada
export async function getPastorals(): Promise<Pastoral[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pastorals')
    .select('*')
    .order('name')

  if (error) {
    console.error('[getPastorals] error:', error.message)
    return []
  }
  return data as Pastoral[]
}

// Cria uma nova pastoral para a paróquia do usuário autenticado
export async function createPastoral(
  parishId: string,
  name: string,
  description: string | null
): Promise<Pastoral> {
  // Usa admin client para garantir que a inserção funcione independente do JWT
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('pastorals')
    .insert({ parish_id: parishId, name, description })
    .select()
    .single()

  if (error) throw new Error('Falha ao criar pastoral: ' + error.message)
  return data as Pastoral
}

// Atualiza nome e descrição de uma pastoral (verifica parish_id para segurança)
export async function updatePastoral(
  id: string,
  parishId: string,
  name: string,
  description: string | null
): Promise<Pastoral> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('pastorals')
    .update({ name, description })
    .eq('id', id)
    .eq('parish_id', parishId)
    .select()
    .single()

  if (error) throw new Error('Falha ao atualizar pastoral: ' + error.message)
  return data as Pastoral
}

// Conta pastorais de uma paróquia — usado para enforcement de limites de plano (Story 6.2)
// Retorna 0 em caso de erro (fail-open: não bloquear criação por falha de contagem)
export async function countPastorals(parishId: string): Promise<number> {
  try {
    const admin = createAdminClient()
    const { count, error } = await admin
      .from('pastorals')
      .select('id', { count: 'exact', head: true })
      .eq('parish_id', parishId)

    if (error) {
      console.error('[countPastorals] erro:', error.message)
      return 0
    }

    return count ?? 0
  } catch (e) {
    console.error('[countPastorals] exceção:', e)
    return 0
  }
}

// Exclui uma pastoral (verifica parish_id para segurança)
export async function deletePastoral(id: string, parishId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('pastorals')
    .delete()
    .eq('id', id)
    .eq('parish_id', parishId)

  if (error) throw new Error('Falha ao excluir pastoral: ' + error.message)
}
