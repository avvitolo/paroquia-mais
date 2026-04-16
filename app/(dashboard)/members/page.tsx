// Página de gestão de membros — Stories 2.3, 2.5 + multi-pastoral + coordenação
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import { hasRole } from '@/lib/mcp/user.types'
import { getMembers, getAvailabilities, getMemberPastoralsForParish } from '@/lib/mcp/member.mcp'
import { getPastorals } from '@/lib/mcp/pastoral.mcp'
import { MemberCrud } from '@/components/members/member-crud'

export default async function MembersPage() {
  const user = await getCurrentUser()
  if (!user || !hasRole(user, 'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador')) {
    redirect('/dashboard')
  }

  const [members, pastorals, memberPastorals] = await Promise.all([
    getMembers(),
    getPastorals(),
    getMemberPastoralsForParish(user.parish_id),
  ])

  // Pré-carrega indisponibilidades de todos os membros em paralelo
  const availEntries = await Promise.all(
    members.map(async (m) => [m.id, await getAvailabilities(m.id)] as const)
  )
  const availabilities = Object.fromEntries(availEntries)

  return (
    <div className="max-w-5xl mx-auto">
      <MemberCrud
        initialMembers={members}
        pastorals={pastorals}
        availabilities={availabilities}
        memberPastorals={memberPastorals}
      />
    </div>
  )
}
