# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-rbac.spec.ts >> RBAC — Controle de Acesso por Papel >> TC-010 [+] admin_sistema vê todos os itens do menu lateral
- Location: tests\e2e\02-rbac.spec.ts:10:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('aside nav').getByRole('link', { name: 'Dashboard' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('aside nav').getByRole('link', { name: 'Dashboard' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e5]: Paróquia+
      - generic [ref=e6]:
        - paragraph [ref=e7]: Admin Alpha
        - generic [ref=e8]: admin_sistema
      - navigation [ref=e9]
      - link "Sair" [ref=e11] [cursor=pointer]:
        - /url: /auth/signout
    - main [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]:
          - heading "Olá, Admin!" [level=1] [ref=e15]
          - paragraph [ref=e16]: quinta-feira, 16 de abril de 2026
        - generic [ref=e17]: Seu usuário ainda não está vinculado a um registro de membro.
  - region "Notifications alt+T"
  - alert [ref=e18]
```

# Test source

```ts
  1  | /**
  2  |  * Suite 02 — RBAC (Role-Based Access Control)
  3  |  * Cobre: acesso por papel, bloqueio de rotas, itens do menu por role
  4  |  */
  5  | import { test, expect } from '@playwright/test'
  6  | import { loginAs, logout, loadTestEnv } from './helpers/auth'
  7  | 
  8  | test.describe('RBAC — Controle de Acesso por Papel', () => {
  9  |   // ── TC-010 ───────────────────────────────────────────────────────────
  10 |   test('TC-010 [+] admin_sistema vê todos os itens do menu lateral', async ({ page }) => {
  11 |     const env = loadTestEnv()
  12 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  13 |     const nav = page.locator('aside nav')
> 14 |     await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible()
     |                                                                ^ Error: expect(locator).toBeVisible() failed
  15 |     await expect(nav.getByRole('link', { name: 'Pastorais' })).toBeVisible()
  16 |     await expect(nav.getByRole('link', { name: 'Membros' })).toBeVisible()
  17 |     await expect(nav.getByRole('link', { name: 'Celebrações' })).toBeVisible()
  18 |     await expect(nav.getByRole('link', { name: 'Escalas' })).toBeVisible()
  19 |     await expect(nav.getByRole('link', { name: 'Configurações' })).toBeVisible()
  20 |   })
  21 | 
  22 |   // ── TC-011 ───────────────────────────────────────────────────────────
  23 |   test('TC-011 [+] coordenador vê menu sem Pastorais e Configurações', async ({ page }) => {
  24 |     const env = loadTestEnv()
  25 |     await loginAs(page, env.coordUser.email, env.coordUser.password)
  26 |     const nav = page.locator('aside nav')
  27 |     await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  28 |     await expect(nav.getByRole('link', { name: 'Membros' })).toBeVisible()
  29 |     await expect(nav.getByRole('link', { name: 'Celebrações' })).toBeVisible()
  30 |     await expect(nav.getByRole('link', { name: 'Escalas' })).toBeVisible()
  31 |     // Restritos para coordenador
  32 |     await expect(nav.getByRole('link', { name: 'Pastorais' })).not.toBeVisible()
  33 |     await expect(nav.getByRole('link', { name: 'Configurações' })).not.toBeVisible()
  34 |   })
  35 | 
  36 |   // ── TC-012 ───────────────────────────────────────────────────────────
  37 |   test('TC-012 [+] membro vê apenas Dashboard e Escalas', async ({ page }) => {
  38 |     const env = loadTestEnv()
  39 |     await loginAs(page, env.memberUser.email, env.memberUser.password)
  40 |     const nav = page.locator('aside nav')
  41 |     await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  42 |     await expect(nav.getByRole('link', { name: 'Escalas' })).toBeVisible()
  43 |     await expect(nav.getByRole('link', { name: 'Pastorais' })).not.toBeVisible()
  44 |     await expect(nav.getByRole('link', { name: 'Membros' })).not.toBeVisible()
  45 |     await expect(nav.getByRole('link', { name: 'Configurações' })).not.toBeVisible()
  46 |   })
  47 | 
  48 |   // ── TC-013 ───────────────────────────────────────────────────────────
  49 |   test('TC-013 [sec] coordenador tentando acessar /pastorals via URL é redirecionado', async ({ page }) => {
  50 |     const env = loadTestEnv()
  51 |     await loginAs(page, env.coordUser.email, env.coordUser.password)
  52 |     await page.goto('/pastorals')
  53 |     // Deve redirecionar para dashboard (requireRole guard)
  54 |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 })
  55 |   })
  56 | 
  57 |   // ── TC-014 ───────────────────────────────────────────────────────────
  58 |   test('TC-014 [sec] membro tentando acessar /members via URL é redirecionado', async ({ page }) => {
  59 |     const env = loadTestEnv()
  60 |     await loginAs(page, env.memberUser.email, env.memberUser.password)
  61 |     await page.goto('/members')
  62 |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 })
  63 |   })
  64 | 
  65 |   // ── TC-015 ───────────────────────────────────────────────────────────
  66 |   test('TC-015 [sec] membro tentando acessar /settings via URL é redirecionado', async ({ page }) => {
  67 |     const env = loadTestEnv()
  68 |     await loginAs(page, env.memberUser.email, env.memberUser.password)
  69 |     await page.goto('/settings')
  70 |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 })
  71 |   })
  72 | 
  73 |   // ── TC-016 ───────────────────────────────────────────────────────────
  74 |   test('TC-016 [+] badge de role exibido corretamente na sidebar', async ({ page }) => {
  75 |     const env = loadTestEnv()
  76 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  77 |     await expect(page.locator('aside').getByText('Admin Sistema')).toBeVisible()
  78 |     await logout(page)
  79 | 
  80 |     await loginAs(page, env.coordUser.email, env.coordUser.password)
  81 |     await expect(page.locator('aside').getByText('Coordenador')).toBeVisible()
  82 |     await logout(page)
  83 | 
  84 |     await loginAs(page, env.memberUser.email, env.memberUser.password)
  85 |     await expect(page.locator('aside').getByText('Membro')).toBeVisible()
  86 |   })
  87 | })
  88 | 
```