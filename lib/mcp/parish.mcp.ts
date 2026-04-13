// Camada MCP — acesso ao Supabase para dados de paróquia
// REGRA: nenhum arquivo fora de /lib/mcp pode importar de @/lib/supabase/server diretamente
import { createClient } from '@/lib/supabase/server'

export type Parish = {
  id: string
  name: string
  created_at: string
}

// Busca a paróquia pelo ID
export async function getParishById(parishId: string): Promise<Parish | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parishes')
    .select('*')
    .eq('id', parishId)
    .single()
  if (error) return null
  return data
}

// Cria uma nova paróquia
export async function createParish(name: string): Promise<Parish> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parishes')
    .insert({ name })
    .select()
    .single()
  if (error) throw error
  return data
}
