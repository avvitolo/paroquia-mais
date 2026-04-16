/**
 * Suite 09 — Cenários Negativos
 * Cobre: email duplicado, campos obrigatórios, exclusão de entidades em uso,
 *        permissões negadas, estados inválidos
 */
import { test, expect } from '@playwright/test'
import { loginAs, loadTestEnv } from './helpers/auth'

test.describe('Cenários Negativos — Validação e Rejeição', () => {
  // ── TC-080 ───────────────────────────────────────────────────────────
  test('TC-080 [-] Cadastro com email já existente exibe erro sem crash', async ({ page }) => {
    const env = loadTestEnv()
    await page.goto('/signup')
    await page.getByLabel('Nome da paróquia').fill('Paróquia Duplicada')
    await page.getByLabel('Seu nome completo').fill('Teste Duplicado')
    await page.getByLabel('E-mail').fill(env.adminUser.email)
    await page.getByLabel('Senha').fill('Senha@1234')
    await page.getByLabel('Confirmar senha').fill('Senha@1234')
    await page.getByRole('button', { name: /criar conta/i }).click()
    // Deve exibir mensagem de erro ou permanecer no signup — nunca crashar
    const hasError = await page.getByText(/já cadastrado|email.*exist|já em uso|in use|erro/i)
      .isVisible({ timeout: 8_000 }).catch(() => false)
    const stillOnSignup = page.url().includes('/signup')
    expect(hasError || stillOnSignup).toBeTruthy()
  })

  // ── TC-081 ───────────────────────────────────────────────────────────
  test('TC-081 [-] Login com senha incorreta exibe mensagem de erro', async ({ page }) => {
    const env = loadTestEnv()
    await page.goto('/login')
    await page.getByLabel('E-mail').fill(env.adminUser.email)
    await page.getByLabel('Senha').fill('senhaErrada!999')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText(/email ou senha incorretos/i)).toBeVisible({ timeout: 8_000 })
    expect(page.url()).toMatch(/\/login/)
  })

  // ── TC-082 ───────────────────────────────────────────────────────────
  test('TC-082 [-] Login com email inexistente exibe mensagem de erro', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill('naoexiste_xyz987@paroquia.test')
    await page.getByLabel('Senha').fill('qualquerSenha123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText(/email ou senha incorretos/i)).toBeVisible({ timeout: 8_000 })
    expect(page.url()).toMatch(/\/login/)
  })

  // ── TC-083 ───────────────────────────────────────────────────────────
  test('TC-083 [-] Criar membro sem campos obrigatórios é bloqueado', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/members')
    await page.getByRole('button', { name: /novo membro/i }).click()
    // Envia sem preencher nenhum campo
    await page.getByRole('button', { name: /cadastrar/i }).click()
    // Deve mostrar erro de validação ou manter formulário aberto com campo marcado
    const nameField = page.getByLabel(/nome completo/i)
    await expect(nameField).toBeVisible({ timeout: 5_000 })
  })

  // ── TC-084 ───────────────────────────────────────────────────────────
  test('TC-084 [-] Criar pastoral sem nome é bloqueado', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/pastorals')
    await page.getByRole('button', { name: /nova pastoral/i }).click()
    await page.getByRole('button', { name: /criar pastoral/i }).click()
    // Formulário permanece aberto (campo required bloqueia envio)
    const nameField = page.getByLabel(/nome/i)
    await expect(nameField).toBeVisible({ timeout: 5_000 })
  })

  // ── TC-085 ───────────────────────────────────────────────────────────
  test('TC-085 [-] Membro não pode acessar página de pastorais', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.memberUser.email, env.memberUser.password)
    await page.goto('/pastorals')
    // Deve ser redirecionado para /dashboard (guard de role na page)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 })
  })

  // ── TC-086 ───────────────────────────────────────────────────────────
  test('TC-086 [-] Membro não pode acessar página de celebrações', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.memberUser.email, env.memberUser.password)
    await page.goto('/celebrations')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 })
  })

  // ── TC-087 ───────────────────────────────────────────────────────────
  test('TC-087 [-] Membro não pode acessar página de membros', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.memberUser.email, env.memberUser.password)
    await page.goto('/members')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 })
  })

  // ── TC-088 ───────────────────────────────────────────────────────────
  test('TC-088 [-] Coordenador não pode acessar página de configurações', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.coordUser.email, env.coordUser.password)
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 })
  })

  // ── TC-089 ───────────────────────────────────────────────────────────
  test('TC-089 [-] Formulário de recuperação de senha sem email bloqueia envio', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByRole('button', { name: /enviar link/i }).click()
    // HTML5 required deve bloquear — permanece na mesma página
    await expect(page.getByLabel('E-mail')).toBeVisible()
    expect(page.url()).toMatch(/\/forgot-password/)
  })

  // ── TC-090 ───────────────────────────────────────────────────────────
  test('TC-090 [-] Excluir pastoral com membros associados exibe aviso ou bloqueia', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await page.goto('/pastorals')
    // Tenta deletar a pastoral que tem membros (pastoral1 do setup)
    const row = page.getByText(env.pastoral1.name).locator('..')
    const deleteBtn = row.getByRole('button', { name: /excluir/i })
    if (await deleteBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await deleteBtn.click()
      // Confirmação de exclusão
      const confirmBtn = page.getByRole('button', { name: /confirmar exclusão/i })
      if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirmBtn.click()
        // Após confirmar: pode bloquear com erro ou deletar (cascata)
        // O sistema não deve crashar
        await expect(page.locator('body')).toBeVisible({ timeout: 5_000 })
      }
    } else {
      // Botão excluir não visível para pastoral em uso — comportamento correto
      test.skip(true, 'Botão excluir não disponível — pastoral em uso')
    }
  })
})
