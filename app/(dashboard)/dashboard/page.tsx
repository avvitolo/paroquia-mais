// Página principal do dashboard
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import Link from 'next/link'

const QUICK_LINKS = [
  { href: '/members',      label: 'Membros',      icon: '👥', desc: 'Gerenciar membros' },
  { href: '/pastorals',    label: 'Pastorais',    icon: '✝️',  desc: 'Grupos de serviço' },
  { href: '/celebrations', label: 'Celebrações',  icon: '📅', desc: 'Missas e eventos' },
  { href: '/schedules',    label: 'Escalas',      icon: '📋', desc: 'Atribuições de serviço' },
]

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const firstName = user.full_name.split(' ')[0]

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-lg space-y-8 text-center">

        {/* Saudação */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#002045]">Olá, {firstName}!</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Badge Em Desenvolvimento */}
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-[#002045]/8 p-5 border border-[#002045]/15">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-[#002045]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.896-2.272 2.063-2.063a2.652 2.652 0 0 0-3.748-3.748l-2.063 2.063m-1.04 4.192-.793.793"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
              🚧 Em Desenvolvimento
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              O painel principal está sendo construído. Em breve você terá acesso a métricas,
              próximas escalas e notificações em tempo real.
            </p>
          </div>
        </div>

        {/* Atalhos rápidos */}
        <div className="grid grid-cols-2 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-sm transition-all hover:border-[#002045]/30 hover:shadow-md hover:bg-[#002045]/3"
            >
              <span className="text-2xl">{link.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[#002045] group-hover:text-[#002045]">{link.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
