'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import {
  createCelebration,
  updateCelebration,
  deleteCelebration,
} from '@/lib/mcp/celebration.mcp'

async function requireAdminOrCoordinator() {
  const user = await getCurrentUser()
  if (!user || !(['admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'] as string[]).includes(user.role)) {
    throw new Error('Acesso negado.')
  }
  return user
}

export async function createCelebrationAction(formData: FormData): Promise<{ id: string }> {
  const user = await requireAdminOrCoordinator()
  const title = (formData.get('title') as string)?.trim()
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const type = formData.get('type') as string
  const notes = (formData.get('notes') as string)?.trim() || undefined

  if (!title || !date || !time || !type) throw new Error('Preencha todos os campos obrigatórios.')

  // Requisitos pré-cadastrados na criação: serializado como JSON no campo requirements_json
  const requirementsJson = formData.get('requirements_json') as string
  let pendingRequirements: Array<{ pastoral_id: string; pastoral_role_id: string | null; quantity: number }> = []
  if (requirementsJson) {
    try {
      pendingRequirements = JSON.parse(requirementsJson)
    } catch { /* ignora JSON inválido */ }
  }

  const celebration = await createCelebration(user.parish_id, { title, date, time, type, notes })

  // Cria requisitos que foram adicionados durante a criação da celebração
  if (pendingRequirements.length > 0) {
    const { createCelebrationRequirement } = await import('@/lib/mcp/celebration-requirement.mcp')
    for (const req of pendingRequirements) {
      await createCelebrationRequirement(
        user.parish_id,
        celebration.id,
        req.pastoral_id,
        req.pastoral_role_id,
        req.quantity
      )
    }
  }

  revalidatePath('/celebrations')
  return { id: celebration.id }
}

export async function updateCelebrationAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const id = formData.get('id') as string
  const title = (formData.get('title') as string)?.trim()
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const type = formData.get('type') as string
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!id || !title || !date || !time || !type) throw new Error('Dados inválidos.')

  await updateCelebration(id, user.parish_id, { title, date, time, type, notes })
  revalidatePath('/celebrations')
}

export async function deleteCelebrationAction(formData: FormData) {
  const user = await requireAdminOrCoordinator()
  const id = formData.get('id') as string

  if (!id) throw new Error('ID inválido.')

  await deleteCelebration(id, user.parish_id)
  revalidatePath('/celebrations')
}
