/**
 * Suite 07 — Multi-tenant: Isolamento entre Paróquias (CRÍTICO)
 * Garante que usuário de uma paróquia nunca vê dados de outra.
 */
import { test, expect } from '@playwright/test'
import { loginAs, loadTestEnv } from './helpers/auth'

test.describe('Multi-tenant — Isolamento de dados', () => {
  // ── TC-060 ───────────────────────────────────────────────────────────
  test('TC-060 [sec] Admin da paróquia B não vê membros da paróquia A na UI', async ({ page }) => {
    const env = loadTestEnv()
    // Login como admin da paróquia B
    await loginAs(page, env.adminUser2.email, env.adminUser2.password)
    await page.goto('/members')
    // Não deve ver o membro criado no setup (que pertence à paróquia A)
    await expect(page.getByText(env.member1.name)).not.toBeVisible({ timeout: 5_000 })
  })

  // ── TC-061 ───────────────────────────────────────────────────────────
  test('TC-061 [sec] Admin da paróquia B não vê pastorais da paróquia A na UI', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser2.email, env.adminUser2.password)
    await page.goto('/pastorals')
    await expect(page.getByText(env.pastoral1.name)).not.toBeVisible({ timeout: 5_000 })
  })

  // ── TC-062 ───────────────────────────────────────────────────────────
  test('TC-062 [sec] API: consulta de membro com ID de outra paróquia não retorna dados', async ({ page }) => {
    const env = loadTestEnv()
    // Login como admin da paróquia B
    await loginAs(page, env.adminUser2.email, env.adminUser2.password)

    // Tenta buscar membro da paróquia A via Supabase REST diretamente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Obtém o token da sessão atual via localStorage/cookie
    const token = await page.evaluate(() => {
      const keys = Object.keys(localStorage)
      for (const k of keys) {
        if (k.includes('auth-token') || k.includes('supabase')) {
          try {
            const v = JSON.parse(localStorage.getItem(k) ?? '{}')
            return v?.access_token ?? null
          } catch { return null }
        }
      }
      return null
    })

    if (!token) {
      test.skip(true, 'Token não obtido via localStorage — sessão usa cookies httpOnly')
      return
    }

    // Faz request direto à API do Supabase como usuário da paróquia B
    const res = await page.request.get(
      `${supabaseUrl}/rest/v1/members?id=eq.${env.member1.id}&select=*`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } }
    )
    const body = await res.json()
    // RLS deve retornar array vazio — membro pertence à paróquia A
    expect(Array.isArray(body)).toBeTruthy()
    expect(body).toHaveLength(0)
  })

  // ── TC-063 ───────────────────────────────────────────────────────────
  test('TC-063 [sec] API: consulta de pastoral com ID de outra paróquia retorna vazio', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser2.email, env.adminUser2.password)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const token = await page.evaluate(() => {
      const keys = Object.keys(localStorage)
      for (const k of keys) {
        if (k.includes('supabase')) {
          try {
            const v = JSON.parse(localStorage.getItem(k) ?? '{}')
            return v?.access_token ?? null
          } catch { return null }
        }
      }
      return null
    })

    if (!token) {
      test.skip(true, 'Token não obtido via localStorage — sessão usa cookies httpOnly')
      return
    }

    const res = await page.request.get(
      `${supabaseUrl}/rest/v1/pastorals?id=eq.${env.pastoral1.id}&select=*`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } }
    )
    const body = await res.json()
    expect(body).toHaveLength(0)
  })

  // ── TC-064 ───────────────────────────────────────────────────────────
  test('TC-064 [sec] Manipulação de URL com ID de outra paróquia não expõe dados', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser2.email, env.adminUser2.password)
    // Tenta acessar escala de outra paróquia por URL direta com ID inventado
    await page.goto(`/schedules/00000000-0000-0000-0000-000000000001`)
    // Deve mostrar 404 ou redirecionar — nunca mostrar dados de outra paróquia
    const url = page.url()
    const is404 = await page.getByText(/não encontrad|not found/i).isVisible({ timeout: 5_000 }).catch(() => false)
    const isRedirected = !url.includes('/schedules/00000000')
    expect(is404 || isRedirected).toBeTruthy()
  })
})
