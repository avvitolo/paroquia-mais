// Camada MCP — acesso ao Supabase para celebrações (server-only)
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

// Lista celebrações futuras da paróquia em ordem cronológica
export async function getCelebrations(includeAll = false): Promise<Celebration[]> {
  const supabase = await createClient()
  let query = supabase
    .from('celebrations')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (!includeAll) {
    // Apenas celebrações a partir de hoje
    query = query.gte('date', new Date().toISOString().split('T')[0])
  }

  const { data, error } = await query
  if (error) {
    console.error('[getCelebrations] error:', error.message)
    return []
  }
  return data as Celebration[]
}

export async function getCelebrationById(id: string): Promise<Celebration | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('celebrations')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Celebration
}

export async function createCelebration(
  parishId: string,
  input: { title: string; date: string; time: string; type: string; notes?: string }
): Promise<Celebration> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('celebrations')
    .insert({ parish_id: parishId, ...input })
    .select()
    .single()
  if (error) throw new Error('Falha ao criar celebração: ' + error.message)
  return data as Celebration
}

export async function updateCelebration(
  id: string,
  parishId: string,
  input: { title?: string; date?: string; time?: string; type?: string; notes?: string | null }
): Promise<Celebration> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('celebrations')
    .update(input)
    .eq('id', id)
    .eq('parish_id', parishId)
    .select()
    .single()
  if (error) throw new Error('Falha ao atualizar celebração: ' + error.message)
  return data as Celebration
}

export async function deleteCelebration(id: string, parishId: string): Promise<void> {
  // Verifica se há escalas vinculadas antes de excluir
  const admin = createAdminClient()
  const { count } = await admin
    .from('schedules')
    .select('id', { count: 'exact', head: true })
    .eq('celebration_id', id)

  if (count && count > 0) {
    throw new Error(
      `Esta celebração possui ${count} escala(s) vinculada(s). Remova as escalas antes de excluir.`
    )
  }

  const { error } = await admin
    .from('celebrations')
    .delete()
    .eq('id', id)
    .eq('parish_id', parishId)
  if (error) throw new Error('Falha ao excluir celebração: ' + error.message)
}
