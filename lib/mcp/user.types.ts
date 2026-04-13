// Tipos e funções puras de usuário — sem dependências de servidor
// Pode ser importado tanto em Server Components quanto em Client Components
export type AppRole = 'admin' | 'coordinator' | 'member'

export type AppUser = {
  id: string
  parish_id: string
  full_name: string
  email: string
  role: AppRole
  created_at: string
}

// Verifica se o usuário possui um dos papéis especificados
export function hasRole(user: AppUser, ...roles: AppRole[]): boolean {
  return roles.includes(user.role)
}
