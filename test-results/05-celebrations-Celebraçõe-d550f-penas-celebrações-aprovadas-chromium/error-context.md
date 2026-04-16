# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-celebrations.spec.ts >> Celebrações — CRUD e Aprovação >> TC-044 [+] Membro vê apenas celebrações aprovadas
- Location: tests\e2e\05-celebrations.spec.ts:66:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Missa de Domingo')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByText('Missa de Domingo')

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
            - heading "Celebrações" [level=1] [ref=e17]
            - paragraph [ref=e18]: 0 celebração(ões)
          - generic [ref=e19]:
            - combobox [ref=e20]:
              - option "Todos os tipos" [selected]
              - option "Missa"
              - option "Novena"
              - option "Terço"
              - option "Via-Sacra"
              - option "Adoração"
              - option "Retiro"
              - option "Outro"
            - button "+ Nova Celebração" [ref=e21]
        - generic [ref=e22]:
          - paragraph [ref=e23]: Nenhuma celebração encontrada.
          - button "Criar primeira celebração" [ref=e24]
  - region "Notifications alt+T"
  - alert [ref=e25]
```

# Test source

```ts
  1   | /**
  2   |  * Suite 05 — Celebrações / Eventos (CRUD + Fluxo de Aprovação)
  3   |  * Cobre: criação por gestores (direto), criação por coordenador (pendente),
  4   |  *        aprovação, rejeição, cenários negativos
  5   |  */
  6   | import { test, expect } from '@playwright/test'
  7   | import { loginAs, logout, loadTestEnv } from './helpers/auth'
  8   | 
  9   | test.describe('Celebrações — CRUD e Aprovação', () => {
  10  |   // ── TC-040 ───────────────────────────────────────────────────────────
  11  |   test('TC-040 [+] Admin cria celebração aprovada diretamente', async ({ page }) => {
  12  |     const env = loadTestEnv()
  13  |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  14  |     await page.goto('/celebrations')
  15  |     await page.getByRole('button', { name: /nova celebração|adicionar/i }).click()
  16  |     await page.getByLabel(/título/i).fill('Missa de Domingo')
  17  |     // Preenche data — tenta getByLabel, fallback para input[type=date]
  18  |     const dateInput = page.getByLabel(/data/i).or(page.locator('input[type="date"]').first())
  19  |     await dateInput.fill('2026-05-04')
  20  |     const timeInput = page.getByLabel(/horário|hora/i).or(page.locator('input[type="time"]').first())
  21  |     await timeInput.fill('10:00')
  22  |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  23  |     await expect(page.getByText('Missa de Domingo')).toBeVisible({ timeout: 8_000 })
  24  |   })
  25  | 
  26  |   // ── TC-041 ───────────────────────────────────────────────────────────
  27  |   test('TC-041 [+] Coordenador cria celebração com status pendente', async ({ page }) => {
  28  |     const env = loadTestEnv()
  29  |     await loginAs(page, env.coordUser.email, env.coordUser.password)
  30  |     await page.goto('/celebrations')
  31  |     await page.getByRole('button', { name: /nova celebração|adicionar/i }).click()
  32  |     await page.getByLabel(/título/i).fill('Retiro da Pastoral')
  33  |     const dateInput = page.getByLabel(/data/i).or(page.locator('input[type="date"]').first())
  34  |     await dateInput.fill('2026-05-11')
  35  |     const timeInput = page.getByLabel(/horário|hora/i).or(page.locator('input[type="time"]').first())
  36  |     await timeInput.fill('09:00')
  37  |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  38  |     // Celebração criada como pendente — exibe badge ou label indicativo
  39  |     await expect(page.getByText('Retiro da Pastoral')).toBeVisible({ timeout: 8_000 })
  40  |     await expect(page.getByText(/pendente/i)).toBeVisible({ timeout: 5_000 })
  41  |   })
  42  | 
  43  |   // ── TC-042 ───────────────────────────────────────────────────────────
  44  |   test('TC-042 [+] Admin aprova celebração pendente do coordenador', async ({ page }) => {
  45  |     const env = loadTestEnv()
  46  |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  47  |     await page.goto('/celebrations')
  48  |     const pendingRow = page.getByText('Retiro da Pastoral').locator('..')
  49  |     await pendingRow.getByRole('button', { name: /aprovar/i }).click()
  50  |     await expect(pendingRow.getByText(/aprovad/i)).toBeVisible({ timeout: 8_000 })
  51  |   })
  52  | 
  53  |   // ── TC-043 ───────────────────────────────────────────────────────────
  54  |   test('TC-043 [-] Criar celebração sem título é bloqueado', async ({ page }) => {
  55  |     const env = loadTestEnv()
  56  |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  57  |     await page.goto('/celebrations')
  58  |     await page.getByRole('button', { name: /nova celebração|adicionar/i }).click()
  59  |     const dateInput = page.getByLabel(/data/i).or(page.locator('input[type="date"]').first())
  60  |     await dateInput.fill('2026-05-18')
  61  |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  62  |     await expect(page.getByLabel(/título/i)).toBeVisible()
  63  |   })
  64  | 
  65  |   // ── TC-044 ───────────────────────────────────────────────────────────
  66  |   test('TC-044 [+] Membro vê apenas celebrações aprovadas', async ({ page }) => {
  67  |     const env = loadTestEnv()
  68  |     await loginAs(page, env.memberUser.email, env.memberUser.password)
  69  |     await page.goto('/celebrations')
  70  |     // Membro não vê celebrações pendentes
  71  |     await expect(page.getByText(/pendente/i)).not.toBeVisible()
  72  |     // Mas vê as aprovadas
> 73  |     await expect(page.getByText('Missa de Domingo')).toBeVisible({ timeout: 8_000 })
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  74  |   })
  75  | 
  76  |   // ── TC-045 ───────────────────────────────────────────────────────────
  77  |   test('TC-045 [+] Admin edita celebração existente', async ({ page }) => {
  78  |     const env = loadTestEnv()
  79  |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  80  |     await page.goto('/celebrations')
  81  |     const row = page.getByText('Missa de Domingo').locator('..')
  82  |     await row.getByRole('button', { name: /editar/i }).click()
  83  |     await page.getByLabel(/título/i).fill('Missa Dominical')
  84  |     await page.getByRole('button', { name: /salvar/i }).click()
  85  |     await expect(page.getByText('Missa Dominical')).toBeVisible({ timeout: 8_000 })
  86  |   })
  87  | 
  88  |   // ── TC-046 ───────────────────────────────────────────────────────────
  89  |   test('TC-046 [+] Admin exclui celebração sem associação', async ({ page }) => {
  90  |     const env = loadTestEnv()
  91  |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  92  |     await page.goto('/celebrations')
  93  |     // Cria uma célébração para deletar
  94  |     await page.getByRole('button', { name: /nova celebração|adicionar/i }).click()
  95  |     await page.getByLabel(/título/i).fill('Celebração para Deletar')
  96  |     const dateInput = page.getByLabel(/data/i).or(page.locator('input[type="date"]').first())
  97  |     await dateInput.fill('2026-06-01')
  98  |     const timeInput = page.getByLabel(/horário|hora/i).or(page.locator('input[type="time"]').first())
  99  |     await timeInput.fill('18:00')
  100 |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  101 |     await expect(page.getByText('Celebração para Deletar')).toBeVisible({ timeout: 8_000 })
  102 |     // Deleta
  103 |     const row = page.getByText('Celebração para Deletar').locator('..')
  104 |     await row.getByRole('button', { name: /excluir|deletar/i }).click()
  105 |     const confirmBtn = page.getByRole('button', { name: /confirmar|sim/i })
  106 |     if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
  107 |       await confirmBtn.click()
  108 |     }
  109 |     await expect(page.getByText('Celebração para Deletar')).not.toBeVisible({ timeout: 8_000 })
  110 |   })
  111 | })
  112 | 
```