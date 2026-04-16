# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 10-edge-cases.spec.ts >> Performance Básica — Tempos de Resposta >> TC-113 [perf] Criação de 5 membros em sequência termina sem timeout
- Location: tests\e2e\10-edge-cases.spec.ts:184:7

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
                - text: Membro Perf 1
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
  151 |   test('TC-110 [perf] Dashboard carrega em menos de 5 segundos', async ({ page }) => {
  152 |     const env = loadTestEnv()
  153 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  154 |     const start = Date.now()
  155 |     await page.goto('/dashboard')
  156 |     await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
  157 |     const elapsed = Date.now() - start
  158 |     expect(elapsed).toBeLessThan(5_000)
  159 |   })
  160 | 
  161 |   // ── TC-111 ───────────────────────────────────────────────────────────
  162 |   test('TC-111 [perf] Lista de membros carrega em menos de 5 segundos', async ({ page }) => {
  163 |     const env = loadTestEnv()
  164 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  165 |     const start = Date.now()
  166 |     await page.goto('/members')
  167 |     await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
  168 |     const elapsed = Date.now() - start
  169 |     expect(elapsed).toBeLessThan(5_000)
  170 |   })
  171 | 
  172 |   // ── TC-112 ───────────────────────────────────────────────────────────
  173 |   test('TC-112 [perf] Página de celebrações carrega em menos de 5 segundos', async ({ page }) => {
  174 |     const env = loadTestEnv()
  175 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  176 |     const start = Date.now()
  177 |     await page.goto('/celebrations')
  178 |     await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
  179 |     const elapsed = Date.now() - start
  180 |     expect(elapsed).toBeLessThan(5_000)
  181 |   })
  182 | 
  183 |   // ── TC-113 ───────────────────────────────────────────────────────────
  184 |   test('TC-113 [perf] Criação de 5 membros em sequência termina sem timeout', async ({ page }) => {
  185 |     const env = loadTestEnv()
  186 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  187 |     await page.goto('/members')
  188 |     const start = Date.now()
  189 |     for (let i = 1; i <= 5; i++) {
  190 |       await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
  191 |       await page.getByLabel(/nome/i).fill(`Membro Perf ${i}`)
> 192 |       await page.getByRole('button', { name: /salvar|criar/i }).click()
      |                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  193 |       await expect(page.getByText(`Membro Perf ${i}`)).toBeVisible({ timeout: 8_000 })
  194 |     }
  195 |     const total = Date.now() - start
  196 |     // 5 inserções em menos de 30 segundos
  197 |     expect(total).toBeLessThan(30_000)
  198 |   })
  199 | 
  200 |   // ── TC-114 ───────────────────────────────────────────────────────────
  201 |   test('TC-114 [perf] Navegação entre seções principais é fluida (< 3s por transição)', async ({ page }) => {
  202 |     const env = loadTestEnv()
  203 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  204 |     const sections = ['/members', '/pastorals', '/celebrations', '/schedules', '/settings']
  205 |     for (const section of sections) {
  206 |       const start = Date.now()
  207 |       await page.goto(section)
  208 |       await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
  209 |       const elapsed = Date.now() - start
  210 |       expect(elapsed).toBeLessThan(5_000)
  211 |     }
  212 |   })
  213 | })
  214 | 
```