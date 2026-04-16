// Camada MCP — acesso ao Supabase para pastorais (server-only)
// REGRA: nenhum arquivo fora de /lib/mcp pode importar de @/lib/supabase/server diretamente
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type Pastoral = {
  id: string
  parish_id: string
  name: string
  description: string | null
  coordinator_id: string | null
  coordinator_name: string | null // join do membro coordenador
  created_at: string
}

// Lista todas as pastorais da paróquia autenticada, incluindo nome do coordenador
export async function getPastorals(): Promise<Pastoral[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pastorals')
    .select('*, coordinator:members!coordinator_id(full_name)')
    .order('name')

  if (error) {
    console.error('[getPastorals] error:', error.message)
    return []
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    parish_id: row.parish_id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    coordinator_id: (row.coordinator_id as string) ?? null,
    coordinator_name: row.coordinator
      ? ((row.coordinator as { full_name: string }).full_name ?? null)
      : null,
    created_at: row.created_at as string,
  }))
}

// Cria uma nova pastoral para a paróquia do usuário autenticado
export async function createPastoral(
  parishId: string,
  name: string,
  description: string | null,
  coordinatorId: string | null
): Promise<Pastoral> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('pastorals')
    .insert({ parish_id: parishId, name, description, coordinator_id: coordinatorId })
    .select('*, coordinator:members!coordinator_id(full_name)')
    .single()

  if (error) throw new Error('Falha ao criar pastoral: ' + error.message)

  const row = data as Record<string, unknown>
  return {
    id: row.id as string,
    parish_id: row.parish_id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    coordinator_id: (row.coordinator_id as string) ?? null,
    coordinator_name: row.coordinator
      ? ((row.coordinator as { full_name: string }).full_name ?? null)
      : null,
    created_at: row.created_at as string,
  }
}

// Atualiza nome, descrição e coordenador de uma pastoral
export async function updatePastoral(
  id: string,
  parishId: string,
  name: string,
  description: string | null,
  coordinatorId: string | null
): Promise<Pastoral> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('pastorals')
    .update({ name, description, coordinator_id: coordinatorId })
    .eq('id', id)
    .eq('parish_id', parishId)
    .select('*, coordinator:members!coordinator_id(full_name)')
    .single()

  if (error) throw new Error('Falha ao atualizar pastoral: ' + error.message)

  const row = data as Record<string, unknown>
  return {
    id: row.id as string,
    parish_id: row.parish_id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    coordinator_id: (row.coordinator_id as string) ?? null,
    coordinator_name: row.coordinator
      ? ((row.coordinator as { full_name: string }).full_name ?? null)
      : null,
    created_at: row.created_at as string,
  }
}

// Atualiza apenas o coordenador de uma pastoral (usado ao salvar membro como coordenador)
export async function updatePastoralCoordinator(
  pastoralId: string,
  parishId: string,
  coordinatorId: string | null
): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('pastorals')
    .update({ coordinator_id: coordinatorId })
    .eq('id', pastoralId)
    .eq('parish_id', parishId)

  if (error) throw new Error('Falha ao atualizar coordenador da pastoral: ' + error.message)
}

// Conta pastorais de uma paróquia — usado para enforcement de limites de plano (Story 6.2)
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
