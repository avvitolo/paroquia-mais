/**
 * Helpers de autenticação para os testes E2E.
 * Realiza login via UI e retorna a page autenticada.
 */
import { Page, expect } from '@playwright/test'

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: /entrar/i }).click()
  // Aguarda navegação para o dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
}

export async function logout(page: Page) {
  await page.goto('/auth/signout')
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
}

/** Lê o estado de fixtures gerado pelo global.setup.ts */
export function loadTestEnv() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../.test-env.json') as {
    parish1:   { id: string; name: string }
    parish2:   { id: string; name: string }
    adminUser: { email: string; password: string; parishId: string }
    coordUser: { email: string; password: string; parishId: string }
    memberUser:{ email: string; password: string; parishId: string }
    adminUser2:{ email: string; password: string; parishId: string }
    pastoral1: { id: string; name: string }
    member1:   { id: string; name: string }
  }
}
