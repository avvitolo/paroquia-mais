# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-pastorals.spec.ts >> Pastorais — CRUD >> TC-023 [+] Admin edita nome de uma pastoral existente
- Location: tests\e2e\03-pastorals.spec.ts:38:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText('Pastoral da Liturgia').locator('..').getByRole('button', { name: /editar/i })

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
      - generic [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]:
            - heading "Pastorais" [level=1] [ref=e17]
            - paragraph [ref=e18]: 1 pastoral
          - button "+ Nova Pastoral" [ref=e19]
        - generic [ref=e22]:
          - generic [ref=e23]:
            - heading "Pastoral da Liturgia" [level=3] [ref=e24]
            - paragraph [ref=e25]: 0 função(ões) cadastrada(s)
          - generic [ref=e26]:
            - button "Funções" [ref=e27]
            - button "Editar" [ref=e28]
            - button "Excluir" [ref=e29]
  - region "Notifications alt+T"
  - alert [ref=e30]
```

# Test source

```ts
  1  | /**
  2  |  * Suite 03 — Pastorais (CRUD)
  3  |  * Cobre: criação, listagem, edição, exclusão de pastorais
  4  |  */
  5  | import { test, expect } from '@playwright/test'
  6  | import { loginAs, loadTestEnv } from './helpers/auth'
  7  | 
  8  | test.describe('Pastorais — CRUD', () => {
  9  |   test.beforeEach(async ({ page }) => {
  10 |     const env = loadTestEnv()
  11 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  12 |     await page.goto('/pastorals')
  13 |   })
  14 | 
  15 |   // ── TC-020 ───────────────────────────────────────────────────────────
  16 |   test('TC-020 [+] Admin vê a pastoral base criada no setup', async ({ page }) => {
  17 |     const env = loadTestEnv()
  18 |     await expect(page.getByText(env.pastoral1.name)).toBeVisible()
  19 |   })
  20 | 
  21 |   // ── TC-021 ───────────────────────────────────────────────────────────
  22 |   test('TC-021 [+] Admin cria nova pastoral com sucesso', async ({ page }) => {
  23 |     await page.getByRole('button', { name: /nova pastoral|adicionar/i }).click()
  24 |     await page.getByLabel(/nome/i).fill('Pastoral da Catequese')
  25 |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  26 |     await expect(page.getByText('Pastoral da Catequese')).toBeVisible({ timeout: 8_000 })
  27 |   })
  28 | 
  29 |   // ── TC-022 ───────────────────────────────────────────────────────────
  30 |   test('TC-022 [-] Criar pastoral com nome vazio é bloqueado', async ({ page }) => {
  31 |     await page.getByRole('button', { name: /nova pastoral|adicionar/i }).click()
  32 |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  33 |     // Formulário não deve fechar — permanece com campo vazio
  34 |     await expect(page.getByLabel(/nome/i)).toBeVisible()
  35 |   })
  36 | 
  37 |   // ── TC-023 ───────────────────────────────────────────────────────────
  38 |   test('TC-023 [+] Admin edita nome de uma pastoral existente', async ({ page }) => {
  39 |     const env = loadTestEnv()
  40 |     // Clica em editar na pastoral base
  41 |     const row = page.getByText(env.pastoral1.name).locator('..')
> 42 |     await row.getByRole('button', { name: /editar/i }).click()
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  43 |     await page.getByLabel(/nome/i).fill('Pastoral da Liturgia (atualizada)')
  44 |     await page.getByRole('button', { name: /salvar/i }).click()
  45 |     await expect(page.getByText('Pastoral da Liturgia (atualizada)')).toBeVisible({ timeout: 8_000 })
  46 |     // Restaura nome original para outros testes
  47 |     const updatedRow = page.getByText('Pastoral da Liturgia (atualizada)').locator('..')
  48 |     await updatedRow.getByRole('button', { name: /editar/i }).click()
  49 |     await page.getByLabel(/nome/i).fill(env.pastoral1.name)
  50 |     await page.getByRole('button', { name: /salvar/i }).click()
  51 |   })
  52 | })
  53 | 
```