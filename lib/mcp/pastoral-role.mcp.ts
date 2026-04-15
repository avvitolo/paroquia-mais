// Camada MCP — funções por pastoral (pastoral_roles)
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type PastoralRole = {
  id: string
  parish_id: string
  pastoral_id: string
  name: string
  created_at: string
}

// Lista funções de uma pastoral específica
export async function getPastoralRoles(pastoralId: string): Promise<PastoralRole[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pastoral_roles')
    .select('*')
    .eq('pastoral_id', pastoralId)
    .order('name')

  if (error) {
    console.error('[getPastoralRoles] error:', error.message)
    return []
  }
  return data as PastoralRole[]
}

// Lista todas as funções da paróquia, agrupadas por pastoral
export async function getAllPastoralRoles(): Promise<PastoralRole[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pastoral_roles')
    .select('*')
    .order('name')

  if (error) {
    console.error('[getAllPastoralRoles] error:', error.message)
    return []
  }
  return data as PastoralRole[]
}

export async function createPastoralRole(
  parishId: string,
  pastoralId: string,
  name: string
): Promise<PastoralRole> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('pastoral_roles')
    .insert({ parish_id: parishId, pastoral_id: pastoralId, name })
    .select()
    .single()
  if (error) throw new Error('Falha ao criar função: ' + error.message)
  return data as PastoralRole
}

export async function deletePastoralRole(id: string, parishId: string): Promise<void> {
  const admin = createAdminClient()

  // Verifica se a função está em uso em algum requisito de celebração
  const { count: reqCount } = await admin
    .from('celebration_requirements')
    .select('id', { count: 'exact', head: true })
    .eq('pastoral_role_id', id)

  if (reqCount && reqCount > 0) {
    throw new Error(
      `Esta função está associada a ${reqCount} requisito(s) de celebração. Remova os requisitos antes de excluir.`
    )
  }

  // Verifica se a função está em uso em alguma atribuição de escala
  const { count: assignCount } = await admin
    .from('schedule_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('pastoral_role_id', id)

  if (assignCount && assignCount > 0) {
    throw new Error(
      `Esta função está atribuída a ${assignCount} membro(s) em escalas. Remova as atribuições antes de excluir.`
    )
  }

  const { error } = await admin
    .from('pastoral_roles')
    .delete()
    .eq('id', id)
    .eq('parish_id', parishId)
  if (error) throw new Error('Falha ao excluir função: ' + error.message)
}
