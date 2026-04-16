/**
 * Suite 08 — Segurança
 * Cobre: acesso direto por URL, manipulação de IDs, validação no backend
 */
import { test, expect } from '@playwright/test'
import { loadTestEnv } from './helpers/auth'

test.describe('Segurança — Acesso Não Autorizado', () => {
  // ── TC-070 ───────────────────────────────────────────────────────────
  test('TC-070 [sec] Usuário não autenticado não acessa nenhuma rota do dashboard', async ({ page }) => {
    const routes = [
      '/dashboard', '/members', '/pastorals', '/celebrations',
      '/schedules', '/settings', '/subscription',
    ]
    for (const route of routes) {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
    }
  })

  // ── TC-071 ───────────────────────────────────────────────────────────
  test('TC-071 [sec] API retorna dados vazios sem token de autenticação', async ({ page }) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Consulta sem Authorization header (apenas anon key)
    const res = await page.request.get(
      `${supabaseUrl}/rest/v1/users?select=*`,
      { headers: { apikey: anonKey } }
    )
    const body = await res.json()
    // RLS sem autenticação deve retornar array vazio (dados protegidos)
    expect(Array.isArray(body)).toBeTruthy()
    expect(body).toHaveLength(0)
  })

  // ── TC-072 ───────────────────────────────────────────────────────────
  test('TC-072 [sec] API member_profiles retorna vazio para role não autorizado', async ({ page }) => {
    const env = loadTestEnv()
    // Faz login como coordenador
    await page.goto('/login')
    await page.getByLabel('E-mail').fill(env.coordUser.email)
    await page.getByLabel('Senha').fill(env.coordUser.password)
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const token = await page.evaluate(() => {
      for (const k of Object.keys(localStorage)) {
        if (k.includes('supabase')) {
          try { return JSON.parse(localStorage.getItem(k)!)?.access_token } catch {}
        }
      }
      return null
    })

    if (!token) {
      test.skip(true, 'Sessão via cookie httpOnly — não testável via localStorage')
      return
    }

    // Coordenador não deve ver member_profiles (CPF/endereço)
    const res = await page.request.get(
      `${supabaseUrl}/rest/v1/member_profiles?select=*`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } }
    )
    const body = await res.json()
    expect(body).toHaveLength(0)
  })

  // ── TC-073 ───────────────────────────────────────────────────────────
  test('TC-073 [sec] Tentativa de SQL injection no campo de email é sanitizada', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill(`'; DROP TABLE users; --`)
    await page.getByLabel('Senha').fill('qualquer')
    await page.getByRole('button', { name: /entrar/i }).click()
    // Sistema deve continuar respondendo — sem crash ou 500
    await expect(page.locator('body')).toBeVisible({ timeout: 8_000 })
    // Ainda está na página de login ou mostra erro — nunca em estado quebrado
    expect(page.url()).toMatch(/\/login/)
  })

  // ── TC-074 ───────────────────────────────────────────────────────────
  test('TC-074 [sec] XSS básico em campo de texto não executa script', async ({ page }) => {
    // Registra listener de dialog ANTES da ação
    let dialogFired = false
    page.on('dialog', () => { dialogFired = true })

    await page.goto('/login')
    await page.getByLabel('E-mail').fill('<script>alert("xss")</script>@test.com')
    await page.getByLabel('Senha').fill('senha123')
    await page.getByRole('button', { name: /entrar/i }).click()
    // Dialog alert não deve aparecer
    await page.waitForTimeout(2000)
    expect(dialogFired).toBeFalsy()
  })
})
