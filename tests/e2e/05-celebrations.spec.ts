/**
 * Suite 05 — Celebrações / Eventos (CRUD + Fluxo de Aprovação)
 * Cobre: criação por gestores (direto), criação por coordenador (pendente),
 *        aprovação, rejeição, cenários negativos
 */
import { test, expect } from '@playwright/test'
import { loginAs, logout, loadTestEnv } from './helpers/auth'

test.describe('Celebrações — CRUD e Aprovação', () => {
  // ── TC-040 ───────────────────────────────────────────────────────────
  test('TC-040 [+] Admin cria celebração aprovada diretamente', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/celebrations')
    await page.getByRole('button', { name: /nova celebração|adicionar/i }).click()
    await page.getByLabel(/título/i).fill('Missa de Domingo')
    // Preenche data — tenta getByLabel, fallback para input[type=date]
    const dateInput = page.getByLabel(/data/i).or(page.locator('input[type="date"]').first())
    await dateInput.fill('2026-05-04')
    const timeInput = page.getByLabel(/horário|hora/i).or(page.locator('input[type="time"]').first())
    await timeInput.fill('10:00')
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    await expect(page.getByText('Missa de Domingo')).toBeVisible({ timeout: 8_000 })
  })

  // ── TC-041 ───────────────────────────────────────────────────────────
  test('TC-041 [+] Coordenador cria celebração com status pendente', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.coordUser.email, env.coordUser.password)
    await page.goto('/celebrations')
    await page.getByRole('button', { name: /nova celebração|adicionar/i }).click()
    await page.getByLabel(/título/i).fill('Retiro da Pastoral')
    const dateInput = page.getByLabel(/data/i).or(page.locator('input[type="date"]').first())
    await dateInput.fill('2026-05-11')
    const timeInput = page.getByLabel(/horário|hora/i).or(page.locator('input[type="time"]').first())
    await timeInput.fill('09:00')
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    // Celebração criada como pendente — exibe badge ou label indicativo
    await expect(page.getByText('Retiro da Pastoral')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(/pendente/i)).toBeVisible({ timeout: 5_000 })
  })

  // ── TC-042 ───────────────────────────────────────────────────────────
  test('TC-042 [+] Admin aprova celebração pendente do coordenador', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/celebrations')
    const pendingRow = page.getByText('Retiro da Pastoral').locator('..')
    await pendingRow.getByRole('button', { name: /aprovar/i }).click()
    await expect(pendingRow.getByText(/aprovad/i)).toBeVisible({ timeout: 8_000 })
  })

  // ── TC-043 ───────────────────────────────────────────────────────────
  test('TC-043 [-] Criar celebração sem título é bloqueado', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/celebrations')
    await page.getByRole('button', { name: /nova celebração|adicionar/i }).click()
    const dateInput = page.getByLabel(/data/i).or(page.locator('input[type="date"]').first())
    await dateInput.fill('2026-05-18')
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    await expect(page.getByLabel(/título/i)).toBeVisible()
  })

  // ── TC-044 ───────────────────────────────────────────────────────────
  test('TC-044 [+] Membro vê apenas celebrações aprovadas', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.memberUser.email, env.memberUser.password)
    await page.goto('/celebrations')
    // Membro não vê celebrações pendentes
    await expect(page.getByText(/pendente/i)).not.toBeVisible()
    // Mas vê as aprovadas
    await expect(page.getByText('Missa de Domingo')).toBeVisible({ timeout: 8_000 })
  })

  // ── TC-045 ───────────────────────────────────────────────────────────
  test('TC-045 [+] Admin edita celebração existente', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/celebrations')
    const row = page.getByText('Missa de Domingo').locator('..')
    await row.getByRole('button', { name: /editar/i }).click()
    await page.getByLabel(/título/i).fill('Missa Dominical')
    await page.getByRole('button', { name: /salvar/i }).click()
    await expect(page.getByText('Missa Dominical')).toBeVisible({ timeout: 8_000 })
  })

  // ── TC-046 ───────────────────────────────────────────────────────────
  test('TC-046 [+] Admin exclui celebração sem associação', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/celebrations')
    // Cria uma célébração para deletar
    await page.getByRole('button', { name: /nova celebração|adicionar/i }).click()
    await page.getByLabel(/título/i).fill('Celebração para Deletar')
    const dateInput = page.getByLabel(/data/i).or(page.locator('input[type="date"]').first())
    await dateInput.fill('2026-06-01')
    const timeInput = page.getByLabel(/horário|hora/i).or(page.locator('input[type="time"]').first())
    await timeInput.fill('18:00')
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    await expect(page.getByText('Celebração para Deletar')).toBeVisible({ timeout: 8_000 })
    // Deleta
    const row = page.getByText('Celebração para Deletar').locator('..')
    await row.getByRole('button', { name: /excluir|deletar/i }).click()
    const confirmBtn = page.getByRole('button', { name: /confirmar|sim/i })
    if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await confirmBtn.click()
    }
    await expect(page.getByText('Celebração para Deletar')).not.toBeVisible({ timeout: 8_000 })
  })
})
