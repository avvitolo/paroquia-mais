'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import { createPastoralRole, deletePastoralRole } from '@/lib/mcp/pastoral-role.mcp'

async function requireAdminOrCoordinator() {
  const user = await getCurrentUser()
  if (!user || !['admin', 'coordinator'].includes(user.role)) {
    throw new Error('Acesso negado.')
  }
  return user
}

export async function createPastoralRoleAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const pastoral_id = formData.get('pastoral_id') as string
  const name = (formData.get('name') as string)?.trim()

  if (!pastoral_id || !name) throw new Error('Pastoral e nome são obrigatórios.')

  await createPastoralRole(user.parish_id, pastoral_id, name)
  revalidatePath('/pastorals')
}

export async function deletePastoralRoleAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const id = formData.get('id') as string

  if (!id) throw new Error('ID inválido.')

  await deletePastoralRole(id, user.parish_id)
  revalidatePath('/pastorals')
}
