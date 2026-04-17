// Camada MCP — acesso ao Supabase para membros (server-only)
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type Member = {
  id: string
  parish_id: string
  user_id: string | null
  full_name: string
  email: string | null
  phone: string | null
  pastoral_id: string | null // legado; usar member_pastorals para multi-pastoral
  is_active: boolean
  created_at: string
}

export type MemberAvailability = {
  id: string
  member_id: string
  parish_id: string
  start_date: string
  end_date: string
  availability_type: 'single_date' | 'period' | 'weekend' | 'weekday'
  reason: string | null
  created_at: string
}

export type MemberPastoral = {
  id: string
  parish_id: string
  member_id: string
  pastoral_id: string
  created_at: string
}

// Lista membros da paróquia autenticada
export async function getMembers(onlyActive = false): Promise<Member[]> {
  const supabase = await createClient()
  let query = supabase.from('members').select('*').order('full_name')
  if (onlyActive) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) {
    console.error('[getMembers] error:', error.message)
    return []
  }
  return data as Member[]
}

// Busca membro pelo user_id (para associar login ao membro)
export async function getMemberByUserId(userId: string): Promise<Member | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as Member
}

// Cria um novo membro
export async function createMember(
  parishId: string,
  input: { full_name: string; email?: string; phone?: string; pastoral_id?: string }
): Promise<Member> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('members')
    .insert({ parish_id: parishId, is_active: true, ...input })
    .select()
    .single()
  if (error) throw new Error('Falha ao criar membro: ' + error.message)
  return data as Member
}

// Atualiza dados do membro
export async function updateMember(
  id: string,
  parishId: string,
  input: { full_name?: string; email?: string; phone?: string; pastoral_id?: string | null; is_active?: boolean }
): Promise<Member> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('members')
    .update(input)
    .eq('id', id)
    .eq('parish_id', parishId)
    .select()
    .single()
  if (error) throw new Error('Falha ao atualizar membro: ' + error.message)
  return data as Member
}

// Conta membros ativos de uma paróquia — usado para enforcement de limites de plano (Story 6.2)
export async function countActiveMembers(parishId: string): Promise<number> {
  try {
    const admin = createAdminClient()
    const { count, error } = await admin
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('parish_id', parishId)
      .eq('is_active', true)

    if (error) {
      console.error('[countActiveMembers] erro:', error.message)
      return 0
    }

    return count ?? 0
  } catch (e) {
    console.error('[countActiveMembers] exceção:', e)
    return 0
  }
}

// --- Pastorais do Membro (N:N) ---

// Retorna todas as pastorais de um membro
export async function getMemberPastorals(memberId: string): Promise<MemberPastoral[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('member_pastorals')
    .select('*')
    .eq('member_id', memberId)
  if (error) return []
  return data as MemberPastoral[]
}

// Retorna mapa memberId -> pastoral_ids para lista de membros
export async function getMemberPastoralsForParish(
  parishId: string
): Promise<Record<string, string[]>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('member_pastorals')
    .select('member_id, pastoral_id')
    .eq('parish_id', parishId)

  if (error) return {}

  const map: Record<string, string[]> = {}
  for (const row of data ?? []) {
    const r = row as { member_id: string; pastoral_id: string }
    if (!map[r.member_id]) map[r.member_id] = []
    map[r.member_id].push(r.pastoral_id)
  }
  return map
}

// Adiciona membro a uma pastoral
export async function addMemberPastoral(
  parishId: string,
  memberId: string,
  pastoralId: string
): Promise<MemberPastoral> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('member_pastorals')
    .insert({ parish_id: parishId, member_id: memberId, pastoral_id: pastoralId })
    .select()
    .single()
  if (error) throw new Error('Falha ao adicionar pastoral ao membro: ' + error.message)
  return data as MemberPastoral
}

// Remove membro de uma pastoral
export async function removeMemberPastoral(
  memberId: string,
  pastoralId: string,
  parishId: string
): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('member_pastorals')
    .delete()
    .eq('member_id', memberId)
    .eq('pastoral_id', pastoralId)
    .eq('parish_id', parishId)
  if (error) throw new Error('Falha ao remover pastoral do membro: ' + error.message)
}

// --- Indisponibilidades ---

export async function getAvailabilities(memberId: string): Promise<MemberAvailability[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('member_availability')
    .select('*')
    .eq('member_id', memberId)
    .order('start_date')
  if (error) return []
  return data as MemberAvailability[]
}

export async function createAvailability(
  parishId: string,
  memberId: string,
  startDate: string,
  endDate: string,
  availabilityType: 'single_date' | 'period' | 'weekend' | 'weekday',
  reason: string | null
): Promise<MemberAvailability> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('member_availability')
    .insert({
      parish_id: parishId,
      member_id: memberId,
      start_date: startDate,
      end_date: endDate,
      availability_type: availabilityType,
      reason,
    })
    .select()
    .single()
  if (error) throw new Error('Falha ao registrar indisponibilidade: ' + error.message)
  return data as MemberAvailability
}

export async function updateAvailability(
  id: string,
  parishId: string,
  startDate: string,
  endDate: string,
  availabilityType: 'single_date' | 'period' | 'weekend' | 'weekday',
  reason: string | null
): Promise<MemberAvailability> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('member_availability')
    .update({ start_date: startDate, end_date: endDate, availability_type: availabilityType, reason })
    .eq('id', id)
    .eq('parish_id', parishId)
    .select()
    .single()
  if (error) throw new Error('Falha ao atualizar indisponibilidade: ' + error.message)
  return data as MemberAvailability
}

export async function deleteAvailability(id: string, parishId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('member_availability')
    .delete()
    .eq('id', id)
    .eq('parish_id', parishId)
  if (error) throw new Error('Falha ao remover indisponibilidade: ' + error.message)
}

// Exclui membro permanentemente — apenas se não tiver atribuições históricas
export async function deleteMember(id: string, parishId: string): Promise<void> {
  const admin = createAdminClient()

  const { count } = await admin
    .from('schedule_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', id)

  if (count && count > 0) {
    throw new Error(
      `Este membro possui ${count} atribuição(ões) em escalas. Para preservar o histórico, desative o membro em vez de excluir.`
    )
  }

  const { error } = await admin
    .from('members')
    .delete()
    .eq('id', id)
    .eq('parish_id', parishId)
  if (error) throw new Error('Falha ao excluir membro: ' + error.message)
}
