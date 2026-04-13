'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import {
  createSchedule,
  addAssignment,
  removeAssignment,
  publishSchedule,
  updateAssignmentStatus,
  validateAssignment,
} from '@/lib/mcp/schedule.mcp'

async function requireAdminOrCoordinator() {
  const user = await getCurrentUser()
  if (!user || !['admin', 'coordinator'].includes(user.role)) {
    throw new Error('Acesso negado.')
  }
  return user
}

export async function createScheduleAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const celebration_id = formData.get('celebration_id') as string
  const notes = (formData.get('notes') as string)?.trim() || undefined

  if (!celebration_id) throw new Error('Celebração é obrigatória.')

  await createSchedule(user.parish_id, celebration_id, notes)
  revalidatePath('/schedules')
}

export async function addAssignmentAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const schedule_id = formData.get('schedule_id') as string
  const member_id = formData.get('member_id') as string
  const role = (formData.get('role') as string)?.trim()

  if (!schedule_id || !member_id || !role) throw new Error('Dados inválidos.')

  // Validação de conflito antes de salvar (Story 4.2)
  const { conflict, reason } = await validateAssignment(member_id, schedule_id, user.parish_id)
  if (conflict) throw new Error(reason ?? 'Conflito detectado para este membro.')

  await addAssignment(schedule_id, user.parish_id, member_id, role)
  revalidatePath(`/schedules/${schedule_id}`)
}

export async function removeAssignmentAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const id = formData.get('id') as string
  const schedule_id = formData.get('schedule_id') as string

  if (!id) throw new Error('ID inválido.')

  await removeAssignment(id, user.parish_id)
  revalidatePath(`/schedules/${schedule_id}`)
}

export async function publishScheduleAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const id = formData.get('id') as string

  if (!id) throw new Error('ID inválido.')

  await publishSchedule(id, user.parish_id)
  revalidatePath(`/schedules/${id}`)
  revalidatePath('/schedules')
}

// Story 5.1 — membro confirma ou recusa sua atribuição
export async function confirmAssignmentAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autenticado.')

  const id = formData.get('id') as string
  const status = formData.get('status') as 'confirmed' | 'declined'

  if (!id || !['confirmed', 'declined'].includes(status)) throw new Error('Dados inválidos.')

  await updateAssignmentStatus(id, user.parish_id, status)
  revalidatePath('/dashboard')
}
