'use client'

// Calendário mensal de escalas — S6
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ScheduleWithCelebration } from '@/lib/mcp/schedule.mcp'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface ScheduleCalendarProps {
  schedules: ScheduleWithCelebration[]
}

export function ScheduleCalendar({ schedules }: ScheduleCalendarProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  // Dias do mês
  const firstDayOfMonth = new Date(year, month, 1).getDay() // 0=dom
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Células do grid (inclui dias vazios do início)
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // Índice de escalas por dia (YYYY-MM-DD)
  const byDay: Record<string, ScheduleWithCelebration[]> = {}
  for (const s of schedules) {
    const d = s.celebrations.date
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(s)
  }

  function formatDay(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const todayStr = today.toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={prevMonth}>‹</Button>
        <h2 className="font-semibold text-[#002045]">{MONTH_NAMES[month]} {year}</h2>
        <Button variant="outline" size="sm" onClick={nextMonth}>›</Button>
      </div>

      {/* Grade */}
      <div className="rounded-xl border overflow-hidden">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {DAY_NAMES.map((d) => (
            <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Células */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dateStr = day ? formatDay(day) : null
            const daySchedules = dateStr ? (byDay[dateStr] ?? []) : []
            const isToday = dateStr === todayStr

            return (
              <div
                key={idx}
                className={`min-h-[80px] p-1.5 border-r border-b last:border-r-0 ${!day ? 'bg-muted/10' : ''} ${isToday ? 'bg-blue-50' : ''}`}
              >
                {day && (
                  <>
                    <p className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-muted-foreground'}`}>
                      {day}
                    </p>
                    <div className="space-y-0.5">
                      {daySchedules.map((s) => (
                        <a
                          key={s.id}
                          href={`/schedules/${s.id}`}
                          className={`block text-[10px] leading-tight px-1.5 py-0.5 rounded truncate ${
                            s.status === 'published'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title={`${s.celebrations.title} · ${s.celebrations.time.slice(0, 5)} · ${s.status === 'published' ? 'Publicada' : 'Rascunho'}`}
                        >
                          {s.celebrations.time.slice(0, 5)} {s.celebrations.title}
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" />
          Publicada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" />
          Rascunho
        </span>
      </div>
    </div>
  )
}
