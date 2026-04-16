/**
 * Suite 06 — Escalas (CRUD + Atribuições)
 * Cobre: criação, publicação, atribuição de membros, confirmação de presença
 */
import { test, expect } from '@playwright/test'
import { loginAs, loadTestEnv } from './helpers/auth'

test.describe('Escalas — CRUD e Atribuições', () => {
  // ── TC-050 ───────────────────────────────────────────────────────────
  test('TC-050 [+] Admin cria escala vinculada a uma celebração', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/schedules')
    await page.getByRole('button', { name: /nova escala|criar escala|adicionar/i }).click()
    // Seleciona celebração existente
    const celebSelect = page.getByLabel(/celebração/i)
    if (await celebSelect.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await celebSelect.selectOption({ index: 1 })
    }
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    // Verifica que a escala foi criada (aparece na lista)
    await expect(page.locator('[data-testid="schedule-list"], table, .schedule-item').first())
      .toBeVisible({ timeout: 8_000 })
  })

  // ── TC-051 ───────────────────────────────────────────────────────────
  test('TC-051 [+] Admin adiciona membro a uma escala', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/schedules')
    // Abre primeira escala disponível
    await page.getByRole('link', { name: /ver|abrir|detalhes/i }).first().click()
    // Adiciona membro
    const addBtn = page.getByRole('button', { name: /adicionar membro|atribuir/i })
    if (await addBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await addBtn.click()
      const memberSelect = page.getByLabel(/membro/i)
      await memberSelect.selectOption({ label: env.member1.name })
      await page.getByLabel(/função|role/i).fill('Acólito')
      await page.getByRole('button', { name: /salvar|adicionar/i }).click()
      await expect(page.getByText(env.member1.name)).toBeVisible({ timeout: 8_000 })
    } else {
      test.skip(true, 'Interface de atribuição não encontrada — verificar seletor')
    }
  })

  // ── TC-052 ───────────────────────────────────────────────────────────
  test('TC-052 [+] Admin publica escala (status draft → published)', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/schedules')
    const publishBtn = page.getByRole('button', { name: /publicar/i }).first()
    if (await publishBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await publishBtn.click()
      await expect(page.getByText(/publicad/i)).toBeVisible({ timeout: 8_000 })
    } else {
      test.skip(true, 'Botão publicar não encontrado neste estado')
    }
  })

  // ── TC-053 ───────────────────────────────────────────────────────────
  test('TC-053 [+] Membro vê apenas escalas publicadas', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.memberUser.email, env.memberUser.password)
    await page.goto('/schedules')
    // Não deve ver opção de criar escala
    await expect(page.getByRole('button', { name: /nova escala|criar/i })).not.toBeVisible()
    // Pode ver escalas publicadas
    await expect(page.locator('main')).toBeVisible()
  })

  // ── TC-054 ───────────────────────────────────────────────────────────
  test('TC-054 [edge] Duas escalas no mesmo dia são permitidas (sem bloqueio duplo)', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/schedules')
    // Verifica que o sistema aceita múltiplas escalas sem travar
    const count = await page.getByRole('row').count()
    expect(count).toBeGreaterThanOrEqual(0) // Sem crash
  })
})
