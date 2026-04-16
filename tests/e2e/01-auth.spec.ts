/**
 * Suite 01 — Autenticação
 * Cobre: cadastro, login, logout, recuperação de senha
 */
import { test, expect } from '@playwright/test'
import { loginAs, loadTestEnv } from './helpers/auth'

test.describe('Autenticação', () => {
  // ── TC-001 ───────────────────────────────────────────────────────────
  test('TC-001 [+] Login válido redireciona para /dashboard', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText('Paróquia+')).toBeVisible()
  })

  // ── TC-002 ───────────────────────────────────────────────────────────
  test('TC-002 [-] Login com senha errada exibe mensagem de erro', async ({ page }) => {
    const env = loadTestEnv()
    await page.goto('/login')
    await page.getByLabel('E-mail').fill(env.adminUser.email)
    await page.getByLabel('Senha').fill('senhaErrada!')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText(/email ou senha incorretos/i)).toBeVisible({ timeout: 8_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  // ── TC-003 ───────────────────────────────────────────────────────────
  test('TC-003 [-] Login com email inexistente exibe mensagem de erro', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill('naoexiste@paroquia-test.dev')
    await page.getByLabel('Senha').fill('qualquercoisa')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText(/email ou senha incorretos/i)).toBeVisible({ timeout: 8_000 })
  })

  // ── TC-004 ───────────────────────────────────────────────────────────
  test('TC-004 [-] Campos vazios bloqueiam submissão do formulário', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /entrar/i }).click()
    // HTML5 required — permanece na mesma página
    await expect(page).toHaveURL(/\/login/)
  })

  // ── TC-005 ───────────────────────────────────────────────────────────
  test('TC-005 [+] Logout encerra sessão e redireciona para /login', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/auth/signout')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
    // Tenta acessar dashboard após logout — deve redirecionar
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  // ── TC-006 ───────────────────────────────────────────────────────────
  test('TC-006 [sec] Acesso direto ao dashboard sem login redireciona para /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  // ── TC-007 ───────────────────────────────────────────────────────────
  test('TC-007 [+] Página de cadastro exibe campos de senha', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByLabel('Nome da paróquia')).toBeVisible()
    await expect(page.getByLabel('Seu nome completo')).toBeVisible()
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.getByLabel('Senha')).toBeVisible()
    await expect(page.getByLabel('Confirmar senha')).toBeVisible()
  })

  // ── TC-008 ───────────────────────────────────────────────────────────
  test('TC-008 [-] Cadastro com senhas diferentes exibe erro de validação', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('Nome da paróquia').fill('Paróquia Inválida')
    await page.getByLabel('Seu nome completo').fill('Teste Usuário')
    await page.getByLabel('E-mail').fill('novo@paroquia-test.dev')
    await page.getByLabel('Senha').fill('Senha@123')
    await page.getByLabel('Confirmar senha').fill('Senha@999')
    await page.getByRole('button', { name: /criar conta/i }).click()
    await expect(page.getByText(/senhas não coincidem/i)).toBeVisible({ timeout: 5_000 })
  })

  // ── TC-009 ───────────────────────────────────────────────────────────
  test('TC-009 [+] Página de recuperação de senha aceita email válido', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByLabel('E-mail').fill('qualquer@email.com')
    await page.getByRole('button', { name: /enviar link/i }).click()
    // Página deve mostrar confirmação (não importa se email existe ou não)
    await expect(page.getByText(/email enviado/i)).toBeVisible({ timeout: 10_000 })
  })
})
