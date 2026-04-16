# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 10-edge-cases.spec.ts >> Edge Cases — Entradas Extremas e Limites >> TC-102 [edge] Dois membros com o mesmo nome são permitidos (sem unicidade forçada)
- Location: tests\e2e\10-edge-cases.spec.ts:42:7

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
- generic [ref=e1]:
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
              - textbox "Nome completo *" [active] [ref=e26]:
                - /placeholder: Maria Aparecida
                - text: João Silva Duplicado
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
  1   | /**
  2   |  * Suite 10 — Edge Cases e Performance Básica
  3   |  * Cobre: entradas extremas, nomes duplicados, muitos registros,
  4   |  *        caracteres especiais, tempos de resposta aceitáveis
  5   |  */
  6   | import { test, expect } from '@playwright/test'
  7   | import { loginAs, loadTestEnv } from './helpers/auth'
  8   | 
  9   | test.describe('Edge Cases — Entradas Extremas e Limites', () => {
  10  |   // ── TC-100 ───────────────────────────────────────────────────────────
  11  |   test('TC-100 [edge] Nome de membro com caracteres especiais é aceito', async ({ page }) => {
  12  |     const env = loadTestEnv()
  13  |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  14  |     await page.goto('/members')
  15  |     await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
  16  |     const specialName = "José da Silva Ção & Filhos — Açaí Irmãos"
  17  |     await page.getByLabel(/nome/i).fill(specialName)
  18  |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  19  |     // Aceita com sucesso ou exibe mensagem clara — não pode crashar
  20  |     const saved = await page.getByText(specialName).isVisible({ timeout: 8_000 }).catch(() => false)
  21  |     const hasError = await page.getByText(/inválido|invalid|erro/i).isVisible({ timeout: 3_000 }).catch(() => false)
  22  |     expect(saved || hasError).toBeTruthy()
  23  |   })
  24  | 
  25  |   // ── TC-101 ───────────────────────────────────────────────────────────
  26  |   test('TC-101 [edge] Nome de membro com 200 caracteres é tratado sem crash', async ({ page }) => {
  27  |     const env = loadTestEnv()
  28  |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  29  |     await page.goto('/members')
  30  |     await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
  31  |     const longName = 'B'.repeat(200)
  32  |     await page.getByLabel(/nome/i).fill(longName)
  33  |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  34  |     // Aceita (sem crash) ou exibe mensagem de erro sobre tamanho
  35  |     const hasLengthError = await page.getByText(/muito longo|máximo|caracteres|limit/i)
  36  |       .isVisible({ timeout: 3_000 }).catch(() => false)
  37  |     const hasSaved = await page.getByText(longName.slice(0, 30)).isVisible({ timeout: 5_000 }).catch(() => false)
  38  |     expect(hasLengthError || hasSaved).toBeTruthy()
  39  |   })
  40  | 
  41  |   // ── TC-102 ───────────────────────────────────────────────────────────
  42  |   test('TC-102 [edge] Dois membros com o mesmo nome são permitidos (sem unicidade forçada)', async ({ page }) => {
  43  |     const env = loadTestEnv()
  44  |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  45  |     await page.goto('/members')
  46  |     const dupName = 'João Silva Duplicado'
  47  |     // Cria primeiro
  48  |     await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
  49  |     await page.getByLabel(/nome/i).fill(dupName)
> 50  |     await page.getByRole('button', { name: /salvar|criar/i }).click()
      |                                                               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  51  |     await expect(page.getByText(dupName)).toBeVisible({ timeout: 8_000 })
  52  |     // Cria segundo com mesmo nome
  53  |     await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
  54  |     await page.getByLabel(/nome/i).fill(dupName)
  55  |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  56  |     // Dois registros devem coexistir (nome não é chave única)
  57  |     const count = await page.getByText(dupName).count()
  58  |     expect(count).toBeGreaterThanOrEqual(2)
  59  |   })
  60  | 
  61  |   // ── TC-103 ───────────────────────────────────────────────────────────
  62  |   test('TC-103 [edge] Pastoral com nome de 200 caracteres é tratada sem crash', async ({ page }) => {
  63  |     const env = loadTestEnv()
  64  |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  65  |     await page.goto('/pastorals')
  66  |     await page.getByRole('button', { name: /nova pastoral|adicionar/i }).click()
  67  |     const longName = 'P'.repeat(200)
  68  |     await page.getByLabel(/nome/i).fill(longName)
  69  |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  70  |     const hasError = await page.getByText(/muito longo|máximo|caracteres/i)
  71  |       .isVisible({ timeout: 3_000 }).catch(() => false)
  72  |     const hasSaved = await page.getByText(longName.slice(0, 30)).isVisible({ timeout: 5_000 }).catch(() => false)
  73  |     expect(hasError || hasSaved).toBeTruthy()
  74  |   })
  75  | 
  76  |   // ── TC-104 ───────────────────────────────────────────────────────────
  77  |   test('TC-104 [edge] Email com formato inválido é rejeitado no formulário', async ({ page }) => {
  78  |     await page.goto('/login')
  79  |     await page.getByLabel('E-mail').fill('nao-e-um-email')
  80  |     await page.getByLabel('Senha').fill('qualquer123')
  81  |     await page.getByRole('button', { name: /entrar/i }).click()
  82  |     // Browser native validation ou app validation deve rejeitar
  83  |     const emailField = page.getByLabel('E-mail')
  84  |     const validityState = await emailField.evaluate((el: HTMLInputElement) => el.validity.valid)
  85  |     const hasError = await page.getByText(/e-mail inválido|formato|valid email/i)
  86  |       .isVisible({ timeout: 3_000 }).catch(() => false)
  87  |     expect(!validityState || hasError).toBeTruthy()
  88  |   })
  89  | 
  90  |   // ── TC-105 ───────────────────────────────────────────────────────────
  91  |   test('TC-105 [edge] Múltiplas pastorais criadas sequencialmente sem erro', async ({ page }) => {
  92  |     const env = loadTestEnv()
  93  |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  94  |     await page.goto('/pastorals')
  95  |     // Cria 3 pastorais em sequência
  96  |     const names = ['Pastoral Alpha', 'Pastoral Beta', 'Pastoral Gamma']
  97  |     for (const name of names) {
  98  |       await page.getByRole('button', { name: /nova pastoral|adicionar/i }).click()
  99  |       await page.getByLabel(/nome/i).fill(name)
  100 |       await page.getByRole('button', { name: /salvar|criar/i }).click()
  101 |       await expect(page.getByText(name)).toBeVisible({ timeout: 8_000 })
  102 |     }
  103 |     // Todas as 3 devem estar visíveis
  104 |     for (const name of names) {
  105 |       await expect(page.getByText(name)).toBeVisible()
  106 |     }
  107 |   })
  108 | 
  109 |   // ── TC-106 ───────────────────────────────────────────────────────────
  110 |   test('TC-106 [edge] Título de celebração com emojis não quebra a UI', async ({ page }) => {
  111 |     const env = loadTestEnv()
  112 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  113 |     await page.goto('/celebrations')
  114 |     await page.getByRole('button', { name: /nova celebração|adicionar/i }).click()
  115 |     const emojiTitle = '🎉 Festa Paroquial 🙏'
  116 |     await page.getByLabel(/título/i).fill(emojiTitle)
  117 |     const dateInput = page.getByLabel(/data/i).or(page.locator('input[type="date"]').first())
  118 |     await dateInput.fill('2026-08-01')
  119 |     const timeInput = page.getByLabel(/horário|hora/i).or(page.locator('input[type="time"]').first())
  120 |     await timeInput.fill('20:00')
  121 |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  122 |     // Sem crash; aceita ou mostra erro de validação claro
  123 |     await expect(page.locator('body')).toBeVisible({ timeout: 5_000 })
  124 |   })
  125 | 
  126 |   // ── TC-107 ───────────────────────────────────────────────────────────
  127 |   test('TC-107 [edge] Senha com apenas espaços é rejeitada no signup', async ({ page }) => {
  128 |     await page.goto('/signup')
  129 |     const emailField = page.getByLabel(/e-mail/i)
  130 |     if (await emailField.isVisible({ timeout: 3_000 }).catch(() => false)) {
  131 |       await emailField.fill('testedge@test.dev')
  132 |       const pwdField = page.getByLabel(/^senha$/i).first()
  133 |       if (await pwdField.isVisible({ timeout: 2_000 }).catch(() => false)) {
  134 |         await pwdField.fill('     ')
  135 |         await page.getByRole('button', { name: /cadastrar|criar|avançar/i }).click()
  136 |         // Deve rejeitar senha fraca/inválida
  137 |         const hasError = await page.getByText(/senha|password|fraca|inválid/i)
  138 |           .isVisible({ timeout: 5_000 }).catch(() => false)
  139 |         expect(hasError).toBeTruthy()
  140 |       } else {
  141 |         test.skip(true, 'Campo senha não encontrado no fluxo')
  142 |       }
  143 |     } else {
  144 |       test.skip(true, 'Página de signup não tem campos de email/senha visíveis')
  145 |     }
  146 |   })
  147 | })
  148 | 
  149 | test.describe('Performance Básica — Tempos de Resposta', () => {
  150 |   // ── TC-110 ───────────────────────────────────────────────────────────
```