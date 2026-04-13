'use server'

// Server Actions para gestão de pastorais — apenas admin pode executar
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import {
  createPastoral,
  updatePastoral,
  deletePastoral,
} from '@/lib/mcp/pastoral.mcp'

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    throw new Error('Acesso negado: apenas administradores podem gerenciar pastorais.')
  }
  return user
}

export async function createPastoralAction(formData: FormData) {
  const user = await requireAdmin()
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null

  if (!name) throw new Error('Nome da pastoral é obrigatório.')

  await createPastoral(user.parish_id, name, description)
  revalidatePath('/pastorals')
}

export async function updatePastoralAction(formData: FormData) {
  const user = await requireAdmin()
  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null

  if (!id) throw new Error('ID da pastoral é obrigatório.')
  if (!name) throw new Error('Nome da pastoral é obrigatório.')

  await updatePastoral(id, user.parish_id, name, description)
  revalidatePath('/pastorals')
}

export async function deletePastoralAction(formData: FormData) {
  const user = await requireAdmin()
  const id = formData.get('id') as string

  if (!id) throw new Error('ID da pastoral é obrigatório.')

  await deletePastoral(id, user.parish_id)
  revalidatePath('/pastorals')
}
