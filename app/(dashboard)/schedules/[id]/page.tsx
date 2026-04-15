// Página de detalhe da escala — Stories 4.1, 4.2, 4.3 + S5 (validação por pastoral/função)
import { notFound } from 'next/navigation'
import { getScheduleWithAssignments } from '@/lib/mcp/schedule.mcp'
import { getMembers } from '@/lib/mcp/member.mcp'
import { getCelebrationRequirements } from '@/lib/mcp/celebration-requirement.mcp'
import { getAllPastoralRoles } from '@/lib/mcp/pastoral-role.mcp'
import { ScheduleDetail } from '@/components/schedules/schedule-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ScheduleDetailPage({ params }: Props) {
  const { id } = await params
  const [result, members, allRoles] = await Promise.all([
    getScheduleWithAssignments(id),
    getMembers(true),
    getAllPastoralRoles(),
  ])

  if (!result) notFound()

  const requirements = await getCelebrationRequirements(result.schedule.celebration_id)

  return (
    <div className="max-w-5xl mx-auto">
      <ScheduleDetail
        schedule={result.schedule}
        assignments={result.assignments}
        members={members}
        requirements={requirements}
        allRoles={allRoles}
      />
    </div>
  )
}
