// Camada MCP — acesso ao Supabase para dados de escalas
// REGRA: nenhum arquivo fora de /lib/mcp pode importar de @/lib/supabase/server diretamente
import { createClient } from '@/lib/supabase/server'

export type Schedule = {
  id: string
  parish_id: string
  celebration_id: string
  status: 'draft' | 'published'
  created_at: string
}

// Busca escalas da paróquia
export async function getSchedulesByParish(parishId: string): Promise<Schedule[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('parish_id', parishId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Cria uma nova escala
export async function createSchedule(
  parishId: string,
  celebrationId: string
): Promise<Schedule> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schedules')
    .insert({ parish_id: parishId, celebration_id: celebrationId, status: 'draft' })
    .select()
    .single()
  if (error) throw error
  return data
}
