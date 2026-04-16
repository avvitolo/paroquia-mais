/**
 * Suite 02 — RBAC (Role-Based Access Control)
 * Cobre: acesso por papel, bloqueio de rotas, itens do menu por role
 */
import { test, expect } from '@playwright/test'
import { loginAs, logout, loadTestEnv } from './helpers/auth'

test.describe('RBAC — Controle de Acesso por Papel', () => {
  // ── TC-010 ───────────────────────────────────────────────────────────
  test('TC-010 [+] admin_sistema vê todos os itens do menu lateral', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    const nav = page.locator('aside nav')
    await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Pastorais' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Membros' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Celebrações' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Escalas' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Configurações' })).toBeVisible()
  })

  // ── TC-011 ───────────────────────────────────────────────────────────
  test('TC-011 [+] coordenador vê menu sem Pastorais e Configurações', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.coordUser.email, env.coordUser.password)
    const nav = page.locator('aside nav')
    await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Membros' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Celebrações' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Escalas' })).toBeVisible()
    // Restritos para coordenador
    await expect(nav.getByRole('link', { name: 'Pastorais' })).not.toBeVisible()
    await expect(nav.getByRole('link', { name: 'Configurações' })).not.toBeVisible()
  })

  // ── TC-012 ───────────────────────────────────────────────────────────
  test('TC-012 [+] membro vê apenas Dashboard e Escalas', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.memberUser.email, env.memberUser.password)
    const nav = page.locator('aside nav')
    await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Escalas' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Pastorais' })).not.toBeVisible()
    await expect(nav.getByRole('link', { name: 'Membros' })).not.toBeVisible()
    await expect(nav.getByRole('link', { name: 'Configurações' })).not.toBeVisible()
  })

  // ── TC-013 ───────────────────────────────────────────────────────────
  test('TC-013 [sec] coordenador tentando acessar /pastorals via URL é redirecionado', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.coordUser.email, env.coordUser.password)
    await page.goto('/pastorals')
    // Deve redirecionar para dashboard (requireRole guard)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 })
  })

  // ── TC-014 ───────────────────────────────────────────────────────────
  test('TC-014 [sec] membro tentando acessar /members via URL é redirecionado', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.memberUser.email, env.memberUser.password)
    await page.goto('/members')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 })
  })

  // ── TC-015 ───────────────────────────────────────────────────────────
  test('TC-015 [sec] membro tentando acessar /settings via URL é redirecionado', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.memberUser.email, env.memberUser.password)
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 })
  })

  // ── TC-016 ───────────────────────────────────────────────────────────
  test('TC-016 [+] badge de role exibido corretamente na sidebar', async ({ page }) => {
    const env = loadTestEnv()
    await loginAs(page, env.adminUser.email, env.adminUser.password)
    await expect(page.locator('aside').getByText('Admin Sistema')).toBeVisible()
    await logout(page)

    await loginAs(page, env.coordUser.email, env.coordUser.password)
    await expect(page.locator('aside').getByText('Coordenador')).toBeVisible()
    await logout(page)

    await loginAs(page, env.memberUser.email, env.memberUser.password)
    await expect(page.locator('aside').getByText('Membro')).toBeVisible()
  })
})
