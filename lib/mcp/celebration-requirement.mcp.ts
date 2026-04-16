// Camada MCP — requisitos de função/pastoral por celebração
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type CelebrationRequirement = {
  id: string
  parish_id: string
  celebration_id: string
  pastoral_id: string
  pastoral_role_id: string | null // nullable: pastoral pode ser adicionada sem função específica
  quantity: number
  created_at: string
}

// Inclui dados de pastoral e função para exibição
export type CelebrationRequirementWithDetails = CelebrationRequirement & {
  pastorals: { name: string }
  pastoral_roles: { name: string } | null
}

// Lista requisitos de uma celebração com detalhes de pastoral e função
export async function getCelebrationRequirements(
  celebrationId: string
): Promise<CelebrationRequirementWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('celebration_requirements')
    .select('*, pastorals(name), pastoral_roles(name)')
    .eq('celebration_id', celebrationId)
    .order('created_at')

  if (error) {
    console.error('[getCelebrationRequirements] error:', error.message)
    return []
  }
  return data as CelebrationRequirementWithDetails[]
}

export async function createCelebrationRequirement(
  parishId: string,
  celebrationId: string,
  pastoralId: string,
  pastoralRoleId: string | null,
  quantity: number
): Promise<CelebrationRequirement> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('celebration_requirements')
    .insert({
      parish_id: parishId,
      celebration_id: celebrationId,
      pastoral_id: pastoralId,
      pastoral_role_id: pastoralRoleId || null,
      quantity,
    })
    .select()
    .single()
  if (error) throw new Error('Falha ao criar requisito: ' + error.message)
  return data as CelebrationRequirement
}

export async function deleteCelebrationRequirement(id: string, parishId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('celebration_requirements')
    .delete()
    .eq('id', id)
    .eq('parish_id', parishId)
  if (error) throw new Error('Falha ao remover requisito: ' + error.message)
}
