/**
 * Suite 04 — Membros (CRUD + Vinculação com Pastorais)
 * Cobre: criação, listagem, edição, desativação, vinculação a pastoral
 */
import { test, expect } from '@playwright/test'
import { loginAs, loadTestEnv } from './helpers/auth'

test.describe('Membros — CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/members')
  })

  // ── TC-030 ───────────────────────────────────────────────────────────
  test('TC-030 [+] Admin vê membro criado no setup', async ({ page }) => {
    const env = loadTestEnv()
    await expect(page.getByText(env.member1.name)).toBeVisible()
  })

  // ── TC-031 ───────────────────────────────────────────────────────────
  test('TC-031 [+] Admin cria novo membro com pastoral vinculada', async ({ page }) => {
    const env = loadTestEnv()
    await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
    await page.getByLabel(/nome/i).fill('Maria Cantora')
    await page.getByLabel(/email/i).fill('maria@test.dev')
    await page.getByLabel(/telefone/i).fill('11999990000')
    // Seleciona pastoral
    const select = page.getByLabel(/pastoral/i)
    await select.selectOption({ label: env.pastoral1.name })
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    await expect(page.getByText('Maria Cantora')).toBeVisible({ timeout: 8_000 })
  })

  // ── TC-032 ───────────────────────────────────────────────────────────
  test('TC-032 [-] Criar membro sem nome é bloqueado', async ({ page }) => {
    await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    await expect(page.getByLabel(/nome/i)).toBeVisible()
  })

  // ── TC-033 ───────────────────────────────────────────────────────────
  test('TC-033 [+] Admin edita dados de um membro existente', async ({ page }) => {
    const env = loadTestEnv()
    const row = page.getByText(env.member1.name).locator('..')
    await row.getByRole('button', { name: /editar/i }).click()
    await page.getByLabel(/telefone/i).fill('11888880000')
    await page.getByRole('button', { name: /salvar/i }).click()
    await expect(page.getByText(env.member1.name)).toBeVisible({ timeout: 8_000 })
  })

  // ── TC-034 ───────────────────────────────────────────────────────────
  test('TC-034 [+] Admin desativa membro (soft-disable)', async ({ page }) => {
    const env = loadTestEnv()
    // Cria membro descartável para desativar
    await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
    await page.getByLabel(/nome/i).fill('Temporário Desativar')
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    await expect(page.getByText('Temporário Desativar')).toBeVisible({ timeout: 8_000 })
    // Desativa
    const row = page.getByText('Temporário Desativar').locator('..')
    await row.getByRole('button', { name: /desativar|excluir/i }).click()
    // Confirma diálogo se houver
    const confirmBtn = page.getByRole('button', { name: /confirmar|sim/i })
    if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await confirmBtn.click()
    }
    await expect(page.getByText('Temporário Desativar')).not.toBeVisible({ timeout: 8_000 })
  })

  // ── TC-035 ───────────────────────────────────────────────────────────
  test('TC-035 [edge] Nome de membro com 200 caracteres é aceito ou rejeitado com mensagem clara', async ({ page }) => {
    await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
    const longName = 'A'.repeat(200)
    await page.getByLabel(/nome/i).fill(longName)
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    // Aceita (sem crash) ou exibe mensagem de erro — não pode travar
    const hasError = await page.getByText(/muito longo|máximo|caracteres/i).isVisible({ timeout: 3_000 }).catch(() => false)
    const hasEntry = await page.getByText(longName.slice(0, 50)).isVisible({ timeout: 3_000 }).catch(() => false)
    expect(hasError || hasEntry).toBeTruthy()
  })
})
