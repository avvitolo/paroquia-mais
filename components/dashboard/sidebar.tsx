'use client'

// Sidebar de navegação do dashboard — filtra links por papel do usuário
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/features/auth/actions'
import { hasRole, type AppUser } from '@/lib/mcp/user.types'

// Mapa de rótulos para cada papel
const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  coordinator: 'Coordenador',
  member: 'Membro',
}

type NavItem = {
  href: string
  label: string
  roles: Array<'admin' | 'coordinator' | 'member'>
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', roles: ['admin', 'coordinator', 'member'] },
  { href: '/pastorals', label: 'Pastorais', roles: ['admin'] },
  { href: '/members', label: 'Membros', roles: ['admin', 'coordinator'] },
  { href: '/celebrations', label: 'Celebrações', roles: ['admin', 'coordinator'] },
  { href: '/schedules', label: 'Escalas', roles: ['admin', 'coordinator', 'member'] },
  { href: '/settings', label: 'Configurações', roles: ['admin'] },
]

interface SidebarProps {
  user: AppUser
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  // Filtra os itens de navegação de acordo com o papel do usuário
  const visibleItems = NAV_ITEMS.filter((item) =>
    hasRole(user, ...item.roles)
  )

  return (
    <aside className="flex h-screen w-56 flex-col bg-[#002045] text-white">
      {/* Cabeçalho com nome da paróquia */}
      <div className="px-5 py-6 border-b border-white/10">
        <span className="font-heading text-xl font-bold text-white">Paróquia+</span>
      </div>

      {/* Informações do usuário */}
      <div className="px-5 py-4 border-b border-white/10">
        <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
        <span className="mt-1 inline-block rounded-full bg-[#fed65b] px-2 py-0.5 text-xs font-semibold text-[#002045]">
          {ROLE_LABELS[user.role] ?? user.role}
        </span>
      </div>

      {/* Links de navegação */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1a365d] text-white'
                  : 'text-white/70 hover:bg-[#1a365d] hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Botão de logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-white/70 hover:bg-[#1a365d] hover:text-white transition-colors"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
