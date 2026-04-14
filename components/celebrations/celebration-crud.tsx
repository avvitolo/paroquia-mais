'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Celebration } from '@/lib/mcp/celebration.types'
import { CELEBRATION_TYPES } from '@/lib/mcp/celebration.types'
import {
  createCelebrationAction,
  updateCelebrationAction,
  deleteCelebrationAction,
} from '@/features/celebrations/actions'

const TYPE_LABELS: Record<string, string> = {
  missa: 'Missa',
  novena: 'Novena',
  'terço': 'Terço',
  'via-sacra': 'Via-Sacra',
  'adoração': 'Adoração',
  retiro: 'Retiro',
  outro: 'Outro',
}

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

interface CelebrationCrudProps {
  initialCelebrations: Celebration[]
}

export function CelebrationCrud({ initialCelebrations }: CelebrationCrudProps) {
  const [items, setItems] = useState<Celebration[]>(initialCelebrations)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [isPending, startTransition] = useTransition()

  const visible = typeFilter ? items.filter((c) => c.type === typeFilter) : items

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      try {
        await createCelebrationAction(formData)
        setShowCreate(false)
        toast.success('Celebração criada.')
        setItems((prev) => [...prev, {
          id: crypto.randomUUID(),
          parish_id: '',
          title: formData.get('title') as string,
          date: formData.get('date') as string,
          time: formData.get('time') as string,
          type: formData.get('type') as string,
          notes: (formData.get('notes') as string) || null,
          created_at: new Date().toISOString(),
        }].sort((a, b) => a.date.localeCompare(b.date)))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao criar celebração.')
      }
    })
  }

  function handleUpdate(formData: FormData) {
    const id = formData.get('id') as string
    startTransition(async () => {
      try {
        await updateCelebrationAction(formData)
        setEditingId(null)
        toast.success('Celebração atualizada.')
        setItems((prev) => prev.map((c) => c.id === id ? {
          ...c,
          title: formData.get('title') as string,
          date: formData.get('date') as string,
          time: formData.get('time') as string,
          type: formData.get('type') as string,
          notes: (formData.get('notes') as string) || null,
        } : c).sort((a, b) => a.date.localeCompare(b.date)))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar.')
      }
    })
  }

  function handleDelete(id: string) {
    const formData = new FormData()
    formData.set('id', id)
    startTransition(async () => {
      try {
        await deleteCelebrationAction(formData)
        setDeletingId(null)
        toast.success('Celebração removida.')
        setItems((prev) => prev.filter((c) => c.id !== id))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao remover.')
      }
    })
  }

  const CelebrationForm = ({ celebration }: { celebration?: Celebration }) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {celebration && <input type="hidden" name="id" value={celebration.id} />}
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Título *</Label>
        <Input name="title" defaultValue={celebration?.title} placeholder="Ex: Missa de Pentecostes" required disabled={isPending} />
      </div>
      <div className="space-y-1.5">
        <Label>Data *</Label>
        <Input type="date" name="date" defaultValue={celebration?.date} required disabled={isPending} />
      </div>
      <div className="space-y-1.5">
        <Label>Horário *</Label>
        <Input type="time" name="time" defaultValue={celebration?.time} required disabled={isPending} />
      </div>
      <div className="space-y-1.5">
        <Label>Tipo *</Label>
        <select name="type" defaultValue={celebration?.type ?? 'missa'} required disabled={isPending}
          className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm">
          {CELEBRATION_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>Observações</Label>
        <Input name="notes" defaultValue={celebration?.notes ?? ''} placeholder="Opcional" disabled={isPending} />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#002045]">Celebrações</h1>
          <p className="text-sm text-muted-foreground mt-1">{visible.length} celebração(ões)</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
          >
            <option value="">Todos os tipos</option>
            {CELEBRATION_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
            ))}
          </select>
          {!showCreate && (
            <Button className="bg-[#002045] text-white hover:bg-[#1a365d]" onClick={() => setShowCreate(true)}>
              + Nova Celebração
            </Button>
          )}
        </div>
      </div>

      {showCreate && (
        <form action={handleCreate} className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold text-[#002045]">Nova Celebração</h2>
          <CelebrationForm />
          <div className="flex gap-2">
            <Button type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Criar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)} disabled={isPending}>Cancelar</Button>
          </div>
        </form>
      )}

      {visible.length === 0 && !showCreate ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma celebração encontrada.</p>
          <Button variant="outline" className="mt-4" onClick={() => setShowCreate(true)}>
            Criar primeira celebração
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((c) =>
            editingId === c.id ? (
              <form key={c.id} action={handleUpdate} className="rounded-xl border border-[#002045]/30 bg-card p-5 space-y-4 shadow-sm">
                <h3 className="font-semibold text-[#002045]">Editar Celebração</h3>
                <CelebrationForm celebration={c} />
                <div className="flex gap-2">
                  <Button size="sm" type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
                    {isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button size="sm" type="button" variant="outline" onClick={() => setEditingId(null)} disabled={isPending}>Cancelar</Button>
                </div>
              </form>
            ) : deletingId === c.id ? (
              <div key={c.id} className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 space-y-3">
                <p className="text-sm font-medium">Confirma exclusão de <strong>{c.title}</strong>?</p>
                <p className="text-xs text-muted-foreground">Celebrações com escalas vinculadas não podem ser excluídas.</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)} disabled={isPending}>
                    {isPending ? 'Removendo...' : 'Confirmar'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeletingId(null)} disabled={isPending}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <div key={c.id} className="rounded-xl border bg-card p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="min-w-0">
                  <p className="font-medium text-[#002045] truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(c.date)} às {c.time.slice(0, 5)} · {TYPE_LABELS[c.type] ?? c.type}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => { setEditingId(c.id); setDeletingId(null) }}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => { setDeletingId(c.id); setEditingId(null) }}>Excluir</Button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
