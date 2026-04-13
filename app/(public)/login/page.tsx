'use client'

// Página de login — autenticação via Magic Link (Story 1.2)
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithMagicLink } from './actions'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      await signInWithMagicLink(email)
      setSuccess(true)
    } catch {
      toast.error('Não foi possível enviar o link. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#002045] to-[#1a365d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8">
        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-[#002045]">
            Paróquia+
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesse sua paróquia com segurança
          </p>
        </div>

        {success ? (
          /* Estado de sucesso — instrui o usuário a verificar o e-mail */
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium text-[#002045]">Link enviado!</p>
            <p className="text-sm text-muted-foreground">
              Verifique seu e-mail para o link de acesso.
            </p>
          </div>
        ) : (
          /* Formulário de login */
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
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#002045] text-white hover:bg-[#1a365d]"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Entrar com Magic Link'}
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
