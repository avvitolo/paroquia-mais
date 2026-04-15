// Camada MCP — acesso ao Supabase para escalas e atribuições (server-only)
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type Schedule = {
  id: string
  parish_id: string
  celebration_id: string
  status: 'draft' | 'published'
  notes: string | null
  created_at: string
}

export type ScheduleWithCelebration = Schedule & {
  celebrations: {
    title: string
    date: string
    time: string
    type: string
  }
}

export type ScheduleAssignment = {
  id: string
  schedule_id: string
  parish_id: string
  member_id: string
  role: string
  pastoral_role_id: string | null
  status: 'pending' | 'confirmed' | 'declined'
  created_at: string
}

export type AssignmentWithMember = ScheduleAssignment & {
  members: { full_name: string; email: string | null }
}

// Lista escalas com dados da celebração
export async function getSchedules(): Promise<ScheduleWithCelebration[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schedules')
    .select('*, celebrations(title, date, time, type)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getSchedules] error:', error.message)
    return []
  }
  return data as ScheduleWithCelebration[]
}

// Busca uma escala completa com atribuições
export async function getScheduleWithAssignments(id: string): Promise<{
  schedule: ScheduleWithCelebration
  assignments: AssignmentWithMember[]
} | null> {
  const supabase = await createClient()
  const { data: schedule, error: sErr } = await supabase
    .from('schedules')
    .select('*, celebrations(title, date, time, type)')
    .eq('id', id)
    .single()

  if (sErr || !schedule) return null

  const { data: assignments, error: aErr } = await supabase
    .from('schedule_assignments')
    .select('*, members(full_name, email)')
    .eq('schedule_id', id)
    .order('role')

  if (aErr) return null

  return {
    schedule: schedule as ScheduleWithCelebration,
    assignments: (assignments ?? []) as AssignmentWithMember[],
  }
}

// Escalas publicadas onde o membro autenticado tem atribuição (dashboard do membro)
// Filtra status=published diretamente no banco para evitar fetch desnecessário
export async function getMyAssignments(memberId: string): Promise<(AssignmentWithMember & {
  schedules: { status: string; celebrations: { title: string; date: string; time: string } }
})[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schedule_assignments')
    .select('*, members(full_name, email), schedules!inner(status, celebrations(title, date, time))')
    .eq('member_id', memberId)
    .eq('schedules.status', 'published')
    .order('created_at', { ascending: false })

  if (error) return []
  return data as never
}

export async function createSchedule(
  parishId: string,
  celebrationId: string,
  notes?: string
): Promise<Schedule> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('schedules')
    .insert({ parish_id: parishId, celebration_id: celebrationId, status: 'draft', notes: notes ?? null })
    .select()
    .single()
  if (error) throw new Error('Falha ao criar escala: ' + error.message)
  return data as Schedule
}

// Valida conflitos antes de adicionar atribuição (Story 4.2)
// Conflito = membro já escalado em outra escala da mesma data, ou com indisponibilidade registrada
export async function validateAssignment(
  memberId: string,
  scheduleId: string,
  parishId: string
): Promise<{ conflict: boolean; reason?: string }> {
  const admin = createAdminClient()

  // Busca a data da celebração desta escala
  const { data: schedule } = await admin
    .from('schedules')
    .select('celebration_id, celebrations(date)')
    .eq('id', scheduleId)
    .single()

  if (!schedule) return { conflict: false }
  const celebDate = (schedule as unknown as { celebrations: { date: string } }).celebrations?.date

  if (!celebDate) return { conflict: false }

  // Verifica se o membro já está em outra escala na mesma data
  const { data: conflictAssignment } = await admin
    .from('schedule_assignments')
    .select('id, schedules(id, celebrations(title, date))')
    .eq('member_id', memberId)
    .eq('parish_id', parishId)
    .neq('schedule_id', scheduleId)

  if (conflictAssignment) {
    const conflict = (conflictAssignment as unknown as { schedules: { celebrations: { date: string; title: string } } }[])
      .find((a) => a.schedules?.celebrations?.date === celebDate)

    if (conflict) {
      return {
        conflict: true,
        reason: `Membro já está escalado em outra escala em ${celebDate}.`,
      }
    }
  }

  // Verifica indisponibilidade registrada
  const { data: unavail } = await admin
    .from('member_availability')
    .select('id, start_date, end_date, reason')
    .eq('member_id', memberId)
    .lte('start_date', celebDate)
    .gte('end_date', celebDate)
    .limit(1)

  if (unavail && unavail.length > 0) {
    const u = unavail[0] as { start_date: string; end_date: string; reason: string | null }
    return {
      conflict: true,
      reason: `Membro registrou indisponibilidade de ${u.start_date} a ${u.end_date}${u.reason ? ` (${u.reason})` : ''}.`,
    }
  }

  return { conflict: false }
}

export async function addAssignment(
  scheduleId: string,
  parishId: string,
  memberId: string,
  role: string,
  pastoralRoleId?: string | null
): Promise<ScheduleAssignment> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('schedule_assignments')
    .insert({
      schedule_id: scheduleId,
      parish_id: parishId,
      member_id: memberId,
      role,
      pastoral_role_id: pastoralRoleId || null,
      status: 'pending',
    })
    .select()
    .single()
  if (error) throw new Error('Falha ao adicionar atribuição: ' + error.message)
  return data as ScheduleAssignment
}

export async function removeAssignment(id: string, parishId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('schedule_assignments')
    .delete()
    .eq('id', id)
    .eq('parish_id', parishId)
  if (error) throw new Error('Falha ao remover atribuição: ' + error.message)
}

// Publica escala — verifica que há ao menos uma atribuição e sem conflitos (Story 4.3)
export async function publishSchedule(id: string, parishId: string): Promise<void> {
  const admin = createAdminClient()

  const { count } = await admin
    .from('schedule_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('schedule_id', id)

  if (!count || count === 0) {
    throw new Error('A escala precisa ter ao menos uma atribuição antes de ser publicada.')
  }

  const { error } = await admin
    .from('schedules')
    .update({ status: 'published' })
    .eq('id', id)
    .eq('parish_id', parishId)
  if (error) throw new Error('Falha ao publicar escala: ' + error.message)
}

// Membro confirma ou recusa sua atribuição (Story 5.1)
export async function updateAssignmentStatus(
  id: string,
  parishId: string,
  status: 'confirmed' | 'declined'
): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('schedule_assignments')
    .update({ status })
    .eq('id', id)
    .eq('parish_id', parishId)
  if (error) throw new Error('Falha ao atualizar confirmação: ' + error.message)
}
