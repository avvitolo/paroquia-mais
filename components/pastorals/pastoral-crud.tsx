'use client'

// Componente client para CRUD de pastorais + funções + coordenador
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Pastoral } from '@/lib/mcp/pastoral.mcp'
import type { PastoralRole } from '@/lib/mcp/pastoral-role.mcp'
import type { Member } from '@/lib/mcp/member.mcp'
import {
  createPastoralAction,
  updatePastoralAction,
  deletePastoralAction,
} from '@/features/pastorals/actions'
import {
  createPastoralRoleAction,
  deletePastoralRoleAction,
} from '@/features/pastoral-roles/actions'

interface PastoralCrudProps {
  initialPastorals: Pastoral[]
  initialRoles: Record<string, PastoralRole[]>
  members: Member[]
}

// Seletor de coordenador com busca por nome
function CoordinatorSelect({
  members,
  value,
  onChange,
  disabled,
}: {
  members: Member[]
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const [search, setSearch] = useState('')
  const filtered = search
    ? members.filter((m) => m.full_name.toLowerCase().includes(search.toLowerCase()))
    : members

  return (
    <div className="space-y-1.5">
      <Label htmlFor="coordinator-search">Coordenador</Label>
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <Input
            id="coordinator-search"
            placeholder="Buscar membro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
            className="h-8 text-sm"
          />
          {search && filtered.length > 0 && (
            <div className="border border-border rounded-lg bg-background shadow-md max-h-36 overflow-y-auto">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange(m.id)
                    setSearch('')
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                >
                  {m.full_name}
                </button>
              ))}
            </div>
          )}
          {search && filtered.length === 0 && (
            <p className="text-xs text-muted-foreground px-1">Nenhum membro encontrado.</p>
          )}
        </div>
        {value && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => { onChange(''); setSearch('') }}
            disabled={disabled}
            className="self-start"
          >
            Remover
          </Button>
        )}
      </div>
      {value && (
        <p className="text-xs text-muted-foreground">
          Coordenador selecionado: <strong>{members.find((m) => m.id === value)?.full_name ?? value}</strong>
        </p>
      )}
      <input type="hidden" name="coordinator_id" value={value} />
    </div>
  )
}

