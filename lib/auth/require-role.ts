'use server'

// Guard para Server Actions — verifica se o usuário possui o papel necessário
// Uso: const user = await requireRole('admin') — lança redirect se não autorizado
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import type { AppRole, AppUser } from '@/lib/mcp/user.types'

export async function requireRole(...roles: AppRole[]): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user || !roles.includes(user.role)) {
    redirect('/dashboard')
  }
  return user
}
