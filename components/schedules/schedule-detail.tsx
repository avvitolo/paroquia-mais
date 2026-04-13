'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ScheduleWithCelebration, AssignmentWithMember } from '@/lib/mcp/schedule.mcp'
import type { Member } from '@/lib/mcp/member.mcp'
import {
  addAssignmentAction,
  removeAssignmentAction,
  publishScheduleAction,
} from '@/features/schedules/actions'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando',
  confirmed: 'Confirmado',
  declined: 'Recusado',
}
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
}

interface ScheduleDetailProps {
  schedule: ScheduleWithCelebration
  assignments: AssignmentWithMember[]
  members: Member[]
}

export function ScheduleDetail({ schedule: initial, assignments: initialAssignments, members }: ScheduleDetailProps) {
  const [schedule, setSchedule] = useState<ScheduleWithCelebration>(initial)
  const [assignments, setAssignments] = useState<AssignmentWithMember[]>(initialAssignments)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Membros que ainda não estão na escala
  const availableMembers = members.filter(
    (m) => m.is_active && !assignments.some((a) => a.member_id === m.id)
  )

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      try {
        await addAssignmentAction(formData)
        setShowAddForm(false)
        toast.success('Membro adicionado à escala.')
        const memberId = formData.get('member_id') as string
        const member = members.find((m) => m.id === memberId)
        if (member) {
          setAssignments((prev) => [...prev, {
            id: crypto.randomUUID(),
            schedule_id: schedule.id,
            parish_id: schedule.parish_id,
            member_id: memberId,
            role: formData.get('role') as string,
            status: 'pending',
            created_at: new Date().toISOString(),
            members: { full_name: member.full_name, email: member.email },
          }])
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao adicionar membro.')
      }
    })
  }

  function handleRemove(assignmentId: string) {
    const formData = new FormData()
    formData.set('id', assignmentId)
    formData.set('schedule_id', schedule.id)
    startTransition(async () => {
      try {
        await removeAssignmentAction(formData)
        toast.success('Membro removido da escala.')
        setAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao remover.')
      }
    })
  }

  function handlePublish() {
    const formData = new FormData()
    formData.set('id', schedule.id)
    startTransition(async () => {
      try {
        await publishScheduleAction(formData)
        toast.success('Escala publicada! Os membros já podem ver suas atribuições.')
        setSchedule((prev) => ({ ...prev, status: 'published' }))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao publicar escala.')
      }
    })
  }

  const isDraft = schedule.status === 'draft'
  const formatDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <a href="/schedules" className="text-xs text-muted-foreground hover:underline">← Escalas</a>
          <h1 className="text-2xl font-bold text-[#002045] mt-1">{schedule.celebrations.title}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(schedule.celebrations.date)} às {schedule.celebrations.time.slice(0, 5)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${schedule.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {schedule.status === 'published' ? 'Publicada' : 'Rascunho'}
          </span>
          {isDraft && (
            <Button
              onClick={handlePublish}
              disabled={isPending || assignments.length === 0}
              className="bg-green-700 text-white hover:bg-green-800"
              size="sm"
            >
              Publicar Escala
            </Button>
          )}
        </div>
      </div>

      {/* Atribuições */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-[#002045]">
            Membros escalados ({assignments.length})
          </h2>
          {isDraft && !showAddForm && availableMembers.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
              + Adicionar membro
            </Button>
          )}
        </div>

        {/* Formulário de adição */}
        {showAddForm && isDraft && (
          <form action={handleAdd} className="p-4 border-b bg-muted/30 space-y-3">
            <input type="hidden" name="schedule_id" value={schedule.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Membro *</Label>
                <select name="member_id" required disabled={isPending}
                  className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm">
                  <option value="">Selecione...</option>
                  {availableMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Função *</Label>
                <Input name="role" placeholder="Ex: Leitor, Cantor, Acólito" required disabled={isPending} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
                {isPending ? 'Adicionando...' : 'Adicionar'}
              </Button>
              <Button size="sm" type="button" variant="outline" onClick={() => setShowAddForm(false)} disabled={isPending}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {assignments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum membro adicionado.</p>
            {isDraft && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowAddForm(true)}>
                Adicionar primeiro membro
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#002045] truncate">{a.members.full_name}</p>
                  <p className="text-xs text-muted-foreground">{a.role}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status]}`}>
                    {STATUS_LABELS[a.status]}
                  </span>
                  {isDraft && (
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => handleRemove(a.id)}
                      disabled={isPending}
                      title="Remover"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isDraft && assignments.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Adicione membros antes de publicar a escala.
        </p>
      )}
    </div>
  )
}
