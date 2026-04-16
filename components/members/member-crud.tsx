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
  deleteMemberAction,
  addMemberPastoralAction,
  removeMemberPastoralAction,
  setMemberCoordinatorAction,
} from '@/features/members/actions'

interface MemberCrudProps {
  initialMembers: Member[]
  pastorals: Pastoral[]
  availabilities: Record<string, MemberAvailability[]>
  memberPastorals: Record<string, string[]> // memberId → pastoral_ids[]
}

type AvailabilityType = 'single_date' | 'period' | 'weekend' | 'weekday'

const AVAIL_TYPE_LABELS: Record<AvailabilityType, string> = {
  single_date: 'Data específica',
  period: 'Período',
  weekend: 'Final de semana',
  weekday: 'Durante a semana',
}

// Calcula start/end a partir de uma data de referência e tipo
function computeDates(refDate: string, type: AvailabilityType): { start: string; end: string } {
  if (!refDate) return { start: '', end: '' }
  const d = new Date(refDate + 'T12:00:00')
  if (type === 'single_date') return { start: refDate, end: refDate }
  if (type === 'period') return { start: refDate, end: refDate }
  if (type === 'weekend') {
    const day = d.getDay() // 0=Dom, 6=Sáb
    const sat = new Date(d)
    sat.setDate(d.getDate() - ((day + 1) % 7) + 6)
    const sun = new Date(sat)
    sun.setDate(sat.getDate() + 1)
    const fmt = (x: Date) => x.toISOString().slice(0, 10)
    return { start: fmt(sat), end: fmt(sun) }
  }
  if (type === 'weekday') {
    const day = d.getDay()
    const mon = new Date(d)
    mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    const fri = new Date(mon)
    fri.setDate(mon.getDate() + 4)
    const fmt = (x: Date) => x.toISOString().slice(0, 10)
    return { start: fmt(mon), end: fmt(fri) }
  }
  return { start: refDate, end: refDate }
}

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function AvailabilityForm({
  memberId,
  onSubmit,
  onCancel,
  isPending,
}: {
  memberId: string
  onSubmit: (formData: FormData) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [availType, setAvailType] = useState<AvailabilityType>('single_date')
  const [refDate, setRefDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const computed = computeDates(refDate, availType)
  const showEndDate = availType === 'period'
  const showRefDate = availType !== 'period'

  const startDate = showEndDate ? refDate : computed.start
  const finalEndDate = showEndDate ? endDate : computed.end

  return (
    <form
      action={onSubmit}
      className="space-y-3 bg-muted/40 rounded-lg p-3"
    >
      <input type="hidden" name="member_id" value={memberId} />
      <input type="hidden" name="availability_type" value={availType} />
      <input type="hidden" name="start_date" value={startDate} />
      <input type="hidden" name="end_date" value={finalEndDate} />

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Tipo de indisponibilidade */}
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">Tipo *</Label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(AVAIL_TYPE_LABELS) as AvailabilityType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setAvailType(t); setRefDate(''); setEndDate('') }}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  availType === t
                    ? 'bg-[#002045] text-white border-[#002045]'
                    : 'bg-background border-border hover:bg-muted'
                }`}
              >
                {AVAIL_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Data de referência (ou início para período) */}
        <div className="space-y-1">
          <Label className="text-xs">
            {availType === 'period' ? 'Data inicial *' : availType === 'single_date' ? 'Data *' : 'Semana de referência *'}
          </Label>
          <Input
            type="date"
            value={refDate}
            onChange={(e) => setRefDate(e.target.value)}
            required
            disabled={isPending}
            className="h-7 text-xs"
          />
        </div>

        {/* Data final apenas para período */}
        {showEndDate && (
          <div className="space-y-1">
            <Label className="text-xs">Data final *</Label>
            <Input
              type="date"
              value={endDate}
              min={refDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              disabled={isPending}
              className="h-7 text-xs"
            />
          </div>
        )}

        {/* Preview do período calculado para weekend/weekday */}
        {(availType === 'weekend' || availType === 'weekday') && refDate && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Período calculado</Label>
            <p className="text-xs text-[#002045] font-medium py-1">
              {formatDate(computed.start)} → {formatDate(computed.end)}
            </p>
          </div>
        )}

        <div className={`space-y-1 ${!showEndDate && availType !== 'weekend' && availType !== 'weekday' ? '' : ''}`}>
          <Label className="text-xs">Motivo</Label>
          <Input name="reason" placeholder="Opcional" disabled={isPending} className="h-7 text-xs" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          type="submit"
          className="bg-[#002045] text-white hover:bg-[#1a365d]"
          disabled={isPending || !startDate || !finalEndDate}
        >
          {isPending ? '...' : 'Salvar'}
        </Button>
        <Button size="sm" type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export function MemberCrud({ initialMembers, pastorals, availabilities: initialAvail, memberPastorals: initialMemberPastorals }: MemberCrudProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [avail, setAvail] = useState<Record<string, MemberAvailability[]>>(initialAvail)
  const [memberPastorals, setMemberPastorals] = useState<Record<string, string[]>>(initialMemberPastorals)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAvailForm, setShowAvailForm] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Estado do form de criação
  const [createSelectedPastorals, setCreateSelectedPastorals] = useState<string[]>([])
  const [createIsCoordinator, setCreateIsCoordinator] = useState(false)
  const [createCoordinatorPastoralId, setCreateCoordinatorPastoralId] = useState('')

  // Estado do form de edição (pastorais do membro)
  const [addPastoralMemberId, setAddPastoralMemberId] = useState<string | null>(null)
  const [addPastoralId, setAddPastoralId] = useState('')
  const [editCoordMemberId, setEditCoordMemberId] = useState<string | null>(null)
  const [editCoordPastoralId, setEditCoordPastoralId] = useState('')

  const visible = members.filter((m) => showInactive || m.is_active)

  const pastoralName = (id: string) => pastorals.find((p) => p.id === id)?.name ?? id

  const getMemberPastoralNames = (memberId: string) =>
    (memberPastorals[memberId] ?? []).map(pastoralName).join(', ') || '—'

  // Pastorais coordenadas por este membro
  const getPastoralCoordinatorOf = (memberId: string) =>
    pastorals.filter((p) => p.coordinator_id === memberId)

  function handleCreate(formData: FormData) {
    createSelectedPastorals.forEach((id) => formData.append('pastoral_ids', id))
    if (createIsCoordinator && createCoordinatorPastoralId) {
      formData.set('coordinator_pastoral_id', createCoordinatorPastoralId)
    }
    startTransition(async () => {
      try {
        await createMemberAction(formData)
        setShowCreate(false)
        setCreateSelectedPastorals([])
        setCreateIsCoordinator(false)
        setCreateCoordinatorPastoralId('')
        toast.success('Membro cadastrado.')
        const name = formData.get('full_name') as string
        const newId = crypto.randomUUID()
        setMembers((prev) => [...prev, {
          id: newId, parish_id: '', user_id: null,
          full_name: name,
          email: (formData.get('email') as string) || null,
          phone: (formData.get('phone') as string) || null,
          pastoral_id: createSelectedPastorals[0] ?? null,
          is_active: true, created_at: new Date().toISOString(),
        }])
        setMemberPastorals((prev) => ({ ...prev, [newId]: [...createSelectedPastorals] }))
        setAvail((prev) => ({ ...prev, [newId]: [] }))
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
        } : m))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar membro.')
      }
    })
  }

  function handleAddPastoral(memberId: string) {
    if (!addPastoralId) return
    const formData = new FormData()
    formData.set('member_id', memberId)
    formData.set('pastoral_id', addPastoralId)
    startTransition(async () => {
      try {
        await addMemberPastoralAction(formData)
        toast.success('Pastoral vinculada.')
        setMemberPastorals((prev) => ({
          ...prev,
          [memberId]: [...(prev[memberId] ?? []), addPastoralId],
        }))
        setAddPastoralId('')
        setAddPastoralMemberId(null)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao vincular pastoral.')
      }
    })
  }

  function handleRemovePastoral(memberId: string, pastoralId: string) {
    const formData = new FormData()
    formData.set('member_id', memberId)
    formData.set('pastoral_id', pastoralId)
    startTransition(async () => {
      try {
        await removeMemberPastoralAction(formData)
        toast.success('Pastoral removida.')
        setMemberPastorals((prev) => ({
          ...prev,
          [memberId]: (prev[memberId] ?? []).filter((id) => id !== pastoralId),
        }))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao remover pastoral.')
      }
    })
  }

  function handleSetCoordinator(memberId: string, pastoralId: string, replace: boolean) {
    const existingCoordinator = pastorals.find((p) => p.id === pastoralId)?.coordinator_id
    if (existingCoordinator && existingCoordinator !== memberId && !replace) {
      setEditCoordMemberId(memberId)
      setEditCoordPastoralId(pastoralId)
      return
    }
    const formData = new FormData()
    formData.set('pastoral_id', pastoralId)
    formData.set('member_id', memberId)
    startTransition(async () => {
      try {
        await setMemberCoordinatorAction(formData)
        toast.success('Coordenador definido.')
        setEditCoordMemberId(null)
        setEditCoordPastoralId('')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao definir coordenador.')
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
            availability_type: (formData.get('availability_type') as 'single_date' | 'period' | 'weekend' | 'weekday') ?? 'single_date',
            reason: (formData.get('reason') as string) || null,
            created_at: new Date().toISOString(),
          }],
        }))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao registrar indisponibilidade.')
      }
    })
  }

  function handleDeleteMember(memberId: string) {
    const formData = new FormData()
    formData.set('id', memberId)
    startTransition(async () => {
      try {
        await deleteMemberAction(formData)
        setDeletingId(null)
        toast.success('Membro excluído permanentemente.')
        setMembers((prev) => prev.filter((m) => m.id !== memberId))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao excluir membro.')
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
          </div>

          {/* Multi-pastoral */}
          <div className="space-y-2">
            <Label>Pastorais</Label>
            <div className="flex gap-2">
              <select
                value=""
                onChange={(e) => {
                  const v = e.target.value
                  if (v && !createSelectedPastorals.includes(v)) {
                    setCreateSelectedPastorals((prev) => [...prev, v])
                  }
                }}
                disabled={isPending}
                className="flex h-8 flex-1 rounded-lg border border-input bg-background px-2.5 text-sm"
              >
                <option value="">Adicionar pastoral...</option>
                {pastorals
                  .filter((p) => !createSelectedPastorals.includes(p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </select>
            </div>
            {createSelectedPastorals.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {createSelectedPastorals.map((id) => (
                  <span key={id} className="flex items-center gap-1 bg-[#002045]/8 border border-[#002045]/20 rounded-full px-3 py-0.5 text-xs text-[#002045]">
                    {pastoralName(id)}
                    <button type="button" onClick={() => {
                      setCreateSelectedPastorals((prev) => prev.filter((x) => x !== id))
                      if (createCoordinatorPastoralId === id) setCreateCoordinatorPastoralId('')
                    }} className="hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Coordenador */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create-is-coordinator"
                checked={createIsCoordinator}
                onChange={(e) => {
                  setCreateIsCoordinator(e.target.checked)
                  if (!e.target.checked) setCreateCoordinatorPastoralId('')
                }}
                disabled={isPending || createSelectedPastorals.length === 0}
                className="rounded"
              />
              <Label htmlFor="create-is-coordinator" className="cursor-pointer">
                É coordenador de pastoral?
              </Label>
            </div>
            {createIsCoordinator && createSelectedPastorals.length > 0 && (
              <div className="ml-6 space-y-1.5">
                <Label className="text-xs">Coordenador de qual pastoral?</Label>
                <select
                  value={createCoordinatorPastoralId}
                  onChange={(e) => setCreateCoordinatorPastoralId(e.target.value)}
                  disabled={isPending}
                  className="flex h-8 w-full max-w-xs rounded-lg border border-input bg-background px-2.5 text-sm"
                >
                  <option value="">Selecione...</option>
                  {createSelectedPastorals.map((id) => {
                    const pastoral = pastorals.find((p) => p.id === id)
                    const hasCoord = pastoral?.coordinator_id
                    return (
                      <option key={id} value={id}>
                        {pastoral?.name ?? id}{hasCoord ? ' (já tem coordenador)' : ''}
                      </option>
                    )
                  })}
                </select>
                {createCoordinatorPastoralId && pastorals.find((p) => p.id === createCoordinatorPastoralId)?.coordinator_id && (
                  <p className="text-xs text-amber-600">
                    Esta pastoral já possui coordenador. Ao salvar, o coordenador será substituído.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Cadastrar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              setShowCreate(false)
              setCreateSelectedPastorals([])
              setCreateIsCoordinator(false)
              setCreateCoordinatorPastoralId('')
            }} disabled={isPending}>
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
              {/* Confirmação de exclusão */}
              {deletingId === member.id ? (
                <div className="p-4 space-y-3">
                  <p className="text-sm font-medium text-[#002045]">Excluir <strong>{member.full_name}</strong> permanentemente?</p>
                  <p className="text-xs text-muted-foreground">
                    Esta ação não pode ser desfeita. Membros com histórico de escalas não podem ser excluídos — use desativar para preservar o histórico.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteMember(member.id)} disabled={isPending}>
                      {isPending ? 'Excluindo...' : 'Confirmar exclusão'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDeletingId(null)} disabled={isPending}>Cancelar</Button>
                  </div>
                </div>
              ) : editingId === member.id ? (
                /* Formulário de edição */
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
                /* Linha principal do card */
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-[#002045] truncate">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getMemberPastoralNames(member.id)}
                      {member.email && ` · ${member.email}`}
                      {!member.is_active && ' · Inativo'}
                    </p>
                    {/* Pastorais coordenadas */}
                    {getPastoralCoordinatorOf(member.id).length > 0 && (
                      <p className="text-xs text-[#002045]/70 mt-0.5">
                        Coordenador: {getPastoralCoordinatorOf(member.id).map((p) => p.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    <Button size="sm" variant="outline" onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}>
                      {expandedId === member.id ? 'Fechar' : 'Detalhes'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingId(member.id); setExpandedId(null) }}>
                      Editar
                    </Button>
                    <Button size="sm" variant={member.is_active ? 'destructive' : 'outline'} onClick={() => handleToggleStatus(member)} disabled={isPending}>
                      {member.is_active ? 'Desativar' : 'Reativar'}
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive hover:text-white border-destructive/40" onClick={() => { setDeletingId(member.id); setEditingId(null); setExpandedId(null) }} disabled={isPending}>
                      Excluir
                    </Button>
                  </div>
                </div>
              )}

              {/* Painel expandido: pastorais, coordenação, indisponibilidades */}
              {expandedId === member.id && (
                <div className="border-t px-4 pb-4 pt-3 space-y-5">

                  {/* Pastorais */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Pastorais</p>
                      {addPastoralMemberId !== member.id && (
                        <Button size="sm" variant="outline" onClick={() => { setAddPastoralMemberId(member.id); setAddPastoralId('') }}>
                          + Adicionar pastoral
                        </Button>
                      )}
                    </div>

                    {addPastoralMemberId === member.id && (
                      <div className="flex gap-2 items-center bg-muted/40 rounded-lg p-2">
                        <select
                          value={addPastoralId}
                          onChange={(e) => setAddPastoralId(e.target.value)}
                          disabled={isPending}
                          className="flex h-7 flex-1 rounded-lg border border-input bg-background px-2 text-xs"
                        >
                          <option value="">Selecione...</option>
                          {pastorals
                            .filter((p) => !(memberPastorals[member.id] ?? []).includes(p.id))
                            .map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <Button size="sm" type="button" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending || !addPastoralId} onClick={() => handleAddPastoral(member.id)}>
                          Adicionar
                        </Button>
                        <Button size="sm" type="button" variant="outline" onClick={() => setAddPastoralMemberId(null)} disabled={isPending}>
                          Cancelar
                        </Button>
                      </div>
                    )}

                    {(memberPastorals[member.id] ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">Sem pastoral vinculada.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(memberPastorals[member.id] ?? []).map((pid) => {
                          const pastoral = pastorals.find((p) => p.id === pid)
                          const isCoordinator = pastoral?.coordinator_id === member.id
                          return (
                            <div key={pid} className="flex items-center gap-1 bg-[#002045]/8 border border-[#002045]/20 rounded-full px-3 py-1 text-xs">
                              <span className="text-[#002045] font-medium">{pastoral?.name ?? pid}</span>
                              {isCoordinator && <span className="text-[#002045]/60 text-[10px]">(coord.)</span>}
                              <button type="button" onClick={() => handleRemovePastoral(member.id, pid)} disabled={isPending} className="text-muted-foreground hover:text-destructive ml-0.5">×</button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Coordenação */}
                  {(memberPastorals[member.id] ?? []).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Coordenação</p>
                      <div className="flex flex-wrap gap-2">
                        {(memberPastorals[member.id] ?? []).map((pid) => {
                          const pastoral = pastorals.find((p) => p.id === pid)
                          const isCoord = pastoral?.coordinator_id === member.id
                          const hasOtherCoord = pastoral?.coordinator_id && pastoral.coordinator_id !== member.id

                          // Confirmação de substituição de coordenador
                          if (editCoordMemberId === member.id && editCoordPastoralId === pid) {
                            return (
                              <div key={pid} className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs space-y-1.5 w-full max-w-sm">
                                <p className="font-medium text-amber-800">
                                  <strong>{pastoral?.name}</strong> já tem coordenador ({pastoral?.coordinator_name ?? 'outro membro'}).
                                </p>
                                <p className="text-amber-700">Deseja substituir?</p>
                                <div className="flex gap-2">
                                  <Button size="sm" className="h-6 text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={() => handleSetCoordinator(member.id, pid, true)} disabled={isPending}>
                                    Substituir
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => { setEditCoordMemberId(null); setEditCoordPastoralId('') }} disabled={isPending}>
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            )
                          }

                          return (
                            <div key={pid} className="flex items-center gap-1.5 text-xs">
                              <span className="text-muted-foreground">{pastoral?.name}:</span>
                              {isCoord ? (
                                <span className="text-[#002045] font-medium">Coordenador</span>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-xs px-2"
                                  onClick={() => handleSetCoordinator(member.id, pid, false)}
                                  disabled={isPending}
                                >
                                  {hasOtherCoord ? 'Tornar coordenador (substituir)' : 'Tornar coordenador'}
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Indisponibilidades */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Indisponibilidades</p>
                      {showAvailForm !== member.id && (
                        <Button size="sm" variant="outline" onClick={() => setShowAvailForm(member.id)}>
                          + Adicionar
                        </Button>
                      )}
                    </div>

                    {showAvailForm === member.id && (
                      <AvailabilityForm
                        memberId={member.id}
                        onSubmit={handleAddAvail}
                        onCancel={() => setShowAvailForm(null)}
                        isPending={isPending}
                      />
                    )}

                    {(avail[member.id] ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nenhuma indisponibilidade registrada.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {(avail[member.id] ?? []).map((a) => (
                          <div key={a.id} className="flex items-center justify-between text-xs bg-muted/30 rounded px-3 py-1.5">
                            <span>
                              <span className="text-muted-foreground mr-1.5">
                                {AVAIL_TYPE_LABELS[a.availability_type] ?? a.availability_type}:
                              </span>
                              {a.start_date === a.end_date
                                ? formatDate(a.start_date)
                                : `${formatDate(a.start_date)} → ${formatDate(a.end_date)}`}
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
