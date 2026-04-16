'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import {
  createMember,
  updateMember,
  countActiveMembers,
  createAvailability,
  deleteAvailability,
  deleteMember,
  addMemberPastoral,
  removeMemberPastoral,
} from '@/lib/mcp/member.mcp'
import { updatePastoralCoordinator } from '@/lib/mcp/pastoral.mcp'
import { getSubscriptionByParishId } from '@/lib/mcp/parish.mcp'
import { getPlanLimits } from '@/lib/plan-limits'
import { logOperation } from '@/lib/logger'

async function requireAdminOrCoordinator() {
  const user = await getCurrentUser()
  if (!user || !(['admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'] as string[]).includes(user.role)) {
    throw new Error('Acesso negado.')
  }
  return user
}

export async function createMemberAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const full_name = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim() || undefined
  const phone = (formData.get('phone') as string)?.trim() || undefined
  // Multi-pastoral: lista de IDs
  const pastoralIds = formData.getAll('pastoral_ids').map((v) => v as string).filter(Boolean)

  if (!full_name) throw new Error('Nome é obrigatório.')

  // Verifica limite de membros do plano (Story 6.2)
  const subscription = await getSubscriptionByParishId(user.parish_id)
  const limits = getPlanLimits(subscription?.plan ?? 'pro')
  if (isFinite(limits.members)) {
    const count = await countActiveMembers(user.parish_id)
    if (count >= limits.members) {
      throw new Error(
        `Limite do plano atingido: máximo de ${limits.members} membros. Faça upgrade para o plano Pro.`
      )
    }
  }

  try {
    // pastoral_id legado: primeira pastoral da lista (para compatibilidade)
    const member = await createMember(user.parish_id, {
      full_name,
      email,
      phone,
      pastoral_id: pastoralIds[0] ?? undefined,
    })

    // Cria registros na tabela junction para cada pastoral selecionada
    for (const pastoralId of pastoralIds) {
      await addMemberPastoral(user.parish_id, member.id, pastoralId)
    }

    // Coordenador: atualiza pastoral se indicado
    const coordinatorPastoralId = (formData.get('coordinator_pastoral_id') as string)?.trim() || null
    if (coordinatorPastoralId) {
      await updatePastoralCoordinator(coordinatorPastoralId, user.parish_id, member.id)
    }

    revalidatePath('/members')
    logOperation({ operation: 'createMember', userId: user.id, parishId: user.parish_id, status: 'success' })
    return { id: member.id }
  } catch (e) {
    logOperation({ operation: 'createMember', userId: user.id, parishId: user.parish_id, status: 'failure', error: e })
    throw e
  }
}

export async function updateMemberAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const id = formData.get('id') as string
  const full_name = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim() || undefined
  const phone = (formData.get('phone') as string)?.trim() || undefined

  if (!id || !full_name) throw new Error('Dados inválidos.')

  await updateMember(id, user.parish_id, { full_name, email, phone })
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

export async function addMemberPastoralAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const member_id = formData.get('member_id') as string
  const pastoral_id = formData.get('pastoral_id') as string

  if (!member_id || !pastoral_id) throw new Error('Dados inválidos.')

  await addMemberPastoral(user.parish_id, member_id, pastoral_id)
  revalidatePath('/members')
}

export async function removeMemberPastoralAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const member_id = formData.get('member_id') as string
  const pastoral_id = formData.get('pastoral_id') as string

  if (!member_id || !pastoral_id) throw new Error('Dados inválidos.')

  await removeMemberPastoral(member_id, pastoral_id, user.parish_id)
  revalidatePath('/members')
}

export async function setMemberCoordinatorAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const pastoral_id = formData.get('pastoral_id') as string
  const member_id = (formData.get('member_id') as string) || null

  if (!pastoral_id) throw new Error('Pastoral inválida.')

  await updatePastoralCoordinator(pastoral_id, user.parish_id, member_id)
  revalidatePath('/members')
  revalidatePath('/pastorals')
}

export async function createAvailabilityAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const member_id = formData.get('member_id') as string
  const availability_type = (formData.get('availability_type') as string) || 'single_date'
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const reason = (formData.get('reason') as string)?.trim() || null

  if (!member_id || !start_date || !end_date) throw new Error('Dados inválidos.')
  if (end_date < start_date) throw new Error('Data final deve ser igual ou posterior à inicial.')

  const validTypes = ['single_date', 'period', 'weekend', 'weekday']
  const safeType = validTypes.includes(availability_type)
    ? (availability_type as 'single_date' | 'period' | 'weekend' | 'weekday')
    : 'single_date'

  await createAvailability(user.parish_id, member_id, start_date, end_date, safeType, reason)
  revalidatePath('/members')
}

export async function deleteAvailabilityAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const id = formData.get('id') as string

  if (!id) throw new Error('ID inválido.')

  await deleteAvailability(id, user.parish_id)
  revalidatePath('/members')
}

export async function deleteMemberAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const id = formData.get('id') as string

  if (!id) throw new Error('ID inválido.')

  await deleteMember(id, user.parish_id)
  revalidatePath('/members')
}
