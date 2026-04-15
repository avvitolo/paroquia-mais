'use client'

// Componente client para CRUD de pastorais + funções (pastoral_roles) — S3
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Pastoral } from '@/lib/mcp/pastoral.mcp'
import type { PastoralRole } from '@/lib/mcp/pastoral-role.mcp'
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
}

export function PastoralCrud({ initialPastorals, initialRoles }: PastoralCrudProps) {
  const [pastorals, setPastorals] = useState<Pastoral[]>(initialPastorals)
  const [roles, setRoles] = useState<Record<string, PastoralRole[]>>(initialRoles)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showRoleForm, setShowRoleForm] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      try {
        await createPastoralAction(formData)
        setShowCreateForm(false)
        toast.success('Pastoral criada com sucesso.')
        const name = formData.get('name') as string
        const description = (formData.get('description') as string) || null
        const newId = crypto.randomUUID()
        setPastorals((prev) => [...prev, { id: newId, parish_id: '', name, description, created_at: new Date().toISOString() }])
        setRoles((prev) => ({ ...prev, [newId]: [] }))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao criar pastoral.')
      }
    })
  }

  function handleUpdate(formData: FormData) {
    const id = formData.get('id') as string
    startTransition(async () => {
      try {
        await updatePastoralAction(formData)
        setEditingId(null)
        toast.success('Pastoral atualizada.')
        const name = formData.get('name') as string
        const description = (formData.get('description') as string) || null
        setPastorals((prev) => prev.map((p) => (p.id === id ? { ...p, name, description } : p)))
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
          <div className="space-y-2">
            <Label htmlFor="new-name">Nome *</Label>
            <Input id="new-name" name="name" placeholder="Ex: Pastoral da Juventude" required disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-description">Descrição</Label>
            <Input id="new-description" name="description" placeholder="Breve descrição da pastoral" disabled={isPending} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Criar Pastoral'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} disabled={isPending}>
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
                {/* Cabeçalho do card */}
                {editingId === pastoral.id ? (
                  <form action={handleUpdate} className="p-5 space-y-3">
                    <input type="hidden" name="id" value={pastoral.id} />
                    <div className="space-y-1.5">
                      <Label>Nome *</Label>
                      <Input name="name" defaultValue={pastoral.name} required disabled={isPending} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Descrição</Label>
                      <Input name="description" defaultValue={pastoral.description ?? ''} disabled={isPending} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
                        {isPending ? 'Salvando...' : 'Salvar'}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)} disabled={isPending}>
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {(roles[pastoral.id] ?? []).length} função(ões) cadastrada(s)
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedId(expandedId === pastoral.id ? null : pastoral.id)}
                      >
                        {expandedId === pastoral.id ? 'Fechar' : 'Funções'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditingId(pastoral.id); setDeletingId(null); setExpandedId(null) }}>
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
                          <Input name="name" placeholder="Ex: Missal, Turíbulo, Cantor" required disabled={isPending} className="h-7 text-xs" />
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
