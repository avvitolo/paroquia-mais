'use client'

// Sidebar de navegação do dashboard — filtra links por papel do usuário
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { hasRole, type AppUser } from '@/lib/mcp/user.types'

// Mapa de rótulos para cada papel
const ROLE_LABELS: Record<string, string> = {
  admin_sistema:   'Administrador',
  admin_paroquial: 'Administrador Paroquial',
  paroco:          'Pároco',
  secretario:      'Secretário Paroquial',
  coordenador:     'Coordenador',
  membro:          'Membro',
}

type NavItem = {
  href: string
  label: string
  roles: Array<'admin_sistema' | 'admin_paroquial' | 'paroco' | 'secretario' | 'coordenador' | 'membro'>
}

// Atalhos para grupos de acesso reutilizados nas rotas
const GESTORES = ['admin_sistema', 'admin_paroquial', 'paroco', 'secretario'] as const
const GESTORES_E_COORD = [...GESTORES, 'coordenador'] as const
const TODOS = [...GESTORES_E_COORD, 'membro'] as const

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',    label: 'Dashboard',     roles: [...TODOS] },
  { href: '/pastorals',    label: 'Pastorais',      roles: [...GESTORES] },
  { href: '/members',      label: 'Membros',        roles: [...GESTORES_E_COORD] },
  { href: '/celebrations', label: 'Celebrações',    roles: [...GESTORES_E_COORD] },
  { href: '/schedules',    label: 'Escalas',        roles: [...TODOS] },
  { href: '/settings',     label: 'Configurações',  roles: [...GESTORES] },
]

interface SidebarProps {
  user: AppUser
}

export function Sidebar({ user }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Filtra os itens de navegação de acordo com o papel do usuário
  const visibleItems = NAV_ITEMS.filter((item) =>
    hasRole(user, ...item.roles)
  )

  const close = () => setMobileOpen(false)

  return (
    <>
      {/* Botão hambúrguer — visível apenas em telas pequenas */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center rounded-lg bg-[#002045] p-2 text-white shadow-lg md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop — fecha a sidebar ao clicar fora (mobile) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar
          Mobile: overlay fixo, animado por translate; entra pela esquerda
          Desktop: estático no fluxo flex, sempre visível */}
      <aside
        className={[
          'flex h-screen w-56 flex-col bg-[#002045] text-white',
          // Mobile: posição fixa, desliza da esquerda
          'fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: volta ao fluxo flex, sem translação
          'md:static md:translate-x-0',
        ].join(' ')}
      >
        {/* Cabeçalho com nome da paróquia + fechar (mobile) */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-white/10">
          <span className="font-heading text-xl font-bold text-white">Paróquia+</span>
          <button
            onClick={close}
            className="rounded p-1 text-white/60 hover:text-white md:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
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
                onClick={close}
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

        {/* Botão de logout — usa route handler /auth/signout para limpar cookies corretamente */}
        <div className="px-3 py-4 border-t border-white/10">
          <a
            href="/auth/signout"
            className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-white/70 hover:bg-[#1a365d] hover:text-white transition-colors"
          >
            Sair
          </a>
        </div>
      </aside>
    </>
  )
}
