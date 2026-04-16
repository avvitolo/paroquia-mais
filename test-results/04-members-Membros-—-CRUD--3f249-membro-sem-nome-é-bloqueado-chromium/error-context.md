# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-members.spec.ts >> Membros — CRUD >> TC-032 [-] Criar membro sem nome é bloqueado
- Location: tests\e2e\04-members.spec.ts:36:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /salvar|criar/i })

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
            - heading "Membros" [level=1] [ref=e17]
            - paragraph [ref=e18]: 1 membro(s)
          - button "Ver inativos" [ref=e20]
        - generic [ref=e21]:
          - heading "Novo Membro" [level=2] [ref=e22]
          - generic [ref=e23]:
            - generic [ref=e24]:
              - generic [ref=e25]: Nome completo *
              - textbox "Nome completo *" [ref=e26]:
                - /placeholder: Maria Aparecida
            - generic [ref=e27]:
              - generic [ref=e28]: E-mail
              - textbox "E-mail" [ref=e29]:
                - /placeholder: maria@email.com
            - generic [ref=e30]:
              - generic [ref=e31]: Telefone
              - textbox "Telefone" [ref=e32]:
                - /placeholder: (11) 99999-9999
            - generic [ref=e33]:
              - generic [ref=e34]: Pastoral
              - combobox "Pastoral" [ref=e35]:
                - option "Sem pastoral" [selected]
                - option "Pastoral da Liturgia"
          - generic [ref=e36]:
            - button "Cadastrar" [ref=e37]
            - button "Cancelar" [ref=e38]
        - generic [ref=e41]:
          - generic [ref=e42]:
            - paragraph [ref=e43]: João Acólito
            - paragraph [ref=e44]: Pastoral da Liturgia · joao@test.dev
          - generic [ref=e45]:
            - button "Indisponibilidades" [ref=e46]
            - button "Editar" [ref=e47]
            - button "Desativar" [ref=e48]
            - button "Excluir" [ref=e49]
  - region "Notifications alt+T"
  - alert [ref=e50]
```

# Test source

```ts
  1  | /**
  2  |  * Suite 04 — Membros (CRUD + Vinculação com Pastorais)
  3  |  * Cobre: criação, listagem, edição, desativação, vinculação a pastoral
  4  |  */
  5  | import { test, expect } from '@playwright/test'
  6  | import { loginAs, loadTestEnv } from './helpers/auth'
  7  | 
  8  | test.describe('Membros — CRUD', () => {
  9  |   test.beforeEach(async ({ page }) => {
  10 |     const env = loadTestEnv()
  11 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  12 |     await page.goto('/members')
  13 |   })
  14 | 
  15 |   // ── TC-030 ───────────────────────────────────────────────────────────
  16 |   test('TC-030 [+] Admin vê membro criado no setup', async ({ page }) => {
  17 |     const env = loadTestEnv()
  18 |     await expect(page.getByText(env.member1.name)).toBeVisible()
  19 |   })
  20 | 
  21 |   // ── TC-031 ───────────────────────────────────────────────────────────
  22 |   test('TC-031 [+] Admin cria novo membro com pastoral vinculada', async ({ page }) => {
  23 |     const env = loadTestEnv()
  24 |     await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
  25 |     await page.getByLabel(/nome/i).fill('Maria Cantora')
  26 |     await page.getByLabel(/email/i).fill('maria@test.dev')
  27 |     await page.getByLabel(/telefone/i).fill('11999990000')
  28 |     // Seleciona pastoral
  29 |     const select = page.getByLabel(/pastoral/i)
  30 |     await select.selectOption({ label: env.pastoral1.name })
  31 |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  32 |     await expect(page.getByText('Maria Cantora')).toBeVisible({ timeout: 8_000 })
  33 |   })
  34 | 
  35 |   // ── TC-032 ───────────────────────────────────────────────────────────
  36 |   test('TC-032 [-] Criar membro sem nome é bloqueado', async ({ page }) => {
  37 |     await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
> 38 |     await page.getByRole('button', { name: /salvar|criar/i }).click()
     |                                                               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  39 |     await expect(page.getByLabel(/nome/i)).toBeVisible()
  40 |   })
  41 | 
  42 |   // ── TC-033 ───────────────────────────────────────────────────────────
  43 |   test('TC-033 [+] Admin edita dados de um membro existente', async ({ page }) => {
  44 |     const env = loadTestEnv()
  45 |     const row = page.getByText(env.member1.name).locator('..')
  46 |     await row.getByRole('button', { name: /editar/i }).click()
  47 |     await page.getByLabel(/telefone/i).fill('11888880000')
  48 |     await page.getByRole('button', { name: /salvar/i }).click()
  49 |     await expect(page.getByText(env.member1.name)).toBeVisible({ timeout: 8_000 })
  50 |   })
  51 | 
  52 |   // ── TC-034 ───────────────────────────────────────────────────────────
  53 |   test('TC-034 [+] Admin desativa membro (soft-disable)', async ({ page }) => {
  54 |     const env = loadTestEnv()
  55 |     // Cria membro descartável para desativar
  56 |     await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
  57 |     await page.getByLabel(/nome/i).fill('Temporário Desativar')
  58 |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  59 |     await expect(page.getByText('Temporário Desativar')).toBeVisible({ timeout: 8_000 })
  60 |     // Desativa
  61 |     const row = page.getByText('Temporário Desativar').locator('..')
  62 |     await row.getByRole('button', { name: /desativar|excluir/i }).click()
  63 |     // Confirma diálogo se houver
  64 |     const confirmBtn = page.getByRole('button', { name: /confirmar|sim/i })
  65 |     if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
  66 |       await confirmBtn.click()
  67 |     }
  68 |     await expect(page.getByText('Temporário Desativar')).not.toBeVisible({ timeout: 8_000 })
  69 |   })
  70 | 
  71 |   // ── TC-035 ───────────────────────────────────────────────────────────
  72 |   test('TC-035 [edge] Nome de membro com 200 caracteres é aceito ou rejeitado com mensagem clara', async ({ page }) => {
  73 |     await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
  74 |     const longName = 'A'.repeat(200)
  75 |     await page.getByLabel(/nome/i).fill(longName)
  76 |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  77 |     // Aceita (sem crash) ou exibe mensagem de erro — não pode travar
  78 |     const hasError = await page.getByText(/muito longo|máximo|caracteres/i).isVisible({ timeout: 3_000 }).catch(() => false)
  79 |     const hasEntry = await page.getByText(longName.slice(0, 50)).isVisible({ timeout: 3_000 }).catch(() => false)
  80 |     expect(hasError || hasEntry).toBeTruthy()
  81 |   })
  82 | })
  83 | 
```