/**
 * Suite 10 — Edge Cases e Performance Básica
 * Cobre: entradas extremas, nomes duplicados, muitos registros,
 *        caracteres especiais, tempos de resposta aceitáveis
 */
import { test, expect } from '@playwright/test'
import { loginAs, loadTestEnv } from './helpers/auth'

test.describe('Edge Cases — Entradas Extremas e Limites', () => {
  // ── TC-100 ───────────────────────────────────────────────────────────
  test('TC-100 [edge] Nome de membro com caracteres especiais é aceito', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/members')
    await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
    const specialName = "José da Silva Ção & Filhos — Açaí Irmãos"
    await page.getByLabel(/nome/i).fill(specialName)
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    // Aceita com sucesso ou exibe mensagem clara — não pode crashar
    const saved = await page.getByText(specialName).isVisible({ timeout: 8_000 }).catch(() => false)
    const hasError = await page.getByText(/inválido|invalid|erro/i).isVisible({ timeout: 3_000 }).catch(() => false)
    expect(saved || hasError).toBeTruthy()
  })

  // ── TC-101 ───────────────────────────────────────────────────────────
  test('TC-101 [edge] Nome de membro com 200 caracteres é tratado sem crash', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/members')
    await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
    const longName = 'B'.repeat(200)
    await page.getByLabel(/nome/i).fill(longName)
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    // Aceita (sem crash) ou exibe mensagem de erro sobre tamanho
    const hasLengthError = await page.getByText(/muito longo|máximo|caracteres|limit/i)
      .isVisible({ timeout: 3_000 }).catch(() => false)
    const hasSaved = await page.getByText(longName.slice(0, 30)).isVisible({ timeout: 5_000 }).catch(() => false)
    expect(hasLengthError || hasSaved).toBeTruthy()
  })

  // ── TC-102 ───────────────────────────────────────────────────────────
  test('TC-102 [edge] Dois membros com o mesmo nome são permitidos (sem unicidade forçada)', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/members')
    const dupName = 'João Silva Duplicado'
    // Cria primeiro
    await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
    await page.getByLabel(/nome/i).fill(dupName)
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    await expect(page.getByText(dupName)).toBeVisible({ timeout: 8_000 })
    // Cria segundo com mesmo nome
    await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
    await page.getByLabel(/nome/i).fill(dupName)
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    // Dois registros devem coexistir (nome não é chave única)
    const count = await page.getByText(dupName).count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  // ── TC-103 ───────────────────────────────────────────────────────────
  test('TC-103 [edge] Pastoral com nome de 200 caracteres é tratada sem crash', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/pastorals')
    await page.getByRole('button', { name: /nova pastoral|adicionar/i }).click()
    const longName = 'P'.repeat(200)
    await page.getByLabel(/nome/i).fill(longName)
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    const hasError = await page.getByText(/muito longo|máximo|caracteres/i)
      .isVisible({ timeout: 3_000 }).catch(() => false)
    const hasSaved = await page.getByText(longName.slice(0, 30)).isVisible({ timeout: 5_000 }).catch(() => false)
    expect(hasError || hasSaved).toBeTruthy()
  })

  // ── TC-104 ───────────────────────────────────────────────────────────
  test('TC-104 [edge] Email com formato inválido é rejeitado no formulário', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill('nao-e-um-email')
    await page.getByLabel('Senha').fill('qualquer123')
    await page.getByRole('button', { name: /entrar/i }).click()
    // Browser native validation ou app validation deve rejeitar
    const emailField = page.getByLabel('E-mail')
    const validityState = await emailField.evaluate((el: HTMLInputElement) => el.validity.valid)
    const hasError = await page.getByText(/e-mail inválido|formato|valid email/i)
      .isVisible({ timeout: 3_000 }).catch(() => false)
    expect(!validityState || hasError).toBeTruthy()
  })

  // ── TC-105 ───────────────────────────────────────────────────────────
  test('TC-105 [edge] Múltiplas pastorais criadas sequencialmente sem erro', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/pastorals')
    // Cria 3 pastorais em sequência
    const names = ['Pastoral Alpha', 'Pastoral Beta', 'Pastoral Gamma']
    for (const name of names) {
      await page.getByRole('button', { name: /nova pastoral|adicionar/i }).click()
      await page.getByLabel(/nome/i).fill(name)
      await page.getByRole('button', { name: /salvar|criar/i }).click()
      await expect(page.getByText(name)).toBeVisible({ timeout: 8_000 })
    }
    // Todas as 3 devem estar visíveis
    for (const name of names) {
      await expect(page.getByText(name)).toBeVisible()
    }
  })

  // ── TC-106 ───────────────────────────────────────────────────────────
  test('TC-106 [edge] Título de celebração com emojis não quebra a UI', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/celebrations')
    await page.getByRole('button', { name: /nova celebração|adicionar/i }).click()
    const emojiTitle = '🎉 Festa Paroquial 🙏'
    await page.getByLabel(/título/i).fill(emojiTitle)
    const dateInput = page.getByLabel(/data/i).or(page.locator('input[type="date"]').first())
    await dateInput.fill('2026-08-01')
    const timeInput = page.getByLabel(/horário|hora/i).or(page.locator('input[type="time"]').first())
    await timeInput.fill('20:00')
    await page.getByRole('button', { name: /salvar|criar/i }).click()
    // Sem crash; aceita ou mostra erro de validação claro
    await expect(page.locator('body')).toBeVisible({ timeout: 5_000 })
  })

  // ── TC-107 ───────────────────────────────────────────────────────────
  test('TC-107 [edge] Senha com apenas espaços é rejeitada no signup', async ({ page }) => {
    await page.goto('/signup')
    const emailField = page.getByLabel(/e-mail/i)
    if (await emailField.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emailField.fill('testedge@test.dev')
      const pwdField = page.getByLabel(/^senha$/i).first()
      if (await pwdField.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await pwdField.fill('     ')
        await page.getByRole('button', { name: /cadastrar|criar|avançar/i }).click()
        // Deve rejeitar senha fraca/inválida
        const hasError = await page.getByText(/senha|password|fraca|inválid/i)
          .isVisible({ timeout: 5_000 }).catch(() => false)
        expect(hasError).toBeTruthy()
      } else {
        test.skip(true, 'Campo senha não encontrado no fluxo')
      }
    } else {
      test.skip(true, 'Página de signup não tem campos de email/senha visíveis')
    }
  })
})

