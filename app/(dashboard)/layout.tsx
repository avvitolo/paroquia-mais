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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
