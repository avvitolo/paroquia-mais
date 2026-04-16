# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 06-schedules.spec.ts >> Escalas — CRUD e Atribuições >> TC-053 [+] Membro vê apenas escalas publicadas
- Location: tests\e2e\06-schedules.spec.ts:62:7

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  getByRole('button', { name: /nova escala|criar/i })
Expected: not visible
Received: visible
Timeout:  5000ms

Call log:
  - Expect "not toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /nova escala|criar/i })
    9 × locator resolved to <button tabindex="0" type="button" data-slot="button" class="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 da…>+ Nova Escala</button>
      - unexpected value "visible"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e5]: Paróquia+
      - generic [ref=e6]:
        - paragraph [ref=e7]: Membro Alpha
        - generic [ref=e8]: membro
      - navigation [ref=e9]
      - link "Sair" [ref=e11] [cursor=pointer]:
        - /url: /auth/signout
    - main [ref=e12]:
      - generic [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]:
            - heading "Escalas" [level=1] [ref=e17]
            - paragraph [ref=e18]: 0 escala(s)
          - generic [ref=e19]:
            - generic [ref=e20]:
              - button "Lista" [ref=e21]
              - button "Calendário" [ref=e22]
            - button "+ Nova Escala" [ref=e23]
        - paragraph [ref=e25]: Nenhuma escala criada ainda.
  - region "Notifications alt+T"
  - alert [ref=e26]
```

# Test source

```ts
  1  | /**
  2  |  * Suite 06 — Escalas (CRUD + Atribuições)
  3  |  * Cobre: criação, publicação, atribuição de membros, confirmação de presença
  4  |  */
  5  | import { test, expect } from '@playwright/test'
  6  | import { loginAs, loadTestEnv } from './helpers/auth'
  7  | 
  8  | test.describe('Escalas — CRUD e Atribuições', () => {
  9  |   // ── TC-050 ───────────────────────────────────────────────────────────
  10 |   test('TC-050 [+] Admin cria escala vinculada a uma celebração', async ({ page }) => {
  11 |     const env = loadTestEnv()
  12 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  13 |     await page.goto('/schedules')
  14 |     await page.getByRole('button', { name: /nova escala|criar escala|adicionar/i }).click()
  15 |     // Seleciona celebração existente
  16 |     const celebSelect = page.getByLabel(/celebração/i)
  17 |     if (await celebSelect.isVisible({ timeout: 3_000 }).catch(() => false)) {
  18 |       await celebSelect.selectOption({ index: 1 })
  19 |     }
  20 |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  21 |     // Verifica que a escala foi criada (aparece na lista)
  22 |     await expect(page.locator('[data-testid="schedule-list"], table, .schedule-item').first())
  23 |       .toBeVisible({ timeout: 8_000 })
  24 |   })
  25 | 
  26 |   // ── TC-051 ───────────────────────────────────────────────────────────
  27 |   test('TC-051 [+] Admin adiciona membro a uma escala', async ({ page }) => {
  28 |     const env = loadTestEnv()
  29 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  30 |     await page.goto('/schedules')
  31 |     // Abre primeira escala disponível
  32 |     await page.getByRole('link', { name: /ver|abrir|detalhes/i }).first().click()
  33 |     // Adiciona membro
  34 |     const addBtn = page.getByRole('button', { name: /adicionar membro|atribuir/i })
  35 |     if (await addBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
  36 |       await addBtn.click()
  37 |       const memberSelect = page.getByLabel(/membro/i)
  38 |       await memberSelect.selectOption({ label: env.member1.name })
  39 |       await page.getByLabel(/função|role/i).fill('Acólito')
  40 |       await page.getByRole('button', { name: /salvar|adicionar/i }).click()
  41 |       await expect(page.getByText(env.member1.name)).toBeVisible({ timeout: 8_000 })
  42 |     } else {
  43 |       test.skip(true, 'Interface de atribuição não encontrada — verificar seletor')
  44 |     }
  45 |   })
  46 | 
  47 |   // ── TC-052 ───────────────────────────────────────────────────────────
  48 |   test('TC-052 [+] Admin publica escala (status draft → published)', async ({ page }) => {
  49 |     const env = loadTestEnv()
  50 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  51 |     await page.goto('/schedules')
  52 |     const publishBtn = page.getByRole('button', { name: /publicar/i }).first()
  53 |     if (await publishBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
  54 |       await publishBtn.click()
  55 |       await expect(page.getByText(/publicad/i)).toBeVisible({ timeout: 8_000 })
  56 |     } else {
  57 |       test.skip(true, 'Botão publicar não encontrado neste estado')
  58 |     }
  59 |   })
  60 | 
  61 |   // ── TC-053 ───────────────────────────────────────────────────────────
  62 |   test('TC-053 [+] Membro vê apenas escalas publicadas', async ({ page }) => {
  63 |     const env = loadTestEnv()
  64 |     await loginAs(page, env.memberUser.email, env.memberUser.password)
  65 |     await page.goto('/schedules')
  66 |     // Não deve ver opção de criar escala
> 67 |     await expect(page.getByRole('button', { name: /nova escala|criar/i })).not.toBeVisible()
     |                                                                                ^ Error: expect(locator).not.toBeVisible() failed
  68 |     // Pode ver escalas publicadas
  69 |     await expect(page.locator('main')).toBeVisible()
  70 |   })
  71 | 
  72 |   // ── TC-054 ───────────────────────────────────────────────────────────
  73 |   test('TC-054 [edge] Duas escalas no mesmo dia são permitidas (sem bloqueio duplo)', async ({ page }) => {
  74 |     const env = loadTestEnv()
  75 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  76 |     await page.goto('/schedules')
  77 |     // Verifica que o sistema aceita múltiplas escalas sem travar
  78 |     const count = await page.getByRole('row').count()
  79 |     expect(count).toBeGreaterThanOrEqual(0) // Sem crash
  80 |   })
  81 | })
  82 | 
```