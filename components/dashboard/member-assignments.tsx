'use client'

// Componente client para confirmação de presença nas escalas (Story 5.1)
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { confirmAssignmentAction } from '@/features/schedules/actions'

type Assignment = {
  id: string
  role: string
  status: 'pending' | 'confirmed' | 'declined'
  schedules: {
    status: string
    celebrations: { title: string; date: string; time: string }
  }
}

interface MemberAssignmentsProps {
  assignments: Assignment[]
}

const STATUS_LABELS = { pending: 'Aguardando', confirmed: 'Confirmado', declined: 'Recusado' }
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
}

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit',
  })
}

export function MemberAssignments({ assignments: initial }: MemberAssignmentsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>(initial)
  const [isPending, startTransition] = useTransition()

  function handleConfirm(id: string, status: 'confirmed' | 'declined') {
    const formData = new FormData()
    formData.set('id', id)
    formData.set('status', status)
    startTransition(async () => {
      try {
        await confirmAssignmentAction(formData)
        setAssignments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        )
        toast.success(status === 'confirmed' ? 'Presença confirmada!' : 'Presença recusada.')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar.')
      }
    })
  }

  if (assignments.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-[#002045]">Minhas Escalas</h2>
      <div className="space-y-2">
        {assignments.map((a) => (
          <div key={a.id} className="rounded-xl border bg-card p-4 flex items-center justify-between gap-4 shadow-sm">
            <div className="min-w-0">
              <p className="font-medium text-sm text-[#002045] truncate">
                {a.schedules.celebrations.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(a.schedules.celebrations.date)} às {a.schedules.celebrations.time.slice(0, 5)} · {a.role}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {a.status === 'pending' ? (
                <>
                  <Button
                    size="xs"
                    className="bg-green-700 text-white hover:bg-green-800"
                    onClick={() => handleConfirm(a.id, 'confirmed')}
                    disabled={isPending}
                  >
                    Confirmar
                  </Button>
                  <Button
                    size="xs"
                    variant="destructive"
                    onClick={() => handleConfirm(a.id, 'declined')}
                    disabled={isPending}
                  >
                    Recusar
                  </Button>
                </>
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status]}`}>
                  {STATUS_LABELS[a.status]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
