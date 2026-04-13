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
  pastoral_id: string | null
  is_active: boolean
  created_at: string
}

export type MemberAvailability = {
  id: string
  member_id: string
  parish_id: string
  start_date: string
  end_date: string
  reason: string | null
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
  reason: string | null
): Promise<MemberAvailability> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('member_availability')
    .insert({ parish_id: parishId, member_id: memberId, start_date: startDate, end_date: endDate, reason })
    .select()
    .single()
  if (error) throw new Error('Falha ao registrar indisponibilidade: ' + error.message)
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
