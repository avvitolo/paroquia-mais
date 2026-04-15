'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import {
  createCelebrationRequirement,
  deleteCelebrationRequirement,
} from '@/lib/mcp/celebration-requirement.mcp'

async function requireAdminOrCoordinator() {
  const user = await getCurrentUser()
  if (!user || !['admin', 'coordinator'].includes(user.role)) {
    throw new Error('Acesso negado.')
  }
  return user
}

export async function createCelebrationRequirementAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const celebration_id = formData.get('celebration_id') as string
  const pastoral_id = formData.get('pastoral_id') as string
  const pastoral_role_id = formData.get('pastoral_role_id') as string
  const quantity = parseInt(formData.get('quantity') as string, 10) || 1

  if (!celebration_id || !pastoral_id || !pastoral_role_id) {
    throw new Error('Pastoral, função e celebração são obrigatórios.')
  }
  if (quantity < 1 || quantity > 99) throw new Error('Quantidade deve ser entre 1 e 99.')

  await createCelebrationRequirement(user.parish_id, celebration_id, pastoral_id, pastoral_role_id, quantity)
  revalidatePath('/celebrations')
}

export async function deleteCelebrationRequirementAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const id = formData.get('id') as string

  if (!id) throw new Error('ID inválido.')

  await deleteCelebrationRequirement(id, user.parish_id)
  revalidatePath('/celebrations')
}
