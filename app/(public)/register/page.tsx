'use client'

// Página de cadastro da paróquia — integração Stripe (Story 1.3)
import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCheckoutSession } from './actions'

// Componente interno separado para isolar o useSearchParams dentro do Suspense
function RegisterForm() {
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled') === 'true'
  const planParam = searchParams.get('plan') === 'pro' ? 'pro' : 'basico'

  const [parishName, setParishName] = useState('')
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState<'basico' | 'pro'>(planParam)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await createCheckoutSession({ parishName, email, plan })
      } catch (err: unknown) {
        // redirect() lança um erro especial — não exibe toast para esse caso
        const message = err instanceof Error ? err.message : ''
        if (!message.includes('NEXT_REDIRECT')) {
          toast.error('Não foi possível iniciar o pagamento. Tente novamente.')
        }
      }
    })
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
            Cadastre sua paróquia e escolha um plano
          </p>
        </div>

        {/* Mensagem de cancelamento */}
        {canceled && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 text-center">
            Pagamento cancelado. Tente novamente quando quiser.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome da paróquia */}
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

          {/* E-mail do administrador */}
          <div className="space-y-2">
            <Label htmlFor="email">Seu e-mail (administrador)</Label>
            <Input
              id="email"
              type="email"
              placeholder="padre@paroquia.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          {/* Seleção de plano */}
          <div className="space-y-2">
            <Label>Plano</Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Plano Básico */}
              <label
                className={`flex flex-col items-center rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                  plan === 'basico'
                    ? 'border-[#002045] bg-[#002045]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value="basico"
                  checked={plan === 'basico'}
                  onChange={() => setPlan('basico')}
                  disabled={isPending}
                  className="sr-only"
                />
                <span className="font-semibold text-[#002045]">Trial — 30 dias</span>
                <span className="text-xs text-muted-foreground mt-1">Acesso total, sem cobrança agora</span>
              </label>

              {/* Plano Pro */}
              <label
                className={`flex flex-col items-center rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                  plan === 'pro'
                    ? 'border-[#002045] bg-[#002045]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value="pro"
                  checked={plan === 'pro'}
                  onChange={() => setPlan('pro')}
                  disabled={isPending}
                  className="sr-only"
                />
                <span className="font-semibold text-[#002045]">Pro</span>
                <span className="text-xs text-muted-foreground mt-1">Recursos avançados</span>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#002045] text-white hover:bg-[#1a365d]"
            disabled={isPending}
          >
            {isPending
            ? 'Redirecionando...'
            : plan === 'basico'
              ? 'Iniciar trial gratuito de 30 dias'
              : 'Continuar para pagamento'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Já tem acesso?{' '}
          <a href="/login" className="text-[#002045] font-medium hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </main>
  )
}

// Wrapper com Suspense obrigatório para useSearchParams no Next.js
export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