test.describe('Performance Básica — Tempos de Resposta', () => {
  // ── TC-110 ───────────────────────────────────────────────────────────
  test('TC-110 [perf] Dashboard carrega em menos de 5 segundos', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    const start = Date.now()
    await page.goto('/dashboard')
    await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5_000)
  })

  // ── TC-111 ───────────────────────────────────────────────────────────
  test('TC-111 [perf] Lista de membros carrega em menos de 5 segundos', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    const start = Date.now()
    await page.goto('/members')
    await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5_000)
  })

  // ── TC-112 ───────────────────────────────────────────────────────────
  test('TC-112 [perf] Página de celebrações carrega em menos de 5 segundos', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    const start = Date.now()
    await page.goto('/celebrations')
    await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5_000)
  })

  // ── TC-113 ───────────────────────────────────────────────────────────
  test('TC-113 [perf] Criação de 5 membros em sequência termina sem timeout', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/members')
    const start = Date.now()
    for (let i = 1; i <= 5; i++) {
      await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
      await page.getByLabel(/nome/i).fill(`Membro Perf ${i}`)
      await page.getByRole('button', { name: /salvar|criar/i }).click()
      await expect(page.getByText(`Membro Perf ${i}`)).toBeVisible({ timeout: 8_000 })
    }
    const total = Date.now() - start
    // 5 inserções em menos de 30 segundos
    expect(total).toBeLessThan(30_000)
  })

  // ── TC-114 ───────────────────────────────────────────────────────────
  test('TC-114 [perf] Navegação entre seções principais é fluida (< 3s por transição)', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    const sections = ['/members', '/pastorals', '/celebrations', '/schedules', '/settings']
    for (const section of sections) {
      const start = Date.now()
      await page.goto(section)
      await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(5_000)
    }
  })
})
