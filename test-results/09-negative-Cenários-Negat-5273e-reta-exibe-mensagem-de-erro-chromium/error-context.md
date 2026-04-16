# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 09-negative.spec.ts >> Cenários Negativos — Validação e Rejeição >> TC-081 [-] Login com senha incorreta exibe mensagem de erro
- Location: tests\e2e\09-negative.spec.ts:37:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/credenciais|senha|inválid|incorret/i)
Expected: visible
Error: strict mode violation: getByText(/credenciais|senha|inválid|incorret/i) resolved to 2 elements:
    1) <label for="password" data-slot="label" class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">Senha</label> aka getByText('Senha', { exact: true })
    2) <a href="/forgot-password" class="text-xs text-[#002045] hover:underline">Esqueceu a senha?</a> aka getByRole('link', { name: 'Esqueceu a senha?' })

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByText(/credenciais|senha|inválid|incorret/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - heading "Paróquia+" [level=1] [ref=e5]
        - paragraph [ref=e6]: Acesse sua paróquia
      - generic [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e9]: E-mail
          - textbox "E-mail" [disabled]:
            - /placeholder: seu@email.com
            - text: admin@paroquia-test.dev
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]: Senha
            - link "Esqueceu a senha?" [ref=e13] [cursor=pointer]:
              - /url: /forgot-password
          - textbox "Senha" [disabled]:
            - /placeholder: ••••••••
            - text: senhaErrada!999
        - button "Entrando..." [disabled]
      - paragraph [ref=e14]:
        - text: Não tem conta?
        - link "Cadastrar paróquia" [ref=e15] [cursor=pointer]:
          - /url: /signup
  - region "Notifications alt+T"
  - alert [ref=e16]
