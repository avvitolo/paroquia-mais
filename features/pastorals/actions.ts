'use server'

// Server Actions para gestão de pastorais — apenas admin pode executar
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import {
  createPastoral,
  updatePastoral,
  deletePastoral,
  countPastorals,
} from '@/lib/mcp/pastoral.mcp'
import { createPastoralRole } from '@/lib/mcp/pastoral-role.mcp'
import { getSubscriptionByParishId } from '@/lib/mcp/parish.mcp'
import { getPlanLimits } from '@/lib/plan-limits'
import { logOperation } from '@/lib/logger'

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || !(['admin_sistema', 'admin_paroquial', 'paroco', 'secretario'] as string[]).includes(user.role)) {
    throw new Error('Acesso negado: apenas administradores podem gerenciar pastorais.')
  }
  return user
}

export async function createPastoralAction(formData: FormData) {
  const user = await requireAdmin()
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const coordinator_id = (formData.get('coordinator_id') as string)?.trim() || null
  // Funções criadas na mesma ação (array de nomes)
  const roleNames = formData.getAll('role_name').map((v) => (v as string).trim()).filter(Boolean)

  if (!name) throw new Error('Nome da pastoral é obrigatório.')

  // Verifica limite de pastorais do plano (Story 6.2) — fail-open se subscription não disponível
  const subscription = await getSubscriptionByParishId(user.parish_id)
  const limits = getPlanLimits(subscription?.plan ?? 'pro')
  if (isFinite(limits.pastorals)) {
    const count = await countPastorals(user.parish_id)
    if (count >= limits.pastorals) {
      throw new Error(
        `Limite do plano atingido: máximo de ${limits.pastorals} pastorais. Faça upgrade para o plano Pro.`
      )
    }
  }

  try {
    const pastoral = await createPastoral(user.parish_id, name, description, coordinator_id)

    // Cria funções definidas na criação da pastoral
    for (const roleName of roleNames) {
      await createPastoralRole(user.parish_id, pastoral.id, roleName)
    }

    revalidatePath('/pastorals')
    logOperation({ operation: 'createPastoral', userId: user.id, parishId: user.parish_id, status: 'success' })

    return { id: pastoral.id }
  } catch (e) {
    logOperation({ operation: 'createPastoral', userId: user.id, parishId: user.parish_id, status: 'failure', error: e })
    throw e
  }
}

export async function updatePastoralAction(formData: FormData) {
  const user = await requireAdmin()
  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const coordinator_id = (formData.get('coordinator_id') as string)?.trim() || null

  if (!id) throw new Error('ID da pastoral é obrigatório.')
  if (!name) throw new Error('Nome da pastoral é obrigatório.')

  await updatePastoral(id, user.parish_id, name, description, coordinator_id)
  revalidatePath('/pastorals')
}

export async function deletePastoralAction(formData: FormData) {
  const user = await requireAdmin()
  const id = formData.get('id') as string

  if (!id) throw new Error('ID da pastoral é obrigatório.')

  await deletePastoral(id, user.parish_id)
  revalidatePath('/pastorals')
}
