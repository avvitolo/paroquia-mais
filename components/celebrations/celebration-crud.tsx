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

// Tipo local para requisitos pendentes (não salvos ainda)
type PendingRequirement = {
  id: string // UUID local para controle de UI
  pastoral_id: string
  pastoral_name: string
  pastoral_role_id: string | null
  role_name: string | null
  quantity: number
}

// Formulário de adição de função (usado em modo criação via estado local e em edição via server action)
function AddRequirementForm({
  pastorals,
  allRoles,
  onAdd,
  onCancel,
  isPending,
}: {
  pastorals: Pastoral[]
  allRoles: Record<string, PastoralRole[]>
  onAdd: (req: Omit<PendingRequirement, 'id'>) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [pastoralId, setPastoralId] = useState('')
  const [roleId, setRoleId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const rolesForPastoral = pastoralId ? (allRoles[pastoralId] ?? []) : []
  const selectedPastoral = pastorals.find((p) => p.id === pastoralId)
  const selectedRole = roleId ? rolesForPastoral.find((r) => r.id === roleId) : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pastoralId) return
    onAdd({
      pastoral_id: pastoralId,
      pastoral_name: selectedPastoral?.name ?? '',
      pastoral_role_id: roleId || null,
      role_name: selectedRole?.name ?? null,
      quantity,
    })
    setPastoralId('')
    setRoleId('')
    setQuantity(1)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-muted/40 rounded-lg p-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">Pastoral *</Label>
          <select
            required
            disabled={isPending}
            value={pastoralId}
            onChange={(e) => { setPastoralId(e.target.value); setRoleId('') }}
            className="flex h-7 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
          >
            <option value="">Selecione...</option>
            {pastorals.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Função</Label>
          <select
            disabled={isPending || !pastoralId}
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="flex h-7 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
          >
            <option value="">
              {!pastoralId
                ? 'Selecione pastoral primeiro'
                : rolesForPastoral.length === 0
                  ? 'Sem funções (insere só a pastoral)'
                  : 'Opcional'}
            </option>
            {rolesForPastoral.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {pastoralId && rolesForPastoral.length === 0 && (
            <p className="text-[10px] text-muted-foreground">A pastoral será adicionada sem função específica.</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Quantidade *</Label>
          <Input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            required
            disabled={isPending}
            className="h-7 text-xs"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending || !pastoralId}>
          Adicionar
        </Button>
        <Button size="sm" type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

// Versão do formulário que chama server action (para celebrações já existentes)
function AddRequirementFormServer({
  celebrationId,
  pastorals,
  allRoles,
  onSuccess,
  onCancel,
  isPending,
}: {
  celebrationId: string
  pastorals: Pastoral[]
  allRoles: Record<string, PastoralRole[]>
  onSuccess: (req: PendingRequirement) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [pastoralId, setPastoralId] = useState('')
  const [roleId, setRoleId] = useState('')
  const rolesForPastoral = pastoralId ? (allRoles[pastoralId] ?? []) : []

  function handleSubmit(formData: FormData) {
    const pid = formData.get('pastoral_id') as string
    const rid = (formData.get('pastoral_role_id') as string) || null
    const qty = parseInt(formData.get('quantity') as string, 10) || 1
    const pastoral = pastorals.find((p) => p.id === pid)
    const role = rid ? (allRoles[pid] ?? []).find((r) => r.id === rid) : null
    onSuccess({
      id: crypto.randomUUID(),
      pastoral_id: pid,
      pastoral_name: pastoral?.name ?? '',
      pastoral_role_id: rid,
      role_name: role?.name ?? null,
      quantity: qty,
    })
    setPastoralId('')
    setRoleId('')
  }

  return (
    <form action={async (fd) => {
      try {
        await createCelebrationRequirementAction(fd)
        handleSubmit(fd)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao adicionar requisito.')
      }
    }} className="space-y-3 bg-muted/40 rounded-lg p-3">
      <input type="hidden" name="celebration_id" value={celebrationId} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">Pastoral *</Label>
          <select
            name="pastoral_id"
            required
            disabled={isPending}
            value={pastoralId}
            onChange={(e) => { setPastoralId(e.target.value); setRoleId('') }}
            className="flex h-7 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
          >
            <option value="">Selecione...</option>
            {pastorals.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Função</Label>
          <select
            name="pastoral_role_id"
            disabled={isPending || !pastoralId}
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="flex h-7 w-full rounded-lg border border-input bg-background px-2.5 text-xs"
          >
            <option value="">
              {!pastoralId
                ? 'Selecione pastoral primeiro'
                : rolesForPastoral.length === 0
                  ? 'Sem funções (insere só a pastoral)'
                  : 'Opcional'}
            </option>
            {rolesForPastoral.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {pastoralId && rolesForPastoral.length === 0 && (
            <p className="text-[10px] text-muted-foreground">A pastoral será adicionada sem função específica.</p>
          )}
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
        <Button size="sm" type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending || !pastoralId}>
          {isPending ? '...' : 'Adicionar'}
        </Button>
        <Button size="sm" type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
      </div>
    </form>
  )
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

  // Requisitos pendentes para nova celebração (estado local, não salvos ainda)
  const [pendingReqs, setPendingReqs] = useState<PendingRequirement[]>([])
  const [showPendingReqForm, setShowPendingReqForm] = useState(false)

  const visible = typeFilter ? items.filter((c) => c.type === typeFilter) : items

  function handleCreate(formData: FormData) {
    // Serializa requisitos pendentes como JSON
    if (pendingReqs.length > 0) {
      formData.set('requirements_json', JSON.stringify(
        pendingReqs.map((r) => ({
          pastoral_id: r.pastoral_id,
          pastoral_role_id: r.pastoral_role_id,
          quantity: r.quantity,
        }))
      ))
    }
    startTransition(async () => {
      try {
        const result = await createCelebrationAction(formData)
        setShowCreate(false)
        setPendingReqs([])
        setShowPendingReqForm(false)
        toast.success('Celebração criada.')
        const newId = result?.id ?? crypto.randomUUID()
        const newCeleb: Celebration = {
          id: newId,
          parish_id: '',
          title: formData.get('title') as string,
          date: formData.get('date') as string,
          time: formData.get('time') as string,
          type: formData.get('type') as string,
          notes: (formData.get('notes') as string) || null,
          created_at: new Date().toISOString(),
        }
        setItems((prev) => [...prev, newCeleb].sort((a, b) => a.date.localeCompare(b.date)))
        // Mapeia requisitos pendentes para o formato de exibição
        const savedReqs: CelebrationRequirementWithDetails[] = pendingReqs.map((r) => ({
          id: crypto.randomUUID(),
          parish_id: '',
          celebration_id: newId,
          pastoral_id: r.pastoral_id,
          pastoral_role_id: r.pastoral_role_id,
          quantity: r.quantity,
          created_at: new Date().toISOString(),
          pastorals: { name: r.pastoral_name },
          pastoral_roles: r.role_name ? { name: r.role_name } : null,
        }))
        setRequirements((prev) => ({ ...prev, [newId]: savedReqs }))
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

  function handleReqAddedToExisting(celebId: string, req: PendingRequirement) {
    setRequirements((prev) => ({
      ...prev,
      [celebId]: [...(prev[celebId] ?? []), {
        id: req.id,
        parish_id: '',
        celebration_id: celebId,
        pastoral_id: req.pastoral_id,
        pastoral_role_id: req.pastoral_role_id,
        quantity: req.quantity,
        created_at: new Date().toISOString(),
        pastorals: { name: req.pastoral_name },
        pastoral_roles: req.role_name ? { name: req.role_name } : null,
      }],
    }))
    setShowReqForm(null)
    toast.success('Requisito adicionado.')
  }

  const CelebrationFormFields = ({ celebration }: { celebration?: Celebration }) => (
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

      {/* Formulário de criação */}
      {showCreate && (
        <form action={handleCreate} className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold text-[#002045]">Nova Celebração</h2>
          <CelebrationFormFields />

          {/* Funções necessárias durante a criação (estado local) */}
          {pastorals.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Funções necessárias <span className="font-normal">(opcional)</span></p>
                {!showPendingReqForm && (
                  <Button size="sm" type="button" variant="outline" onClick={() => setShowPendingReqForm(true)} disabled={isPending}>
                    + Adicionar função
                  </Button>
                )}
              </div>

              {showPendingReqForm && (
                <AddRequirementForm
                  pastorals={pastorals}
                  allRoles={allRoles}
                  onAdd={(req) => {
                    setPendingReqs((prev) => [...prev, { id: crypto.randomUUID(), ...req }])
                    setShowPendingReqForm(false)
                  }}
                  onCancel={() => setShowPendingReqForm(false)}
                  isPending={isPending}
                />
              )}

              {pendingReqs.length > 0 && (
                <div className="space-y-1.5">
                  {pendingReqs.map((req) => (
                    <div key={req.id} className="flex items-center justify-between text-xs bg-muted/30 rounded px-3 py-1.5">
                      <span>
                        <span className="font-medium text-[#002045]">{req.pastoral_name}</span>
                        {req.role_name && (
                          <>
                            <span className="text-muted-foreground mx-1">·</span>
                            {req.role_name}
                          </>
                        )}
                        <span className="text-muted-foreground ml-1.5">({req.quantity} vaga{req.quantity !== 1 ? 's' : ''})</span>
                      </span>
                      <Button size="icon-xs" variant="destructive" type="button" onClick={() => setPendingReqs((prev) => prev.filter((r) => r.id !== req.id))} disabled={isPending}>×</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Criar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setShowCreate(false); setPendingReqs([]); setShowPendingReqForm(false) }} disabled={isPending}>Cancelar</Button>
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
                <CelebrationFormFields celebration={c} />
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
                        <Button size="sm" variant="outline" onClick={() => setShowReqForm(c.id)}>
                          + Adicionar
                        </Button>
                      )}
                    </div>

                    {showReqForm === c.id && (
                      <AddRequirementFormServer
                        celebrationId={c.id}
                        pastorals={pastorals}
                        allRoles={allRoles}
                        onSuccess={(req) => handleReqAddedToExisting(c.id, req)}
                        onCancel={() => setShowReqForm(null)}
                        isPending={isPending}
                      />
                    )}

                    {(requirements[c.id] ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {pastorals.length === 0
                          ? 'Cadastre pastorais primeiro para definir requisitos.'
                          : 'Nenhuma função necessária definida.'}
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {(requirements[c.id] ?? []).map((req) => (
                          <div key={req.id} className="flex items-center justify-between text-xs bg-muted/30 rounded px-3 py-1.5">
                            <span>
                              <span className="font-medium text-[#002045]">{req.pastorals.name}</span>
                              {req.pastoral_roles && (
                                <>
                                  <span className="text-muted-foreground mx-1">·</span>
                                  {req.pastoral_roles.name}
                                </>
                              )}
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
