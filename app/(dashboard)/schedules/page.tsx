// Página de escalas — Stories 4.1, 4.2, 4.3
import { getSchedules } from '@/lib/mcp/schedule.mcp'
import { getCelebrations } from '@/lib/mcp/celebration.mcp'
import { ScheduleList } from '@/components/schedules/schedule-list'

export default async function SchedulesPage() {
  const [schedules, celebrations] = await Promise.all([
    getSchedules(),
    getCelebrations(true),
  ])

  return (
    <div className="max-w-5xl mx-auto">
      <ScheduleList schedules={schedules} celebrations={celebrations} />
    </div>
  )
}