export function PastoralCrud({ initialPastorals, initialRoles, members }: PastoralCrudProps) {
  const router = useRouter()
  const [pastorals, setPastorals] = useState<Pastoral[]>(initialPastorals)
  const [roles, setRoles] = useState<Record<string, PastoralRole[]>>(initialRoles)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showRoleForm, setShowRoleForm] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Estado do formulário de criação
  const [createCoordinatorId, setCreateCoordinatorId] = useState('')
  const [createPendingRoles, setCreatePendingRoles] = useState<string[]>([])
  const [createRoleInput, setCreateRoleInput] = useState('')

  // Estado do formulário de edição (coordenador)
  const [editCoordinatorId, setEditCoordinatorId] = useState<string>('')

  function resetCreateForm() {
    setCreateCoordinatorId('')
    setCreatePendingRoles([])
    setCreateRoleInput('')
  }

  function handleAddPendingRole() {
    const name = createRoleInput.trim()
    if (!name) return
    if (createPendingRoles.includes(name)) {
      toast.error('Função já adicionada.')
      return
    }
    setCreatePendingRoles((prev) => [...prev, name])
    setCreateRoleInput('')
  }

  function handleCreate(formData: FormData) {
    // Injeta funções pendentes como campos múltiplos
    createPendingRoles.forEach((r) => formData.append('role_name', r))
    startTransition(async () => {
      try {
        await createPastoralAction(formData)
        setShowCreateForm(false)
        resetCreateForm()
        toast.success('Pastoral criada com sucesso.')
        const name = formData.get('name') as string
        const description = (formData.get('description') as string) || null
        const newId = crypto.randomUUID()
        setPastorals((prev) => [...prev, {
          id: newId,
          parish_id: '',
          name,
          description,
          coordinator_id: createCoordinatorId || null,
          coordinator_name: createCoordinatorId
            ? (members.find((m) => m.id === createCoordinatorId)?.full_name ?? null)
            : null,
          created_at: new Date().toISOString(),
        }])
        const newRoles = createPendingRoles.map((r) => ({
          id: crypto.randomUUID(),
          parish_id: '',
          pastoral_id: newId,
          name: r,
          created_at: new Date().toISOString(),
        }))
        setRoles((prev) => ({ ...prev, [newId]: newRoles }))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao criar pastoral.')
      }
    })
  }

  function handleUpdate(formData: FormData) {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const description = (formData.get('description') as string) || null
    const coordinator_id = (formData.get('coordinator_id') as string) || null
    startTransition(async () => {
      try {
        await updatePastoralAction(formData)
        setEditingId(null)
        setEditCoordinatorId('')
        toast.success('Pastoral atualizada.')
        setPastorals((prev) => prev.map((p) =>
          p.id === id ? {
            ...p,
            name,
            description,
            coordinator_id,
            coordinator_name: coordinator_id
              ? (members.find((m) => m.id === coordinator_id)?.full_name ?? null)
              : null,
          } : p
        ))
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar pastoral.')
      }
    })
  }

  function handleDelete(id: string) {
    const formData = new FormData()
    formData.set('id', id)
    startTransition(async () => {
      try {
        await deletePastoralAction(formData)
        setDeletingId(null)
        toast.success('Pastoral removida.')
        setPastorals((prev) => prev.filter((p) => p.id !== id))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao remover pastoral.')
      }
    })
  }

  function handleCreateRole(formData: FormData) {
    const pastoralId = formData.get('pastoral_id') as string
    startTransition(async () => {
      try {
        await createPastoralRoleAction(formData)
        setShowRoleForm(null)
        toast.success('Função criada.')
        const name = formData.get('name') as string
        setRoles((prev) => ({
          ...prev,
          [pastoralId]: [...(prev[pastoralId] ?? []), {
            id: crypto.randomUUID(), parish_id: '', pastoral_id: pastoralId,
            name, created_at: new Date().toISOString(),
          }],
        }))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao criar função.')
      }
    })
  }

  function handleDeleteRole(roleId: string, pastoralId: string) {
    const formData = new FormData()
    formData.set('id', roleId)
    startTransition(async () => {
      try {
        await deletePastoralRoleAction(formData)
        toast.success('Função removida.')
        setRoles((prev) => ({ ...prev, [pastoralId]: (prev[pastoralId] ?? []).filter((r) => r.id !== roleId) }))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao remover função.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#002045]">Pastorais</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pastorals.length === 0 ? 'Nenhuma pastoral cadastrada.' : `${pastorals.length} pastoral${pastorals.length !== 1 ? 'is' : ''}`}
          </p>
        </div>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)} className="bg-[#002045] text-white hover:bg-[#1a365d]">
            + Nova Pastoral
          </Button>
        )}
      </div>

      {/* Formulário de criação */}
      {showCreateForm && (
        <form action={handleCreate} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold text-[#002045]">Nova Pastoral</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nome *</Label>
              <Input id="new-name" name="name" placeholder="Nome da pastoral" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-description">Descrição</Label>
              <Input id="new-description" name="description" placeholder="Descrição (opcional)" disabled={isPending} />
            </div>
          </div>

          {/* Coordenador */}
          <CoordinatorSelect
            members={members.filter((m) => m.is_active)}
            value={createCoordinatorId}
            onChange={setCreateCoordinatorId}
            disabled={isPending}
          />

          {/* Funções — podem ser adicionadas na criação */}
          <div className="space-y-2">
            <Label>Funções da pastoral</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da função"
                value={createRoleInput}
                onChange={(e) => setCreateRoleInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPendingRole() } }}
                disabled={isPending}
                className="h-8 text-sm"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddPendingRole} disabled={isPending || !createRoleInput.trim()}>
                Adicionar
              </Button>
            </div>
            {createPendingRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {createPendingRoles.map((r) => (
                  <span key={r} className="flex items-center gap-1 bg-[#002045]/8 border border-[#002045]/20 rounded-full px-3 py-0.5 text-xs text-[#002045]">
                    {r}
                    <button
                      type="button"
                      onClick={() => setCreatePendingRoles((prev) => prev.filter((x) => x !== r))}
                      className="hover:text-destructive ml-0.5"
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Criar Pastoral'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setShowCreateForm(false); resetCreateForm() }} disabled={isPending}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Lista de pastorais */}
      {pastorals.length === 0 && !showCreateForm ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground text-sm">Nenhuma pastoral cadastrada ainda.</p>
          <Button onClick={() => setShowCreateForm(true)} variant="outline" className="mt-4">
            Criar primeira pastoral
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {pastorals.map((pastoral) =>
            deletingId === pastoral.id ? (
              <div key={pastoral.id} className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 space-y-3">
                <p className="font-medium text-sm text-[#002045]">{pastoral.name}</p>
                <p className="text-sm text-muted-foreground">
                  Confirma a exclusão desta pastoral? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(pastoral.id)} disabled={isPending}>
                    {isPending ? 'Removendo...' : 'Confirmar exclusão'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeletingId(null)} disabled={isPending}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div key={pastoral.id} className="rounded-xl border border-border bg-card shadow-sm">
                {/* Formulário de edição */}
                {editingId === pastoral.id ? (
                  <form action={handleUpdate} className="p-5 space-y-3">
                    <input type="hidden" name="id" value={pastoral.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Nome *</Label>
                        <Input name="name" defaultValue={pastoral.name} required disabled={isPending} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Descrição</Label>
                        <Input name="description" defaultValue={pastoral.description ?? ''} disabled={isPending} />
                      </div>
                    </div>
                    <CoordinatorSelect
                      members={members.filter((m) => m.is_active)}
                      value={editCoordinatorId}
                      onChange={setEditCoordinatorId}
                      disabled={isPending}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
                        {isPending ? 'Salvando...' : 'Salvar'}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => { setEditingId(null); setEditCoordinatorId('') }} disabled={isPending}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#002045]">{pastoral.name}</h3>
                      {pastoral.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{pastoral.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-3 mt-1">
                        {pastoral.coordinator_name && (
                          <p className="text-xs text-muted-foreground">
                            Coordenador: <span className="font-medium text-[#002045]">{pastoral.coordinator_name}</span>
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {(roles[pastoral.id] ?? []).length} função(ões)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedId(expandedId === pastoral.id ? null : pastoral.id)}
                      >
                        {expandedId === pastoral.id ? 'Fechar' : 'Funções'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(pastoral.id)
                          setEditCoordinatorId(pastoral.coordinator_id ?? '')
                          setDeletingId(null)
                          setExpandedId(null)
                        }}
                      >
                        Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { setDeletingId(pastoral.id); setEditingId(null) }}>
                        Excluir
                      </Button>
                    </div>
                  </div>
                )}

                {/* Seção de funções */}
                {expandedId === pastoral.id && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Funções da pastoral</p>
                      {showRoleForm !== pastoral.id && (
                        <Button size="sm" variant="outline" onClick={() => setShowRoleForm(pastoral.id)}>
                          + Adicionar função
                        </Button>
                      )}
                    </div>

                    {showRoleForm === pastoral.id && (
                      <form action={handleCreateRole} className="flex gap-2 items-end bg-muted/40 rounded-lg p-3">
                        <input type="hidden" name="pastoral_id" value={pastoral.id} />
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Nome da função *</Label>
                          <Input name="name" placeholder="Nome da função" required disabled={isPending} className="h-7 text-xs" />
                        </div>
                        <Button size="sm" type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
                          {isPending ? '...' : 'Criar'}
                        </Button>
                        <Button size="sm" type="button" variant="outline" onClick={() => setShowRoleForm(null)} disabled={isPending}>
                          Cancelar
                        </Button>
                      </form>
                    )}

                    {(roles[pastoral.id] ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nenhuma função cadastrada.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(roles[pastoral.id] ?? []).map((role) => (
                          <div key={role.id} className="flex items-center gap-1.5 bg-[#002045]/8 border border-[#002045]/20 rounded-full px-3 py-1 text-xs">
                            <span className="text-[#002045] font-medium">{role.name}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteRole(role.id, pastoral.id)}
                              disabled={isPending}
                              className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                              title="Remover função"
                            >
                              ×
                            </button>
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
