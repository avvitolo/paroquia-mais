'use client'

// Página de recuperação de senha
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset } from './actions'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await requestPasswordReset(email)
        setSuccess(true)
      } catch {
        toast.error('Não foi possível enviar o email. Tente novamente.')
      }
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#002045] to-[#1a365d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-[#002045]">Paróquia+</h1>
          <p className="mt-2 text-sm text-muted-foreground">Recuperar senha</p>
        </div>

        {success ? (
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-medium text-[#002045]">Email enviado!</p>
            <p className="text-sm text-muted-foreground">
              Verifique sua caixa de entrada e clique no link para redefinir sua senha.
            </p>
            <a href="/login" className="block mt-4 text-sm text-[#002045] font-medium hover:underline">
              Voltar ao login
            </a>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-muted-foreground">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
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

              <Button
                type="submit"
                className="w-full bg-[#002045] text-white hover:bg-[#1a365d]"
                disabled={isPending}
              >
                {isPending ? 'Enviando...' : 'Enviar link de recuperação'}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Lembrou a senha?{' '}
              <a href="/login" className="text-[#002045] font-medium hover:underline">
                Voltar ao login
              </a>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
