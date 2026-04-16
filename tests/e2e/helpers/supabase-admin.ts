/**
 * Helper para operações administrativas no Supabase durante os testes.
 * Usa service role key — nunca expor no browser.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

export interface TestParish {
  id: string
  name: string
}

export interface TestUser {
  id: string
  email: string
  password: string
  role: string
  parishId: string
}

/** Cria uma paróquia de teste e retorna seu ID */
export async function createTestParish(name: string): Promise<TestParish> {
  const { data, error } = await adminClient
    .from('parishes')
    .insert({ name })
    .select()
    .single()
  if (error) throw new Error(`createTestParish: ${error.message}`)
  return { id: data.id, name: data.name }
}

/** Cria um usuário de teste com o papel especificado */
export async function createTestUser(opts: {
  email: string
  password: string
  fullName: string
  role: string
  parishId: string
}): Promise<TestUser> {
  const { data, error } = await adminClient.auth.admin.createUser({
    email: opts.email,
    password: opts.password,
    email_confirm: true,
    app_metadata: { parish_id: opts.parishId, role: opts.role },
    user_metadata: { full_name: opts.fullName },
  })
  if (error) throw new Error(`createTestUser: ${error.message}`)

  await adminClient.from('users').insert({
    id: data.user.id,
    parish_id: opts.parishId,
    full_name: opts.fullName,
    email: opts.email,
    role: opts.role,
  })

  return {
    id: data.user.id,
    email: opts.email,
    password: opts.password,
    role: opts.role,
    parishId: opts.parishId,
  }
}

/** Remove todos os dados de teste de uma paróquia */
export async function cleanupParish(parishId: string) {
  await adminClient.from('schedule_assignments').delete().eq('parish_id', parishId)
  await adminClient.from('schedules').delete().eq('parish_id', parishId)
  await adminClient.from('celebrations').delete().eq('parish_id', parishId)
  await adminClient.from('member_availability').delete().eq('parish_id', parishId)
  await adminClient.from('members').delete().eq('parish_id', parishId)
  await adminClient.from('pastorals').delete().eq('parish_id', parishId)
  await adminClient.from('users').delete().eq('parish_id', parishId)
  await adminClient.from('parishes').delete().eq('id', parishId)
  // Remove auth users da paróquia
  const { data: authUsers } = await adminClient.auth.admin.listUsers()
  for (const u of authUsers?.users ?? []) {
    if (u.app_metadata?.parish_id === parishId) {
      await adminClient.auth.admin.deleteUser(u.id)
    }
  }
}
