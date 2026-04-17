'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
  updateAvailabilityAction,
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
  memberPastorals: Record<string, string[]>
}

type AvailabilityType = 'single_date' | 'period' | 'weekend' | 'weekday'

const AVAIL_TYPE_LABELS: Record<AvailabilityType, string> = {
  single_date: 'Data específica',
  period:      'Período',
  weekend:     'Fins de semana',
  weekday:     'Durante a semana',
}

interface AvailEntry {
  type: AvailabilityType
  start_date: string
  end_date: string
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10)
}

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getWeekendsOfMonth(yearMonth: string): AvailEntry[] {
  const [y, m] = yearMonth.split('-').map(Number)
  const result: AvailEntry[] = []
  const d = new Date(y, m - 1, 1)
  while (d.getMonth() === m - 1) {
    if (d.getDay() === 6) {
      const sat = fmt(d)
      const sun = new Date(d)
      sun.setDate(d.getDate() + 1)
      result.push({ type: 'weekend', start_date: sat, end_date: fmt(sun) })
    }
    d.setDate(d.getDate() + 1)
  }
  return result
}

function getWeekdaysOfMonth(yearMonth: string): AvailEntry[] {
  const [y, m] = yearMonth.split('-').map(Number)
  const result: AvailEntry[] = []
  const d = new Date(y, m - 1, 1)
  let weekStart: Date | null = null
  while (d.getMonth() === m - 1) {
    const day = d.getDay()
    if (day === 1) weekStart = new Date(d)
    if (day === 5 && weekStart) {
      result.push({ type: 'weekday', start_date: fmt(weekStart), end_date: fmt(d) })
      weekStart = null
    }
    if (day === 0 && weekStart) weekStart = null
    d.setDate(d.getDate() + 1)
  }
  // Semana incompleta no final do mês
  if (weekStart) {
    const last = new Date(y, m - 1, 1)
    last.setMonth(last.getMonth() + 1)
    last.setDate(0)
    result.push({ type: 'weekday', start_date: fmt(weekStart), end_date: fmt(last) })
  }
  return result
}

// ─── Formulário de Indisponibilidade ─────────────────────────────────────────

