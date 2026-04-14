// Tipos e constantes compartilhados de celebração — sem dependências de servidor
// Pode ser importado em Client Components e Server Components
export type Celebration = {
  id: string
  parish_id: string
  title: string
  date: string
  time: string
  type: string
  notes: string | null
  created_at: string
}

export const CELEBRATION_TYPES = [
  'missa',
  'novena',
  'terço',
  'via-sacra',
  'adoração',
  'retiro',
  'outro',
] as const
