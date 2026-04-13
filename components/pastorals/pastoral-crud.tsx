'use client'

// Componente client para CRUD de pastorais — create, edit inline, delete com confirmação
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Pastoral } from '@/lib/mcp/pastoral.mcp'
import {
  createPastoralAction,
  updatePastoralAction,
  deletePastoralAction,
} from '@/features/pastorals/actions'

interface PastoralCrudProps {
  initialPastorals: Pastoral[]
}

export function PastoralCrud({ initialPastorals }: PastoralCrudProps) {
  const [pastorals, setPastorals] = useState<Pastoral[]>(initialPastorals)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      try {
        await createPastoralAction(formData)
        setShowCreateForm(false)
        toast.success('Pastoral criada com sucesso.')
        // Atualiza a lista localmente até o revalidatePath sincronizar
        const name = formData.get('name') as string
        const description = (formData.get('description') as string) || null
        setPastorals((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            parish_id: '',
            name,
            description,
            created_at: new Date().toISOString(),
          },
        ])
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
        setPastorals((prev) =>
          prev.map((p) => (p.id === id ? { ...p, name, description } : p))
        )
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

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#002045]">Pastorais</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pastorals.length === 0
              ? 'Nenhuma pastoral cadastrada.'
              : `${pastorals.length} pastoral${pastorals.length !== 1 ? 'is' : ''}`}
          </p>
        </div>
        {!showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-[#002045] text-white hover:bg-[#1a365d]"
          >
            + Nova Pastoral
          </Button>
        )}
      </div>

      {/* Formulário de criação */}
      {showCreateForm && (
        <form
          action={handleCreate}
          className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm"
        >
          <h2 className="font-semibold text-[#002045]">Nova Pastoral</h2>
          <div className="space-y-2">
            <Label htmlFor="new-name">Nome *</Label>
            <Input
              id="new-name"
              name="name"
              placeholder="Ex: Pastoral da Juventude"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-description">Descrição</Label>
            <Input
              id="new-description"
              name="description"
              placeholder="Breve descrição da pastoral"
              disabled={isPending}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              className="bg-[#002045] text-white hover:bg-[#1a365d]"
              disabled={isPending}
            >
              {isPending ? 'Salvando...' : 'Criar Pastoral'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateForm(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Lista de pastorais */}
      {pastorals.length === 0 && !showCreateForm ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhuma pastoral cadastrada ainda.
          </p>
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="outline"
            className="mt-4"
          >
            Criar primeira pastoral
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pastorals.map((pastoral) =>
            editingId === pastoral.id ? (
              /* Card em modo de edição */
              <form
                key={pastoral.id}
                action={handleUpdate}
                className="rounded-xl border border-[#002045]/30 bg-card p-5 space-y-3 shadow-sm"
              >
                <input type="hidden" name="id" value={pastoral.id} />
                <div className="space-y-1.5">
                  <Label htmlFor={`edit-name-${pastoral.id}`}>Nome *</Label>
                  <Input
                    id={`edit-name-${pastoral.id}`}
                    name="name"
                    defaultValue={pastoral.name}
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`edit-desc-${pastoral.id}`}>Descrição</Label>
                  <Input
                    id={`edit-desc-${pastoral.id}`}
                    name="description"
                    defaultValue={pastoral.description ?? ''}
                    disabled={isPending}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#002045] text-white hover:bg-[#1a365d]"
                    disabled={isPending}
                  >
                    {isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(null)}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : deletingId === pastoral.id ? (
              /* Card em modo de confirmação de exclusão */
              <div
                key={pastoral.id}
                className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 space-y-3"
              >
                <p className="font-medium text-sm text-[#002045]">{pastoral.name}</p>
                <p className="text-sm text-muted-foreground">
                  Confirma a exclusão desta pastoral? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(pastoral.id)}
                    disabled={isPending}
                  >
                    {isPending ? 'Removendo...' : 'Confirmar exclusão'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeletingId(null)}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              /* Card normal */
              <div
                key={pastoral.id}
                className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-[#002045]">{pastoral.name}</h3>
                {pastoral.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {pastoral.description}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(pastoral.id)
                      setDeletingId(null)
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDeletingId(pastoral.id)
                      setEditingId(null)
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
