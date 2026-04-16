/**
 * Suite 03 — Pastorais (CRUD)
 * Cobre: criação, listagem, edição, exclusão de pastorais
 */
import { test, expect } from '@playwright/test'
import { loginAs, loadTestEnv } from './helpers/auth'

test.describe('Pastorais — CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/pastorals')
  })

  // ── TC-020 ───────────────────────────────────────────────────────────
  test('TC-020 [+] Admin vê a pastoral base criada no setup', async ({ page }) => {
    const env = loadTestEnv()
    await expect(page.getByText(env.pastoral1.name)).toBeVisible()
  })

  // ── TC-021 ───────────────────────────────────────────────────────────
  test('TC-021 [+] Admin cria nova pastoral com sucesso', async ({ page }) => {
    await page.getByRole('button', { name: /nova pastoral/i }).click()
    await page.getByLabel(/nome/i).fill('Pastoral da Catequese')
    await page.getByRole('button', { name: /criar pastoral/i }).click()
    await expect(page.getByText('Pastoral da Catequese')).toBeVisible({ timeout: 8_000 })
  })

  // ── TC-022 ───────────────────────────────────────────────────────────
  test('TC-022 [-] Criar pastoral com nome vazio é bloqueado', async ({ page }) => {
    await page.getByRole('button', { name: /nova pastoral/i }).click()
    await page.getByRole('button', { name: /criar pastoral/i }).click()
    // HTML5 required — formulário não fecha, campo permanece visível
    await expect(page.getByLabel(/nome/i)).toBeVisible()
  })

  // ── TC-023 ───────────────────────────────────────────────────────────
  test('TC-023 [+] Admin edita nome de uma pastoral existente', async ({ page }) => {
    const env = loadTestEnv()
    // Clica em editar na pastoral base
    const row = page.getByText(env.pastoral1.name).locator('..')
    await row.getByRole('button', { name: /editar/i }).click()
    await page.getByLabel(/nome/i).fill('Pastoral da Liturgia (atualizada)')
    await page.getByRole('button', { name: /salvar/i }).click()
    await expect(page.getByText('Pastoral da Liturgia (atualizada)')).toBeVisible({ timeout: 8_000 })
    // Restaura nome original para outros testes
    const updatedRow = page.getByText('Pastoral da Liturgia (atualizada)').locator('..')
    await updatedRow.getByRole('button', { name: /editar/i }).click()
    await page.getByLabel(/nome/i).fill(env.pastoral1.name)
    await page.getByRole('button', { name: /salvar/i }).click()
  })
})
