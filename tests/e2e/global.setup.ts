/**
 * Setup global — executado UMA vez antes de toda a suíte.
 * Cria paróquias e usuários de teste reutilizados pelos specs.
 * IDs são salvos em tests/e2e/.test-env.json para reuso entre arquivos.
 */
import { test as setup } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import {
  createTestParish,
  createTestUser,
  cleanupParish,
  adminClient,
} from './helpers/supabase-admin'

const STATE_FILE = path.resolve(__dirname, '.test-env.json')

setup('criar fixtures globais de teste', async () => {
  // Limpa estado anterior se existir
  if (fs.existsSync(STATE_FILE)) {
    const prev = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
    if (prev.parish1?.id) await cleanupParish(prev.parish1.id).catch(() => {})
    if (prev.parish2?.id) await cleanupParish(prev.parish2.id).catch(() => {})
  }

  // ── Paróquia 1 ─────────────────────────────────────────────────────
  const parish1 = await createTestParish('Paróquia Teste Alpha')
  const adminUser = await createTestUser({
    email: 'admin@paroquia-test.dev',
    password: 'Teste@1234',
    fullName: 'Admin Alpha',
    role: 'admin_sistema',
    parishId: parish1.id,
  })
  const coordUser = await createTestUser({
    email: 'coord@paroquia-test.dev',
    password: 'Teste@1234',
    fullName: 'Coord Alpha',
    role: 'coordenador',
    parishId: parish1.id,
  })
  const memberUser = await createTestUser({
    email: 'membro@paroquia-test.dev',
    password: 'Teste@1234',
    fullName: 'Membro Alpha',
    role: 'membro',
    parishId: parish1.id,
  })

  // ── Paróquia 2 (isolamento multi-tenant) ───────────────────────────
  const parish2 = await createTestParish('Paróquia Teste Beta')
  const adminUser2 = await createTestUser({
    email: 'admin@paroquia-beta-test.dev',
    password: 'Teste@1234',
    fullName: 'Admin Beta',
    role: 'admin_sistema',
    parishId: parish2.id,
  })

  // Cria pastoral base na paróquia 1
  const { data: pastoral1 } = await adminClient
    .from('pastorals')
    .insert({ parish_id: parish1.id, name: 'Pastoral da Liturgia' })
    .select()
    .single()

  // Cria membro de escala base
  const { data: member1 } = await adminClient
    .from('members')
    .insert({
      parish_id: parish1.id,
      full_name: 'João Acólito',
      email: 'joao@test.dev',
      pastoral_id: pastoral1!.id,
      is_active: true,
    })
    .select()
    .single()

  const state = {
    parish1:   { id: parish1.id,   name: parish1.name },
    parish2:   { id: parish2.id,   name: parish2.name },
    adminUser,
    coordUser,
    memberUser,
    adminUser2,
    pastoral1: { id: pastoral1!.id, name: pastoral1!.name },
    member1:   { id: member1!.id,   name: member1!.full_name },
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
  console.log('✅ Fixtures criados:', JSON.stringify(state, null, 2))
})
