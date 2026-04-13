'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Member, MemberAvailability } from '@/lib/mcp/member.mcp'
import type { Pastoral } from '@/lib/mcp/pastoral.mcp'
import {
  createMemberAction,
  updateMemberAction,
  toggleMemberStatusAction,
  createAvailabilityAction,
  deleteAvailabilityAction,
} from '@/features/members/actions'

interface MemberCrudProps {
  initialMembers: Member[]
  pastorals: Pastoral[]
  availabilities: Record<string, MemberAvailability[]>
}

export function MemberCrud({ initialMembers, pastorals, availabilities: initialAvail }: MemberCrudProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [avail, setAvail] = useState<Record<string, MemberAvailability[]>>(initialAvail)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAvailForm, setShowAvailForm] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [isPending, startTransition] = useTransition()

  const visible = members.filter((m) => showInactive || m.is_active)

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      try {
        await createMemberAction(formData)
        setShowCreate(false)
        toast.success('Membro cadastrado.')
        // Refresh optimístico simplificado
        const name = formData.get('full_name') as string
        setMembers((prev) => [...prev, {
          id: crypto.randomUUID(), parish_id: '', user_id: null,
          full_name: name, email: null, phone: null,
          pastoral_id: (formData.get('pastoral_id') as string) || null,
          is_active: true, created_at: new Date().toISOString(),
        }])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao cadastrar membro.')
      }
    })
  }

  function handleUpdate(formData: FormData) {
    const id = formData.get('id') as string
    startTransition(async () => {
      try {
        await updateMemberAction(formData)
        setEditingId(null)
        toast.success('Membro atualizado.')
        setMembers((prev) => prev.map((m) => m.id === id ? {
          ...m,
          full_name: formData.get('full_name') as string,
          email: (formData.get('email') as string) || null,
          phone: (formData.get('phone') as string) || null,
          pastoral_id: (formData.get('pastoral_id') as string) || null,
        } : m))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar membro.')
      }
    })
  }

  function handleToggleStatus(member: Member) {
    const formData = new FormData()
    formData.set('id', member.id)
    formData.set('is_active', String(member.is_active))
    startTransition(async () => {
      try {
        await toggleMemberStatusAction(formData)
        setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, is_active: !m.is_active } : m))
        toast.success(member.is_active ? 'Membro desativado.' : 'Membro reativado.')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro.')
      }
    })
  }

  function handleAddAvail(formData: FormData) {
    const memberId = formData.get('member_id') as string
    startTransition(async () => {
      try {
        await createAvailabilityAction(formData)
        setShowAvailForm(null)
        toast.success('Indisponibilidade registrada.')
        setAvail((prev) => ({
          ...prev,
          [memberId]: [...(prev[memberId] ?? []), {
            id: crypto.randomUUID(),
            member_id: memberId, parish_id: '',
            start_date: formData.get('start_date') as string,
            end_date: formData.get('end_date') as string,
            reason: (formData.get('reason') as string) || null,
            created_at: new Date().toISOString(),
          }],
        }))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao registrar indisponibilidade.')
      }
    })
  }

  function handleDeleteAvail(availId: string, memberId: string) {
    const formData = new FormData()
    formData.set('id', availId)
    startTransition(async () => {
      try {
        await deleteAvailabilityAction(formData)
        toast.success('Indisponibilidade removida.')
        setAvail((prev) => ({
          ...prev,
          [memberId]: (prev[memberId] ?? []).filter((a) => a.id !== availId),
        }))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro.')
      }
    })
  }

  const pastoralName = (id: string | null) =>
    id ? (pastorals.find((p) => p.id === id)?.name ?? '—') : '—'

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#002045]">Membros</h1>
          <p className="text-sm text-muted-foreground mt-1">{visible.length} membro(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowInactive(!showInactive)}>
            {showInactive ? 'Ocultar inativos' : 'Ver inativos'}
          </Button>
          {!showCreate && (
            <Button className="bg-[#002045] text-white hover:bg-[#1a365d]" onClick={() => setShowCreate(true)}>
              + Novo Membro
            </Button>
          )}
        </div>
      </div>

      {/* Formulário de criação */}
      {showCreate && (
        <form action={handleCreate} className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold text-[#002045]">Novo Membro</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-name">Nome completo *</Label>
              <Input id="create-name" name="full_name" placeholder="Maria Aparecida" required disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-email">E-mail</Label>
              <Input id="create-email" name="email" type="email" placeholder="maria@email.com" disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-phone">Telefone</Label>
              <Input id="create-phone" name="phone" placeholder="(11) 99999-9999" disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-pastoral">Pastoral</Label>
              <select
                id="create-pastoral"
                name="pastoral_id"
                disabled={isPending}
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
              >
                <option value="">Sem pastoral</option>
                {pastorals.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Cadastrar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)} disabled={isPending}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Lista */}
      {visible.length === 0 && !showCreate ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">Nenhum membro cadastrado.</p>
          <Button variant="outline" className="mt-4" onClick={() => setShowCreate(true)}>
            Cadastrar primeiro membro
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((member) => (
            <div key={member.id} className={`rounded-xl border bg-card shadow-sm ${!member.is_active ? 'opacity-60' : ''}`}>
              {/* Linha principal */}
              {editingId === member.id ? (
                <form action={handleUpdate} className="p-5 space-y-4">
                  <input type="hidden" name="id" value={member.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Nome *</Label>
                      <Input name="full_name" defaultValue={member.full_name} required disabled={isPending} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>E-mail</Label>
                      <Input name="email" type="email" defaultValue={member.email ?? ''} disabled={isPending} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Telefone</Label>
                      <Input name="phone" defaultValue={member.phone ?? ''} disabled={isPending} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Pastoral</Label>
                      <select
                        name="pastoral_id"
                        defaultValue={member.pastoral_id ?? ''}
                        disabled={isPending}
                        className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
                      >
                        <option value="">Sem pastoral</option>
                        {pastorals.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
                      {isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button size="sm" type="button" variant="outline" onClick={() => setEditingId(null)} disabled={isPending}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-[#002045] truncate">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pastoralName(member.pastoral_id)}
                      {member.email && ` · ${member.email}`}
                      {!member.is_active && ' · Inativo'}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    <Button size="sm" variant="outline" onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}>
                      {expandedId === member.id ? 'Fechar' : 'Indisponibilidades'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingId(member.id); setExpandedId(null) }}>
                      Editar
                    </Button>
                    <Button size="sm" variant={member.is_active ? 'destructive' : 'outline'} onClick={() => handleToggleStatus(member)} disabled={isPending}>
                      {member.is_active ? 'Desativar' : 'Reativar'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Seção de indisponibilidades */}
              {expandedId === member.id && (
                <div className="border-t px-4 pb-4 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">Indisponibilidades</p>
                    {showAvailForm !== member.id && (
                      <Button size="sm" variant="outline" onClick={() => setShowAvailForm(member.id)}>
                        + Adicionar
                      </Button>
                    )}
                  </div>

                  {showAvailForm === member.id && (
                    <form action={handleAddAvail} className="space-y-3 bg-muted/40 rounded-lg p-3">
                      <input type="hidden" name="member_id" value={member.id} />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Data inicial *</Label>
                          <Input type="date" name="start_date" required disabled={isPending} className="h-7 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Data final *</Label>
                          <Input type="date" name="end_date" required disabled={isPending} className="h-7 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Motivo</Label>
                          <Input name="reason" placeholder="Opcional" disabled={isPending} className="h-7 text-xs" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="xs" type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
                          Salvar
                        </Button>
                        <Button size="xs" type="button" variant="outline" onClick={() => setShowAvailForm(null)} disabled={isPending}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  )}

                  {(avail[member.id] ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhuma indisponibilidade registrada.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {(avail[member.id] ?? []).map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-xs bg-muted/30 rounded px-3 py-1.5">
                          <span>
                            {a.start_date} → {a.end_date}
                            {a.reason && <span className="text-muted-foreground ml-1">({a.reason})</span>}
                          </span>
                          <Button size="icon-xs" variant="destructive" onClick={() => handleDeleteAvail(a.id, member.id)} disabled={isPending}>
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