function AvailabilityForm({
  memberId,
  onSubmit,
  onCancel,
  isPending,
}: {
  memberId: string
  onSubmit: (entries: AvailEntry[], reason: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [availType, setAvailType] = useState<AvailabilityType>('single_date')
  const [reason, setReason] = useState('')

  // single_date
  const [pendingDates, setPendingDates] = useState<string[]>([])
  const [inputDate, setInputDate] = useState('')

  // period
  const [pendingPeriods, setPendingPeriods] = useState<Array<{start: string; end: string}>>([])
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  // weekend / weekday
  const [refMonth, setRefMonth] = useState('')

  const computedEntries: AvailEntry[] = (() => {
    if (availType === 'weekend' && refMonth) return getWeekendsOfMonth(refMonth)
    if (availType === 'weekday' && refMonth) return getWeekdaysOfMonth(refMonth)
    return []
  })()

  function addDate() {
    if (!inputDate || pendingDates.includes(inputDate)) return
    setPendingDates((p) => [...p, inputDate].sort())
    setInputDate('')
  }

  function addPeriod() {
    if (!periodStart || !periodEnd || periodEnd < periodStart) return
    setPendingPeriods((p) => [...p, { start: periodStart, end: periodEnd }])
    setPeriodStart('')
    setPeriodEnd('')
  }

  function handleSubmit() {
    let entries: AvailEntry[] = []
    if (availType === 'single_date') entries = pendingDates.map((d) => ({ type: 'single_date', start_date: d, end_date: d }))
    if (availType === 'period') entries = pendingPeriods.map((p) => ({ type: 'period', start_date: p.start, end_date: p.end }))
    if (availType === 'weekend' || availType === 'weekday') entries = computedEntries
    if (entries.length === 0) { toast.error('Adicione ao menos uma data.'); return }
    onSubmit(entries, reason)
  }

  return (
    <div className="space-y-4 bg-muted/40 rounded-lg p-3">
      {/* Tipo */}
      <div className="space-y-1.5">
        <Label className="text-xs">Tipo *</Label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(AVAIL_TYPE_LABELS) as AvailabilityType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setAvailType(t)
                setPendingDates([]); setInputDate('')
                setPendingPeriods([]); setPeriodStart(''); setPeriodEnd('')
                setRefMonth('')
              }}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                availType === t ? 'bg-[#002045] text-white border-[#002045]' : 'bg-background border-border hover:bg-muted'
              }`}
            >
              {AVAIL_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Data específica */}
      {availType === 'single_date' && (
        <div className="space-y-2">
          <Label className="text-xs">Datas *</Label>
          <div className="flex gap-2">
            <Input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} className="h-7 text-xs flex-1" disabled={isPending} />
            <Button size="sm" type="button" variant="outline" onClick={addDate} disabled={isPending || !inputDate} className="h-7 text-xs px-2">
              + Adicionar
            </Button>
          </div>
          {pendingDates.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pendingDates.map((d) => (
                <span key={d} className="flex items-center gap-1 bg-[#002045]/8 border border-[#002045]/20 rounded-full px-2.5 py-0.5 text-xs text-[#002045]">
                  {formatDate(d)}
                  <button type="button" onClick={() => setPendingDates((p) => p.filter((x) => x !== d))} className="hover:text-destructive">×</button>
                </span>
              ))}
            </div>
          )}
          {pendingDates.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma data adicionada.</p>}
        </div>
      )}

      {/* Período */}
      {availType === 'period' && (
        <div className="space-y-2">
          <Label className="text-xs">Períodos *</Label>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="h-7 text-xs flex-1 min-w-0" disabled={isPending} placeholder="De" />
              <span className="text-xs text-muted-foreground">→</span>
              <Input type="date" value={periodEnd} min={periodStart} onChange={(e) => setPeriodEnd(e.target.value)} className="h-7 text-xs flex-1 min-w-0" disabled={isPending} placeholder="Até" />
            </div>
            <Button size="sm" type="button" variant="outline" onClick={addPeriod} disabled={isPending || !periodStart || !periodEnd || periodEnd < periodStart} className="h-7 text-xs px-2">
              + Adicionar
            </Button>
          </div>
          {pendingPeriods.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pendingPeriods.map((p, i) => (
                <span key={i} className="flex items-center gap-1 bg-[#002045]/8 border border-[#002045]/20 rounded-full px-2.5 py-0.5 text-xs text-[#002045]">
                  {formatDate(p.start)} → {formatDate(p.end)}
                  <button type="button" onClick={() => setPendingPeriods((prev) => prev.filter((_, j) => j !== i))} className="hover:text-destructive">×</button>
                </span>
              ))}
            </div>
          )}
          {pendingPeriods.length === 0 && <p className="text-xs text-muted-foreground">Nenhum período adicionado.</p>}
        </div>
      )}

      {/* Fins de semana / Durante a semana (por mês) */}
      {(availType === 'weekend' || availType === 'weekday') && (
        <div className="space-y-2">
          <Label className="text-xs">Mês de referência *</Label>
          <Input
            type="month"
            value={refMonth}
            onChange={(e) => setRefMonth(e.target.value)}
            className="h-7 text-xs w-40"
            disabled={isPending}
          />
          {refMonth && computedEntries.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {availType === 'weekend' ? 'Fins de semana' : 'Semanas'} do mês ({computedEntries.length} período{computedEntries.length !== 1 ? 's' : ''}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {computedEntries.map((e, i) => (
                  <span key={i} className="bg-[#002045]/8 border border-[#002045]/20 rounded-full px-2.5 py-0.5 text-xs text-[#002045]">
                    {e.start_date === e.end_date ? formatDate(e.start_date) : `${formatDate(e.start_date)} → ${formatDate(e.end_date)}`}
                  </span>
                ))}
              </div>
            </div>
          )}
          {refMonth && computedEntries.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhum período encontrado neste mês.</p>
          )}
        </div>
      )}

      {/* Motivo */}
      <div className="space-y-1">
        <Label className="text-xs">Motivo</Label>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Opcional" disabled={isPending} className="h-7 text-xs" />
      </div>

      <div className="flex gap-2">
        <Button size="sm" type="button" className="bg-[#002045] text-white hover:bg-[#1a365d]" onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button size="sm" type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

// ─── Formulário de Edição de Indisponibilidade ────────────────────────────────

function AvailabilityEditForm({
  availability,
  onSave,
  onCancel,
  isPending,
}: {
  availability: MemberAvailability
  onSave: (id: string, entry: AvailEntry, reason: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [startDate, setStartDate] = useState(availability.start_date)
  const [endDate, setEndDate] = useState(availability.end_date)
  const [reason, setReason] = useState(availability.reason ?? '')
  const type = availability.availability_type

  function handleSave() {
    if (!startDate || !endDate) return
    onSave(availability.id, { type, start_date: startDate, end_date: endDate }, reason)
  }

  return (
    <div className="flex flex-wrap items-end gap-2 bg-muted/40 rounded-lg p-2">
      <div className="space-y-0.5">
        <Label className="text-[10px]">Início</Label>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-6 text-xs w-32" disabled={isPending} />
      </div>
      {type !== 'single_date' && (
        <div className="space-y-0.5">
          <Label className="text-[10px]">Fim</Label>
          <Input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="h-6 text-xs w-32" disabled={isPending} />
        </div>
      )}
      <div className="space-y-0.5 flex-1 min-w-24">
        <Label className="text-[10px]">Motivo</Label>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Opcional" className="h-6 text-xs" disabled={isPending} />
      </div>
      <Button size="sm" type="button" className="h-6 text-xs bg-[#002045] text-white hover:bg-[#1a365d] px-2" onClick={handleSave} disabled={isPending}>
        Salvar
      </Button>
      <Button size="sm" type="button" variant="outline" className="h-6 text-xs px-2" onClick={onCancel} disabled={isPending}>
        Cancelar
      </Button>
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function MemberCrud({ initialMembers, pastorals, availabilities: initialAvail, memberPastorals: initialMemberPastorals }: MemberCrudProps) {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [avail, setAvail] = useState<Record<string, MemberAvailability[]>>(initialAvail)
  const [memberPastorals, setMemberPastorals] = useState<Record<string, string[]>>(initialMemberPastorals)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAvailForm, setShowAvailForm] = useState<string | null>(null)
  const [editingAvailId, setEditingAvailId] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [createSelectedPastorals, setCreateSelectedPastorals] = useState<string[]>([])
  const [createIsCoordinator, setCreateIsCoordinator] = useState(false)
  const [createCoordinatorPastoralId, setCreateCoordinatorPastoralId] = useState('')

  const [addPastoralMemberId, setAddPastoralMemberId] = useState<string | null>(null)
  const [addPastoralId, setAddPastoralId] = useState('')
  const [editCoordMemberId, setEditCoordMemberId] = useState<string | null>(null)
  const [editCoordPastoralId, setEditCoordPastoralId] = useState('')

  const activeCount = members.filter((m) => m.is_active).length
  const inactiveCount = members.filter((m) => !m.is_active).length
  const visible = members.filter((m) => showInactive || m.is_active)

  const pastoralName = (id: string) => pastorals.find((p) => p.id === id)?.name ?? id
  const getMemberPastoralNames = (memberId: string) =>
    (memberPastorals[memberId] ?? []).map(pastoralName).join(', ') || '—'
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
        router.refresh()
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
        setMemberPastorals((prev) => ({ ...prev, [memberId]: [...(prev[memberId] ?? []), addPastoralId] }))
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
        setMemberPastorals((prev) => ({ ...prev, [memberId]: (prev[memberId] ?? []).filter((id) => id !== pastoralId) }))
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
        router.refresh()
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
        const nowActive = !member.is_active
        setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, is_active: nowActive } : m))
        toast.success(member.is_active ? 'Membro desativado.' : 'Membro reativado.')
        if (member.is_active) {
          // Membro foi desativado — mostra dica para encontrá-lo novamente
          toast.info('Para reativar, clique em "Ver inativos".', { duration: 5000 })
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro.')
      }
    })
  }

  function handleAddAvail(entries: AvailEntry[], reason: string, memberId: string) {
    startTransition(async () => {
      try {
        const created: MemberAvailability[] = []
        for (const entry of entries) {
          const fd = new FormData()
          fd.set('member_id', memberId)
          fd.set('availability_type', entry.type)
          fd.set('start_date', entry.start_date)
          fd.set('end_date', entry.end_date)
          if (reason) fd.set('reason', reason)
          await createAvailabilityAction(fd)
          created.push({
            id: crypto.randomUUID(),
            member_id: memberId, parish_id: '',
            start_date: entry.start_date,
            end_date: entry.end_date,
            availability_type: entry.type,
            reason: reason || null,
            created_at: new Date().toISOString(),
          })
        }
        setAvail((prev) => ({ ...prev, [memberId]: [...(prev[memberId] ?? []), ...created] }))
        setShowAvailForm(null)
        toast.success(`${entries.length} indisponibilidade(s) registrada(s).`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao registrar indisponibilidade.')
      }
    })
  }

  function handleEditAvail(id: string, entry: AvailEntry, reason: string, memberId: string) {
    startTransition(async () => {
      try {
        const fd = new FormData()
        fd.set('id', id)
        fd.set('availability_type', entry.type)
        fd.set('start_date', entry.start_date)
        fd.set('end_date', entry.end_date)
        if (reason) fd.set('reason', reason)
        await updateAvailabilityAction(fd)
        setAvail((prev) => ({
          ...prev,
          [memberId]: (prev[memberId] ?? []).map((a) => a.id === id ? {
            ...a,
            start_date: entry.start_date,
            end_date: entry.end_date,
            reason: reason || null,
          } : a),
        }))
        setEditingAvailId(null)
        toast.success('Indisponibilidade atualizada.')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar indisponibilidade.')
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
        setAvail((prev) => ({ ...prev, [memberId]: (prev[memberId] ?? []).filter((a) => a.id !== availId) }))
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
          <p className="text-sm text-muted-foreground mt-1">{activeCount} ativo(s){inactiveCount > 0 ? ` · ${inactiveCount} inativo(s)` : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
            className={inactiveCount > 0 ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : ''}
          >
            {showInactive ? 'Ocultar inativos' : `Ver inativos${inactiveCount > 0 ? ` (${inactiveCount})` : ''}`}
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
              <Input id="create-name" name="full_name" placeholder="Nome completo do membro" required disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-email">E-mail</Label>
              <Input id="create-email" name="email" type="email" placeholder="email@exemplo.com" disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-phone">Telefone</Label>
              <Input id="create-phone" name="phone" placeholder="(00) 00000-0000" disabled={isPending} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Pastorais</Label>
            <div className="flex gap-2">
              <select
                value=""
                onChange={(e) => {
                  const v = e.target.value
                  if (v && !createSelectedPastorals.includes(v)) setCreateSelectedPastorals((prev) => [...prev, v])
                }}
                disabled={isPending}
                className="flex h-8 flex-1 rounded-lg border border-input bg-background px-2.5 text-sm"
              >
                <option value="">Adicionar pastoral...</option>
                {pastorals.filter((p) => !createSelectedPastorals.includes(p.id)).map((p) => (
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

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create-is-coordinator"
                checked={createIsCoordinator}
                onChange={(e) => { setCreateIsCoordinator(e.target.checked); if (!e.target.checked) setCreateCoordinatorPastoralId('') }}
                disabled={isPending || createSelectedPastorals.length === 0}
                className="rounded"
              />
              <Label htmlFor="create-is-coordinator" className="cursor-pointer">É coordenador de pastoral?</Label>
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
                    return (
                      <option key={id} value={id}>
                        {pastoral?.name ?? id}{pastoral?.coordinator_id ? ' (já tem coordenador)' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Cadastrar'}
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              setShowCreate(false); setCreateSelectedPastorals([]); setCreateIsCoordinator(false); setCreateCoordinatorPastoralId('')
            }} disabled={isPending}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Lista */}
      {visible.length === 0 && !showCreate ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {!showInactive && inactiveCount > 0
              ? `Nenhum membro ativo. Há ${inactiveCount} membro(s) inativo(s) — clique em "Ver inativos" para visualizá-los.`
              : 'Nenhum membro cadastrado.'}
          </p>
          {showInactive && inactiveCount === 0 && (
            <Button variant="outline" className="mt-4" onClick={() => setShowCreate(true)}>
              Cadastrar primeiro membro
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((member) => (
            <div key={member.id} className={`rounded-xl border bg-card shadow-sm ${!member.is_active ? 'opacity-60 border-amber-200' : ''}`}>
              {/* Confirmação de exclusão */}
              {deletingId === member.id ? (
                <div className="p-4 space-y-3">
                  <p className="text-sm font-medium text-[#002045]">Excluir <strong>{member.full_name}</strong> permanentemente?</p>
                  <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita. Membros com histórico de escalas não podem ser excluídos — use desativar para preservar o histórico.</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteMember(member.id)} disabled={isPending}>
                      {isPending ? 'Excluindo...' : 'Confirmar exclusão'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDeletingId(null)} disabled={isPending}>Cancelar</Button>
                  </div>
                </div>
              ) : editingId === member.id ? (
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
                    <Button size="sm" type="button" variant="outline" onClick={() => setEditingId(null)} disabled={isPending}>Cancelar</Button>
                  </div>
                </form>
              ) : (
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-[#002045] truncate">{member.full_name}</p>
                      {!member.is_active && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getMemberPastoralNames(member.id)}
                      {member.email && ` · ${member.email}`}
                    </p>
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
                    <Button
                      size="sm"
                      variant={member.is_active ? 'destructive' : 'outline'}
                      className={!member.is_active ? 'border-green-500 text-green-700 hover:bg-green-50' : ''}
                      onClick={() => handleToggleStatus(member)}
                      disabled={isPending}
                    >
                      {member.is_active ? 'Desativar' : 'Reativar'}
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive hover:text-white border-destructive/40" onClick={() => { setDeletingId(member.id); setEditingId(null); setExpandedId(null) }} disabled={isPending}>
                      Excluir
                    </Button>
                  </div>
                </div>
              )}

              {/* Painel expandido */}
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
                          <option value="">Selecione a pastoral...</option>
                          {pastorals.filter((p) => !(memberPastorals[member.id] ?? []).includes(p.id)).map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <Button size="sm" type="button" className="bg-[#002045] text-white hover:bg-[#1a365d]" disabled={isPending || !addPastoralId} onClick={() => handleAddPastoral(member.id)}>
                          Adicionar
                        </Button>
                        <Button size="sm" type="button" variant="outline" onClick={() => setAddPastoralMemberId(null)} disabled={isPending}>Cancelar</Button>
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

                          if (editCoordMemberId === member.id && editCoordPastoralId === pid) {
                            return (
                              <div key={pid} className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs space-y-1.5 w-full max-w-sm">
                                <p className="font-medium text-amber-800">
                                  <strong>{pastoral?.name}</strong> já tem coordenador ({pastoral?.coordinator_name ?? 'outro membro'}).
                                </p>
                                <p className="text-amber-700">Deseja substituir?</p>
                                <div className="flex gap-2">
                                  <Button size="sm" className="h-6 text-xs bg-amber-600 hover:bg-amber-700 text-white" type="button" onClick={() => handleSetCoordinator(member.id, pid, true)} disabled={isPending}>
                                    Substituir
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-6 text-xs" type="button" onClick={() => { setEditCoordMemberId(null); setEditCoordPastoralId('') }} disabled={isPending}>
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
                                  type="button"
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
                        <Button size="sm" variant="outline" onClick={() => { setShowAvailForm(member.id); setEditingAvailId(null) }}>
                          + Adicionar
                        </Button>
                      )}
                    </div>

                    {showAvailForm === member.id && (
                      <AvailabilityForm
                        memberId={member.id}
                        onSubmit={(entries, reason) => handleAddAvail(entries, reason, member.id)}
                        onCancel={() => setShowAvailForm(null)}
                        isPending={isPending}
                      />
                    )}

                    {(avail[member.id] ?? []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nenhuma indisponibilidade registrada.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {(avail[member.id] ?? []).map((a) => (
                          <div key={a.id}>
                            {editingAvailId === a.id ? (
                              <AvailabilityEditForm
                                availability={a}
                                onSave={(id, entry, reason) => handleEditAvail(id, entry, reason, member.id)}
                                onCancel={() => setEditingAvailId(null)}
                                isPending={isPending}
                              />
                            ) : (
                              <div className="flex items-center justify-between text-xs bg-muted/30 rounded px-3 py-1.5 gap-2">
                                <span className="flex-1 min-w-0">
                                  <span className="text-muted-foreground mr-1.5">
                                    {AVAIL_TYPE_LABELS[a.availability_type] ?? a.availability_type}:
                                  </span>
                                  {a.start_date === a.end_date
                                    ? formatDate(a.start_date)
                                    : `${formatDate(a.start_date)} → ${formatDate(a.end_date)}`}
                                  {a.reason && <span className="text-muted-foreground ml-1">({a.reason})</span>}
                                </span>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-xs px-2"
                                    type="button"
                                    onClick={() => { setEditingAvailId(a.id); setShowAvailForm(null) }}
                                    disabled={isPending}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-6 w-6 p-0"
                                    type="button"
                                    onClick={() => handleDeleteAvail(a.id, member.id)}
                                    disabled={isPending}
                                  >
                                    ×
                                  </Button>
                                </div>
                              </div>
                            )}
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
