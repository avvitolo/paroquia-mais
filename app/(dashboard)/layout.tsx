// Layout do dashboard — autenticação server-side, navegação por papel e gate de assinatura (Stories 2.1, 6.1)
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import { getSubscriptionByParishId } from '@/lib/mcp/parish.mcp'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { AlertTriangle } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let authUser = null
  let user = null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error('[DashboardLayout] auth.getUser error:', error.message)
      redirect('/login')
    }

    authUser = data.user
  } catch (e) {
    console.error('[DashboardLayout] createClient/getUser exception:', e)
    redirect('/login')
  }

  if (!authUser) {
    redirect('/login')
  }

  try {
    user = await getCurrentUser()
  } catch (e) {
    console.error('[DashboardLayout] getCurrentUser exception:', e)
  }

  if (!user) {
    // Usuário autenticado mas sem registro em public.users — estado inconsistente
    console.error('[DashboardLayout] public.users record not found for auth user:', authUser.id)
    redirect('/auth/signout')
  }

  // Verifica status da assinatura (Story 6.1) — fail-open: null permite acesso
  const subscription = await getSubscriptionByParishId(user.parish_id)
  const BLOCKED_STATUSES = ['inactive', 'past_due', 'canceled']
  const isBlocked = subscription !== null && BLOCKED_STATUSES.includes(subscription.status)

  if (isBlocked) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto p-6 pt-16 md:pt-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">Assinatura Suspensa</h1>
            <p className="text-muted-foreground max-w-md">
              Sua assinatura está com status <strong>{subscription.status}</strong>.
              O acesso ao painel está temporariamente bloqueado.
            </p>
            <p className="text-muted-foreground max-w-md">
              Entre em contato com o suporte ou renove seu plano para restaurar o acesso.
            </p>
            <a
              href="/subscription"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ver Assinatura
            </a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      {/* pt-16 no mobile para não sobrepor o botão hambúrguer fixo */}
      <main className="flex-1 overflow-auto p-6 pt-16 md:pt-6">{children}</main>
    </div>
  )
}
