'use server'

// Guard para Server Actions — verifica se o usuário possui o papel necessário
// Uso: const user = await requireRole('admin') — lança redirect se não autorizado
import { redirect } from 'next/navigation'
import { getCurrentUser, type AppRole, type AppUser } from '@/lib/mcp/user.mcp'

export async function requireRole(...roles: AppRole[]): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user || !roles.includes(user.role)) {
    redirect('/dashboard')
  }
  return user
}
