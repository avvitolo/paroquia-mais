'use client'

// Página de criação de conta — cria paróquia + admin em um único fluxo
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from './actions'

export default function SignupPage() {
  const [parishName, setParishName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [success, setSuccess] = useState(false)
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
        await signUp(fullName, email, password, parishName)
        setSuccess(true)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : ''
        // NEXT_REDIRECT não é um erro — é o redirect para /dashboard após cadastro
        if (message.includes('NEXT_REDIRECT')) return
        toast.error(message || 'Erro ao criar conta. Tente novamente.')
      }
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#002045] to-[#1a365d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-3xl font-bold text-[#002045]">Paróquia+</h1>
          <p className="mt-2 text-sm text-muted-foreground">Cadastre sua paróquia</p>
        </div>

        {success ? (
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium text-[#002045]">Conta criada!</p>
            <p className="text-sm text-muted-foreground">
              Verifique seu e-mail e clique no link de confirmação para ativar sua conta.
            </p>
            <a href="/login" className="block mt-4 text-sm text-[#002045] font-medium hover:underline">
              Ir para o login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dados da paróquia */}
            <div className="space-y-2">
              <Label htmlFor="parishName">Nome da paróquia</Label>
              <Input
                id="parishName"
                type="text"
                placeholder="Paróquia São José"
                value={parishName}
                onChange={(e) => setParishName(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              {/* Dados do administrador */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Seu nome completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="João da Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
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
                <Label htmlFor="confirm">Confirmar senha</Label>
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
            </div>

            <Button
              type="submit"
              className="w-full bg-[#002045] text-white hover:bg-[#1a365d]"
              disabled={isPending}
            >
              {isPending ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        )}

        {!success && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Já tem conta?{' '}
            <a href="/login" className="text-[#002045] font-medium hover:underline">
              Entrar
            </a>
          </p>
        )}
      </div>
    </main>
  )
}
