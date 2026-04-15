'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Celebration } from '@/lib/mcp/celebration.types'
import { CELEBRATION_TYPES } from '@/lib/mcp/celebration.types'
import type { Pastoral } from '@/lib/mcp/pastoral.mcp'
import type { PastoralRole } from '@/lib/mcp/pastoral-role.mcp'
import type { CelebrationRequirementWithDetails } from '@/lib/mcp/celebration-requirement.mcp'
import {
  createCelebrationAction,
  updateCelebrationAction,
  deleteCelebrationAction,
} from '@/features/celebrations/actions'
import {
  createCelebrationRequirementAction,
  deleteCelebrationRequirementAction,
} from '@/features/celebration-requirements/actions'

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
  pastorals: Pastoral[]
  allRoles: Record<string, PastoralRole[]>
  initialRequirements: Record<string, CelebrationRequirementWithDetails[]>
}

export function CelebrationCrud({
  initialCelebrations,
  pastorals,
  allRoles,
  initialRequirements,
}: CelebrationCrudProps) {
  const [items, setItems] = useState<Celebration[]>(initialCelebrations)
  const [requirements, setRequirements] = useState<Record<string, CelebrationRequirementWithDetails[]>>(initialRequirements)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showReqForm, setShowReqForm] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [isPending, startTransition] = useTransition()

  // Para o formulário de requisito: pastoral selecionada controla as funções disponíveis
  const [reqPastoralId, setReqPastoralId] = useState<string>('')

  const visible = typeFilter ? items.filter((c) => c.type === typeFilter) : items

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      try {
        await createCelebrationAction(formData)
        setShowCreate(false)
        toast.success('Celebração criada.')
        const newId = crypto.randomUUID()
        setItems((prev) => [...prev, {
          id: newId,
          parish_id: '',
          title: formData.get('title') as string,
          date: formData.get('date') as string,
          time: formData.get('time') as string,
          type: formData.get('type') as string,
          notes: (formData.get('notes') as string) || null,
          created_at: new Date().toISOString(),
        }].sort((a, b) => a.date.localeCompare(b.date)))
        setRequirements((prev) => ({ ...prev, [newId]: [] }))
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

  function handleCreateReq(formData: FormData) {
    const celebId = formData.get('celebration_id') as string
    startTransition(async () => {
      try {
        await createCelebrationRequirementAction(formData)
        setShowReqForm(null)
        setReqPastoralId('')
        toast.success('Requisito adicionado.')
        const pastoralId = formData.get('pastoral_id') as string
        const roleId = formData.get('pastoral_role_id') as string
        const quantity = parseInt(formData.get('quantity') as string, 10) || 1
        const pastoral = pastorals.find((p) => p.id === pastoralId)
        const role = (allRoles[pastoralId] ?? []).find((r) => r.id === roleId)
        setRequirements((prev) => ({
          ...prev,
          [celebId]: [...(prev[celebId] ?? []), {
            id: crypto.randomUUID(),
            parish_id: '', celebration_id: celebId, pastoral_id: pastoralId,
            pastoral_role_id: roleId, quantity,
            created_at: new Date().toISOString(),
            pastorals: { name: pastoral?.name ?? '' },
            pastoral_roles: { name: role?.name ?? '' },
          }],
        }))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao adicionar requisito.')
      }
    })
  }

  function handleDeleteReq(reqId: string, celebId: string) {
    const formData = new FormData()
    formData.set('id', reqId)
    startTransition(async () => {
      try {
        await deleteCelebrationRequirementAction(formData)
        toast.success('Requisito removido.')
        setRequirements((prev) => ({ ...prev, [celebId]: (prev[celebId] ?? []).filter((r) => r.id !== reqId) }))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro.')
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
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm">
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
              <div key={c.id} className="rounded-xl border bg-card shadow-sm">
                {/* Linha principal */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-[#002045] truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(c.date)} às {c.time.slice(0, 5)} · {TYPE_LABELS[c.type] ?? c.type}
                    </p>
                    {(requirements[c.id] ?? []).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(requirements[c.id] ?? []).reduce((acc, r) => acc + r.quantity, 0)} vaga(s) definida(s)
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    >
                      {expandedId === c.id ? 'Fechar' : 'Funções'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingId(c.id); setDeletingId(null); setExpandedId(null) }}>Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => { setDeletingId(c.id); setEditingId(null) }}>Excluir</Button>
                  </div>
                </div>

                {/* Seção de requisitos de função */}
                {expandedId === c.id && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Funções necessárias</p>
                      {showReqForm !== c.id && pastorals.length > 0 && (
                        <Button size="sm" variant="outline" onClick={() => { setShowReqForm(c.id); setReqPastoralId('') }}>
                          + Adicionar
                        </Button>
                      )}
                    </div>

                    {showReqForm === c.id && (
                      <form action={handleCreateReq} className="space-y-3 bg-muted/40 rounded-lg p-3">
                        <input type="hidden" name="celebration_id" value={c.id} />
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Pastoral *</Label>
                            <select
                              name="pastoral_id"
                              required
                              disabled={isPending}
                              value={reqPastoralId}
                              onChange={(e) => setReqPastoralId(e.target.value)}
                              className="flex h-7 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
                            >
                              <option value="">Selecione...</option>
                              {pastorals.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Função *</Label>
                            <select
                              name="pastoral_role_id"
                              required
                              disabled={isPending || !reqPastoralId}
                              className="flex h-7 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
                            >
                              <option value="">
                                {reqPastoralId ? (allRoles[reqPastoralId] ?? []).length === 0 ? 'Sem funções cadastradas' : 'Selecione...' : 'Selecione pastoral primeiro'}
                              </option>
                              {reqPastoralId && (allRoles[reqPastoralId] ?? []).map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Quantidade *</Label>
                            <Input
                              type="number"
                              name="quantity"
                              min={1}
                              max={99}
                              defaultValue={1}
                              required
                              disabled={isPending}
                              className="h-7 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending || !reqPastoralId}>
                            {isPending ? '...' : 'Adicionar'}
                          </Button>
                          <Button size="sm" type="button" variant="outline" onClick={() => { setShowReqForm(null); setReqPastoralId('') }} disabled={isPending}>
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    )}

                    {(requirements[c.id] ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {pastorals.length === 0
                          ? 'Cadastre pastorais e funções primeiro para definir requisitos.'
                          : 'Nenhuma função necessária definida.'}
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {(requirements[c.id] ?? []).map((req) => (
                          <div key={req.id} className="flex items-center justify-between text-xs bg-muted/30 rounded px-3 py-1.5">
                            <span>
                              <span className="font-medium text-[#002045]">{req.pastorals.name}</span>
                              <span className="text-muted-foreground mx-1">·</span>
                              {req.pastoral_roles.name}
                              <span className="text-muted-foreground ml-1.5">({req.quantity} vaga{req.quantity !== 1 ? 's' : ''})</span>
                            </span>
                            <Button
                              size="icon-xs"
                              variant="destructive"
                              onClick={() => handleDeleteReq(req.id, c.id)}
                              disabled={isPending}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
