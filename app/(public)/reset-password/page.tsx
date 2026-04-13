'use client'

// Página de redefinição de senha — acessada após clicar no link do email
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from './actions'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password !== confirm) {
      toast.error('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      toast.error('A senha deve ter ao menos 6 caracteres.')
      return
    }

    startTransition(async () => {
      try {
        await resetPassword(password)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : ''
        if (!message.includes('NEXT_REDIRECT')) {
          toast.error(message || 'Erro ao redefinir senha. Tente novamente.')
        }
      }
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#002045] to-[#1a365d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-[#002045]">Paróquia+</h1>
          <p className="mt-2 text-sm text-muted-foreground">Definir nova senha</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar nova senha</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Repita a senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#002045] text-white hover:bg-[#1a365d]"
            disabled={isPending}
          >
            {isPending ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </form>
      </div>
    </main>
  )
}
