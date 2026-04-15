'use client'

// Página de login — autenticação com email e senha
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithPassword } from './actions'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await signInWithPassword(email, password)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : ''
        if (!message.includes('NEXT_REDIRECT')) {
          toast.error('Email ou senha incorretos. Tente novamente.')
        }
      }
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#002045] to-[#1a365d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8">
        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-[#002045]">Paróquia+</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acesse sua paróquia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <a
                href="/forgot-password"
                className="text-xs text-[#002045] hover:underline"
              >
                Esqueceu a senha?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#002045] text-white hover:bg-[#1a365d]"
            disabled={isPending}
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Não tem conta?{' '}
          <a href="/register" className="text-[#002045] font-medium hover:underline">
            Cadastrar paróquia
          </a>
        </p>
      </div>
    </main>
  )
}
