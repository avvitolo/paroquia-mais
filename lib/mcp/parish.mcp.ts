// Camada MCP — acesso ao Supabase para dados de paróquia
// REGRA: nenhum arquivo fora de /lib/mcp pode importar de @/lib/supabase/server diretamente
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled'

export type ParishSubscription = {
  status: SubscriptionStatus
  plan: 'basico' | 'pro'
}

// Busca o status da assinatura da paróquia.
// Usa admin client pois o layout do dashboard pode rodar antes de o JWT ter parish_id.
// Retorna null em caso de erro — acesso permitido (fail-open).
export async function getSubscriptionByParishId(
  parishId: string
): Promise<ParishSubscription | null> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('subscriptions')
      .select('status, plan')
      .eq('parish_id', parishId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[checkSubscription] erro ao buscar assinatura:', error.message)
      return null
    }

    return data as ParishSubscription
  } catch (e) {
    console.error('[checkSubscription] exceção ao buscar assinatura:', e)
    return null
  }
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
