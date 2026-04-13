// Página de detalhe da escala — Stories 4.1, 4.2, 4.3
import { notFound } from 'next/navigation'
import { getScheduleWithAssignments } from '@/lib/mcp/schedule.mcp'
import { getMembers } from '@/lib/mcp/member.mcp'
import { ScheduleDetail } from '@/components/schedules/schedule-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ScheduleDetailPage({ params }: Props) {
  const { id } = await params
  const [result, members] = await Promise.all([
    getScheduleWithAssignments(id),
    getMembers(true),
  ])

  if (!result) notFound()

  return (
    <div className="max-w-5xl mx-auto">
      <ScheduleDetail
        schedule={result.schedule}
        assignments={result.assignments}
        members={members}
      />
    </div>
  )
}
