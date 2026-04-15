'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScheduleCalendar } from '@/components/schedules/schedule-calendar'
import type { ScheduleWithCelebration } from '@/lib/mcp/schedule.mcp'
import type { Celebration } from '@/lib/mcp/celebration.mcp'
import { createScheduleAction } from '@/features/schedules/actions'

const STATUS_LABELS = { draft: 'Rascunho', published: 'Publicada' }
const STATUS_COLORS = {
  draft: 'bg-amber-100 text-amber-800',
  published: 'bg-green-100 text-green-800',
}

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

interface ScheduleListProps {
  schedules: ScheduleWithCelebration[]
  celebrations: Celebration[]
}

export function ScheduleList({ schedules: initial, celebrations }: ScheduleListProps) {
  const [schedules, setSchedules] = useState<ScheduleWithCelebration[]>(initial)
  const [showCreate, setShowCreate] = useState(false)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [isPending, startTransition] = useTransition()

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      try {
        await createScheduleAction(formData)
        setShowCreate(false)
        toast.success('Escala criada. Abra para adicionar membros.')
        const celId = formData.get('celebration_id') as string
        const cel = celebrations.find((c) => c.id === celId)
        if (cel) {
          setSchedules((prev) => [{
            id: crypto.randomUUID(),
            parish_id: '',
            celebration_id: celId,
            status: 'draft',
            notes: null,
            created_at: new Date().toISOString(),
            celebrations: { title: cel.title, date: cel.date, time: cel.time, type: cel.type },
          }, ...prev])
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao criar escala.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#002045]">Escalas</h1>
          <p className="text-sm text-muted-foreground mt-1">{schedules.length} escala(s)</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Toggle lista/calendário */}
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm ${view === 'list' ? 'bg-[#002045] text-white' : 'bg-background text-muted-foreground hover:bg-muted'}`}
            >
              Lista
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-sm ${view === 'calendar' ? 'bg-[#002045] text-white' : 'bg-background text-muted-foreground hover:bg-muted'}`}
            >
              Calendário
            </button>
          </div>
          {!showCreate && (
            <Button className="bg-[#002045] text-white hover:bg-[#1a365d]" onClick={() => setShowCreate(true)}>
              + Nova Escala
            </Button>
          )}
        </div>
      </div>

      {showCreate && (
        <form action={handleCreate} className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold text-[#002045]">Nova Escala</h2>
          {celebrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Não há celebrações cadastradas. <a href="/celebrations" className="underline text-[#002045]">Cadastre uma celebração</a> primeiro.
            </p>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Celebração *</Label>
                <select name="celebration_id" required disabled={isPending}
                  className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm">
                  <option value="">Selecione...</option>
                  {celebrations.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} — {formatDate(c.date)} {c.time.slice(0, 5)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Observações</Label>
                <Input name="notes" placeholder="Opcional" disabled={isPending} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
                  {isPending ? 'Criando...' : 'Criar Escala'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)} disabled={isPending}>Cancelar</Button>
              </div>
            </>
          )}
        </form>
      )}

      {view === 'calendar' ? (
        <ScheduleCalendar schedules={schedules} />
      ) : (
        <>
          {schedules.length === 0 && !showCreate ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma escala criada ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => (
                <a
                  key={s.id}
                  href={`/schedules/${s.id}`}
                  className="block rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-[#002045] truncate">{s.celebrations.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(s.celebrations.date)} às {s.celebrations.time.slice(0, 5)}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
