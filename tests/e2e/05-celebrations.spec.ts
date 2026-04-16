/**
 * Suite 05 — Celebrações / Eventos (CRUD)
 * Cobre: criação, edição, exclusão de celebrações
 *
 * NOTA: Fluxo de aprovação (pendente/aprovado) ainda não implementado na UI.
 * Quando implementado, descomentar os testes TC-041, TC-042 e TC-044.
 */
import { test, expect } from '@playwright/test'
import { loginAs, loadTestEnv } from './helpers/auth'

test.describe('Celebrações — CRUD', () => {
  // ── TC-040 ───────────────────────────────────────────────────────────
  test('TC-040 [+] Admin cria celebração com sucesso', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/celebrations')
    await page.getByRole('button', { name: /nova celebração/i }).click()
    await page.getByLabel(/título/i).fill('Missa de Domingo')
    await page.getByLabel(/data/i).fill('2026-05-04')
    await page.getByLabel(/horário/i).fill('10:00')
    await page.getByRole('button', { name: /^criar$/i }).click()
    await expect(page.getByText('Missa de Domingo')).toBeVisible({ timeout: 8_000 })
  })

  // ── TC-041 ───────────────────────────────────────────────────────────
  // TODO: Implementar fluxo de aprovação de celebrações
  test.skip('TC-041 [+] Coordenador cria celebração com status pendente', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.coordUser.email, env.coordUser.password)
    await page.goto('/celebrations')
    await page.getByRole('button', { name: /nova celebração/i }).click()
    await page.getByLabel(/título/i).fill('Retiro da Pastoral')
    await page.getByLabel(/data/i).fill('2026-05-11')
    await page.getByLabel(/horário/i).fill('09:00')
    await page.getByRole('button', { name: /^criar$/i }).click()
    await expect(page.getByText('Retiro da Pastoral')).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(/pendente/i)).toBeVisible({ timeout: 5_000 })
  })

  // ── TC-042 ───────────────────────────────────────────────────────────
  // TODO: Implementar fluxo de aprovação de celebrações
  test.skip('TC-042 [+] Admin aprova celebração pendente do coordenador', async ({ page }) => {
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
    await page.getByRole('button', { name: /nova celebração/i }).click()
    await page.getByLabel(/data/i).fill('2026-05-18')
    await page.getByRole('button', { name: /^criar$/i }).click()
    // HTML5 required — formulário não fecha
    await expect(page.getByLabel(/título/i)).toBeVisible()
  })

  // ── TC-044 ───────────────────────────────────────────────────────────
  // TODO: Implementar fluxo de aprovação — membro deve ver apenas celebrações aprovadas
  test.skip('TC-044 [+] Membro vê apenas celebrações aprovadas', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.memberUser.email, env.memberUser.password)
    await page.goto('/celebrations')
    await expect(page.getByText(/pendente/i)).not.toBeVisible()
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
    // Cria uma celebração para deletar
    await page.getByRole('button', { name: /nova celebração/i }).click()
    await page.getByLabel(/título/i).fill('Celebração para Deletar')
    await page.getByLabel(/data/i).fill('2026-06-01')
    await page.getByLabel(/horário/i).fill('18:00')
    await page.getByRole('button', { name: /^criar$/i }).click()
    await expect(page.getByText('Celebração para Deletar')).toBeVisible({ timeout: 8_000 })
    // Deleta
    const row = page.getByText('Celebração para Deletar').locator('..')
    await row.getByRole('button', { name: /excluir/i }).click()
    // Confirmação de exclusão
    await page.getByRole('button', { name: /confirmar/i }).click()
    await expect(page.getByText('Celebração para Deletar')).not.toBeVisible({ timeout: 8_000 })
  })
})
