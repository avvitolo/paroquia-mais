// Layout do dashboard — autenticação server-side e navegação por papel (Story 2.1)
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // Primeira camada de proteção (o proxy.ts já redireciona, mas validamos novamente)
  if (!authUser) {
    redirect('/login')
  }

  // Busca dados completos do usuário incluindo papel
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
