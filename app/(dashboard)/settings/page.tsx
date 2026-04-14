// Página de configurações — perfil do administrador e acesso à assinatura
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, CreditCard, ChevronRight } from 'lucide-react'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrador',
    coordinator: 'Coordenador',
    member: 'Membro',
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#002045]">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie suas informações e assinatura.
        </p>
      </div>

      {/* Perfil */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Perfil
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="w-10 h-10 rounded-full bg-[#002045]/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-[#002045]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#002045] truncate">{user.full_name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
            <span className="bg-[#fed65b] text-[#002045] text-xs font-semibold rounded-full px-2.5 py-0.5 shrink-0">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>
        </div>
      </section>

      {/* Assinatura */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Plano e assinatura
        </h2>
        <Link
          href="/subscription"
          className="flex items-center gap-4 px-6 py-4 rounded-xl border border-gray-200 bg-white hover:border-[#002045]/30 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-[#002045]/10 flex items-center justify-center shrink-0">
            <CreditCard className="h-5 w-5 text-[#002045]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#002045]">Assinatura</p>
            <p className="text-sm text-muted-foreground">Ver status e plano atual</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#002045] transition-colors" />
        </Link>
      </section>
    </div>
  )
}
