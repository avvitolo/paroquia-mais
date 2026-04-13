// Página de gestão de membros — Stories 2.3 e 2.5
import { getMembers, getAvailabilities } from '@/lib/mcp/member.mcp'
import { getPastorals } from '@/lib/mcp/pastoral.mcp'
import { MemberCrud } from '@/components/members/member-crud'

export default async function MembersPage() {
  const [members, pastorals] = await Promise.all([
    getMembers(),
    getPastorals(),
  ])

  // Pré-carrega indisponibilidades de todos os membros em paralelo
  const availEntries = await Promise.all(
    members.map(async (m) => [m.id, await getAvailabilities(m.id)] as const)
  )
  const availabilities = Object.fromEntries(availEntries)

  return (
    <div className="max-w-5xl mx-auto">
      <MemberCrud initialMembers={members} pastorals={pastorals} availabilities={availabilities} />
    </div>
  )
}
