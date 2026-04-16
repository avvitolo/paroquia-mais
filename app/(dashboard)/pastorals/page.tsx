// Página de gestão de pastorais — Story 2.2 + S3 (funções por pastoral)
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import { hasRole } from '@/lib/mcp/user.types'
import { getPastorals } from '@/lib/mcp/pastoral.mcp'
import { getPastoralRoles } from '@/lib/mcp/pastoral-role.mcp'
import { PastoralCrud } from '@/components/pastorals/pastoral-crud'

export default async function PastoralsPage() {
  const user = await getCurrentUser()
  if (!user || !hasRole(user, 'admin_sistema', 'admin_paroquial', 'paroco', 'secretario')) {
    redirect('/dashboard')
  }

  const pastorals = await getPastorals()

  // Carrega funções de todas as pastorais em paralelo
  const roleEntries = await Promise.all(
    pastorals.map(async (p) => [p.id, await getPastoralRoles(p.id)] as const)
  )
  const initialRoles = Object.fromEntries(roleEntries)

  return (
    <div className="max-w-5xl mx-auto">
      <PastoralCrud initialPastorals={pastorals} initialRoles={initialRoles} />
    </div>
  )
}
