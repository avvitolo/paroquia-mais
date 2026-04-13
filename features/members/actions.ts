'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import {
  createMember,
  updateMember,
  createAvailability,
  deleteAvailability,
} from '@/lib/mcp/member.mcp'

async function requireAdminOrCoordinator() {
  const user = await getCurrentUser()
  if (!user || !['admin', 'coordinator'].includes(user.role)) {
    throw new Error('Acesso negado.')
  }
  return user
}

export async function createMemberAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const full_name = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim() || undefined
  const phone = (formData.get('phone') as string)?.trim() || undefined
  const pastoral_id = (formData.get('pastoral_id') as string) || undefined

  if (!full_name) throw new Error('Nome é obrigatório.')

  await createMember(user.parish_id, { full_name, email, phone, pastoral_id })
  revalidatePath('/members')
}

export async function updateMemberAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const id = formData.get('id') as string
  const full_name = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim() || undefined
  const phone = (formData.get('phone') as string)?.trim() || undefined
  const pastoral_id = (formData.get('pastoral_id') as string) || null

  if (!id || !full_name) throw new Error('Dados inválidos.')

  await updateMember(id, user.parish_id, { full_name, email, phone, pastoral_id })
  revalidatePath('/members')
}

export async function toggleMemberStatusAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const id = formData.get('id') as string
  const isActive = formData.get('is_active') === 'true'

  if (!id) throw new Error('ID inválido.')

  await updateMember(id, user.parish_id, { is_active: !isActive })
  revalidatePath('/members')
}

export async function createAvailabilityAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const member_id = formData.get('member_id') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const reason = (formData.get('reason') as string)?.trim() || null

  if (!member_id || !start_date || !end_date) throw new Error('Dados inválidos.')
  if (end_date < start_date) throw new Error('Data final deve ser igual ou posterior à inicial.')

  await createAvailability(user.parish_id, member_id, start_date, end_date, reason)
  revalidatePath('/members')
}

export async function deleteAvailabilityAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const id = formData.get('id') as string

  if (!id) throw new Error('ID inválido.')

  await deleteAvailability(id, user.parish_id)
  revalidatePath('/members')
}