```

# Test source

```ts
  1   | /**
  2   |  * Suite 09 — Cenários Negativos
  3   |  * Cobre: email duplicado, campos obrigatórios, exclusão de entidades em uso,
  4   |  *        permissões negadas, estados inválidos
  5   |  */
  6   | import { test, expect } from '@playwright/test'
  7   | import { loginAs, loadTestEnv } from './helpers/auth'
  8   | 
  9   | test.describe('Cenários Negativos — Validação e Rejeição', () => {
  10  |   // ── TC-080 ───────────────────────────────────────────────────────────
  11  |   test('TC-080 [-] Cadastro com email já existente exibe erro sem crash', async ({ page }) => {
  12  |     const env = loadTestEnv()
  13  |     // Tenta cadastrar com o mesmo email do adminUser já criado no setup
  14  |     await page.goto('/signup')
  15  |     const parishInput = page.getByLabel(/paróquia|parish/i)
  16  |     if (await parishInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
  17  |       await parishInput.fill('Paróquia Duplicada')
  18  |     }
  19  |     await page.getByLabel(/e-mail/i).fill(env.adminUser.email)
  20  |     const pwdInput = page.getByLabel(/senha/i).first()
  21  |     if (await pwdInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
  22  |       await pwdInput.fill('Senha@1234')
  23  |     }
  24  |     const confirmPwd = page.getByLabel(/confirmar senha|confirm/i)
  25  |     if (await confirmPwd.isVisible({ timeout: 2_000 }).catch(() => false)) {
  26  |       await confirmPwd.fill('Senha@1234')
  27  |     }
  28  |     await page.getByRole('button', { name: /cadastrar|criar|avançar/i }).click()
  29  |     // Deve exibir mensagem de erro — nunca logar ou crashar
  30  |     const hasError = await page.getByText(/já cadastrado|email.*exist|já em uso|in use/i)
  31  |       .isVisible({ timeout: 8_000 }).catch(() => false)
  32  |     const stillOnSignup = page.url().includes('/signup') || page.url().includes('/register')
  33  |     expect(hasError || stillOnSignup).toBeTruthy()
  34  |   })
  35  | 
  36  |   // ── TC-081 ───────────────────────────────────────────────────────────
  37  |   test('TC-081 [-] Login com senha incorreta exibe mensagem de erro', async ({ page }) => {
  38  |     const env = loadTestEnv()
  39  |     await page.goto('/login')
  40  |     await page.getByLabel('E-mail').fill(env.adminUser.email)
  41  |     await page.getByLabel('Senha').fill('senhaErrada!999')
  42  |     await page.getByRole('button', { name: /entrar/i }).click()
> 43  |     await expect(page.getByText(/credenciais|senha|inválid|incorret/i)).toBeVisible({ timeout: 8_000 })
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  44  |     // Permanece na página de login
  45  |     expect(page.url()).toMatch(/\/login/)
  46  |   })
  47  | 
  48  |   // ── TC-082 ───────────────────────────────────────────────────────────
  49  |   test('TC-082 [-] Login com email inexistente exibe mensagem de erro', async ({ page }) => {
  50  |     await page.goto('/login')
  51  |     await page.getByLabel('E-mail').fill('naoexiste_xyz987@paroquia.test')
  52  |     await page.getByLabel('Senha').fill('qualquerSenha123')
  53  |     await page.getByRole('button', { name: /entrar/i }).click()
  54  |     await expect(page.getByText(/credenciais|não encontrad|inválid/i)).toBeVisible({ timeout: 8_000 })
  55  |     expect(page.url()).toMatch(/\/login/)
  56  |   })
  57  | 
  58  |   // ── TC-083 ───────────────────────────────────────────────────────────
  59  |   test('TC-083 [-] Criar membro sem campos obrigatórios é bloqueado', async ({ page }) => {
  60  |     const env = loadTestEnv()
  61  |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  62  |     await page.goto('/members')
  63  |     await page.getByRole('button', { name: /novo membro|adicionar/i }).click()
  64  |     // Envia sem preencher nenhum campo
  65  |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  66  |     // Deve mostrar erro de validação ou manter modal aberto com campo marcado
  67  |     const nameField = page.getByLabel(/nome/i)
  68  |     await expect(nameField).toBeVisible({ timeout: 5_000 })
  69  |     // Verifica que o formulário não foi submetido com sucesso
  70  |     const hasValidationError = await page.getByText(/obrigatório|required|preencha/i)
  71  |       .isVisible({ timeout: 3_000 }).catch(() => false)
  72  |     const formStillOpen = await nameField.isVisible()
  73  |     expect(hasValidationError || formStillOpen).toBeTruthy()
  74  |   })
  75  | 
  76  |   // ── TC-084 ───────────────────────────────────────────────────────────
  77  |   test('TC-084 [-] Criar pastoral sem nome é bloqueado', async ({ page }) => {
  78  |     const env = loadTestEnv()
  79  |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  80  |     await page.goto('/pastorals')
  81  |     await page.getByRole('button', { name: /nova pastoral|adicionar/i }).click()
  82  |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  83  |     // Modal permanece aberto ou exibe erro de validação
  84  |     const nameField = page.getByLabel(/nome/i)
  85  |     await expect(nameField).toBeVisible({ timeout: 5_000 })
  86  |   })
  87  | 
  88  |   // ── TC-085 ───────────────────────────────────────────────────────────
  89  |   test('TC-085 [-] Membro não pode criar pastoral', async ({ page }) => {
  90  |     const env = loadTestEnv()
  91  |     await loginAs(page, env.memberUser.email, env.memberUser.password)
  92  |     await page.goto('/pastorals')
  93  |     // Botão de adicionar não deve aparecer para membro
  94  |     const addBtn = page.getByRole('button', { name: /nova pastoral|adicionar/i })
  95  |     await expect(addBtn).not.toBeVisible({ timeout: 5_000 })
  96  |   })
  97  | 
  98  |   // ── TC-086 ───────────────────────────────────────────────────────────
  99  |   test('TC-086 [-] Coordenador não pode editar membro de outra pastoral', async ({ page }) => {
  100 |     const env = loadTestEnv()
  101 |     await loginAs(page, env.coordUser.email, env.coordUser.password)
  102 |     await page.goto('/members')
  103 |     // Coordenador vê os membros mas não deve ter botão de editar membros fora de sua pastoral
  104 |     // Este teste verifica que a interface não expõe ação não autorizada
  105 |     const editBtns = page.getByRole('button', { name: /editar/i })
  106 |     const count = await editBtns.count()
  107 |     // Se aparecer botão de editar, tenta clicar e verifica que não salva ou mostra erro de permissão
  108 |     if (count > 0) {
  109 |       // Apenas verifica que a UI reflete as permissões corretas
  110 |       expect(count).toBeGreaterThanOrEqual(0)
  111 |     } else {
  112 |       // Sem botão de editar é o comportamento esperado para coordenador
  113 |       expect(count).toBe(0)
  114 |     }
  115 |   })
  116 | 
  117 |   // ── TC-087 ───────────────────────────────────────────────────────────
  118 |   test('TC-087 [-] Celebração criada pelo coordenador fica pendente (não aprovada)', async ({ page }) => {
  119 |     const env = loadTestEnv()
  120 |     await loginAs(page, env.coordUser.email, env.coordUser.password)
  121 |     await page.goto('/celebrations')
  122 |     await page.getByRole('button', { name: /nova celebração|adicionar/i }).click()
  123 |     await page.getByLabel(/título/i).fill('Evento Coordenador Teste')
  124 |     const dateInput = page.getByLabel(/data/i).or(page.locator('input[type="date"]').first())
  125 |     await dateInput.fill('2026-07-15')
  126 |     const timeInput = page.getByLabel(/horário|hora/i).or(page.locator('input[type="time"]').first())
  127 |     await timeInput.fill('19:00')
  128 |     await page.getByRole('button', { name: /salvar|criar/i }).click()
  129 |     // Deve aparecer como pendente, não como aprovado
  130 |     await expect(page.getByText('Evento Coordenador Teste')).toBeVisible({ timeout: 8_000 })
  131 |     // Não deve estar aprovado — deve estar pendente
  132 |     const isApproved = await page.getByText(/aprovad/i).isVisible({ timeout: 3_000 }).catch(() => false)
  133 |     const isPending = await page.getByText(/pendente/i).isVisible({ timeout: 3_000 }).catch(() => false)
  134 |     // Aprovado não pode aparecer sozinho sem que seja pendente primeiro
  135 |     expect(isPending || !isApproved).toBeTruthy()
  136 |   })
  137 | 
  138 |   // ── TC-088 ───────────────────────────────────────────────────────────
  139 |   test('TC-088 [-] Membro não pode criar celebração', async ({ page }) => {
  140 |     const env = loadTestEnv()
  141 |     await loginAs(page, env.memberUser.email, env.memberUser.password)
  142 |     await page.goto('/celebrations')
  143 |     const addBtn = page.getByRole('button', { name: /nova celebração|adicionar/i })
```