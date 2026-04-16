# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-auth.spec.ts >> Autenticação >> TC-007 [+] Página de cadastro exibe campos de senha
- Location: tests\e2e\01-auth.spec.ts:63:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel('Senha')
Expected: visible
Error: strict mode violation: getByLabel('Senha') resolved to 2 elements:
    1) <input value="" required="" id="password" type="password" data-slot="input" placeholder="Mínimo 6 caracteres" class="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-al…/> aka getByRole('textbox', { name: 'Senha', exact: true })
    2) <input value="" required="" id="confirm" type="password" data-slot="input" placeholder="Repita a senha" class="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed …/> aka getByRole('textbox', { name: 'Confirmar senha' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByLabel('Senha')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - heading "Paróquia+" [level=1] [ref=e5]
        - paragraph [ref=e6]: Cadastre sua paróquia
      - generic [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e9]: Nome da paróquia
          - textbox "Nome da paróquia" [ref=e10]:
            - /placeholder: Paróquia São José
        - generic [ref=e11]:
          - generic [ref=e12]:
            - generic [ref=e13]: Seu nome completo
            - textbox "Seu nome completo" [ref=e14]:
              - /placeholder: João da Silva
          - generic [ref=e15]:
            - generic [ref=e16]: E-mail
            - textbox "E-mail" [ref=e17]:
              - /placeholder: seu@email.com
          - generic [ref=e18]:
            - generic [ref=e19]: Senha
            - textbox "Senha" [ref=e20]:
              - /placeholder: Mínimo 6 caracteres
          - generic [ref=e21]:
            - generic [ref=e22]: Confirmar senha
            - textbox "Confirmar senha" [ref=e23]:
              - /placeholder: Repita a senha
        - button "Criar conta" [ref=e24]
      - paragraph [ref=e25]:
        - text: Já tem conta?
        - link "Entrar" [ref=e26] [cursor=pointer]:
          - /url: /login
  - region "Notifications alt+T"
  - alert [ref=e27]
```

# Test source

```ts
  1  | /**
  2  |  * Suite 01 — Autenticação
  3  |  * Cobre: cadastro, login, logout, recuperação de senha
  4  |  */
  5  | import { test, expect } from '@playwright/test'
  6  | import { loginAs, loadTestEnv } from './helpers/auth'
  7  | 
  8  | test.describe('Autenticação', () => {
  9  |   // ── TC-001 ───────────────────────────────────────────────────────────
  10 |   test('TC-001 [+] Login válido redireciona para /dashboard', async ({ page }) => {
  11 |     const env = loadTestEnv()
  12 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  13 |     await expect(page).toHaveURL(/\/dashboard/)
  14 |     await expect(page.getByText('Paróquia+')).toBeVisible()
  15 |   })
  16 | 
  17 |   // ── TC-002 ───────────────────────────────────────────────────────────
  18 |   test('TC-002 [-] Login com senha errada exibe mensagem de erro', async ({ page }) => {
  19 |     const env = loadTestEnv()
  20 |     await page.goto('/login')
  21 |     await page.getByLabel('E-mail').fill(env.adminUser.email)
  22 |     await page.getByLabel('Senha').fill('senhaErrada!')
  23 |     await page.getByRole('button', { name: /entrar/i }).click()
  24 |     await expect(page.getByText(/email ou senha incorretos/i)).toBeVisible({ timeout: 8_000 })
  25 |     await expect(page).toHaveURL(/\/login/)
  26 |   })
  27 | 
  28 |   // ── TC-003 ───────────────────────────────────────────────────────────
  29 |   test('TC-003 [-] Login com email inexistente exibe mensagem de erro', async ({ page }) => {
  30 |     await page.goto('/login')
  31 |     await page.getByLabel('E-mail').fill('naoexiste@paroquia-test.dev')
  32 |     await page.getByLabel('Senha').fill('qualquercoisa')
  33 |     await page.getByRole('button', { name: /entrar/i }).click()
  34 |     await expect(page.getByText(/email ou senha incorretos/i)).toBeVisible({ timeout: 8_000 })
  35 |   })
  36 | 
  37 |   // ── TC-004 ───────────────────────────────────────────────────────────
  38 |   test('TC-004 [-] Campos vazios bloqueiam submissão do formulário', async ({ page }) => {
  39 |     await page.goto('/login')
  40 |     await page.getByRole('button', { name: /entrar/i }).click()
  41 |     // HTML5 required — permanece na mesma página
  42 |     await expect(page).toHaveURL(/\/login/)
  43 |   })
  44 | 
  45 |   // ── TC-005 ───────────────────────────────────────────────────────────
  46 |   test('TC-005 [+] Logout encerra sessão e redireciona para /login', async ({ page }) => {
  47 |     const env = loadTestEnv()
  48 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  49 |     await page.goto('/auth/signout')
  50 |     await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  51 |     // Tenta acessar dashboard após logout — deve redirecionar
  52 |     await page.goto('/dashboard')
  53 |     await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  54 |   })
  55 | 
  56 |   // ── TC-006 ───────────────────────────────────────────────────────────
  57 |   test('TC-006 [sec] Acesso direto ao dashboard sem login redireciona para /login', async ({ page }) => {
  58 |     await page.goto('/dashboard')
  59 |     await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  60 |   })
  61 | 
  62 |   // ── TC-007 ───────────────────────────────────────────────────────────
  63 |   test('TC-007 [+] Página de cadastro exibe campos de senha', async ({ page }) => {
  64 |     await page.goto('/signup')
  65 |     await expect(page.getByLabel('Nome da paróquia')).toBeVisible()
  66 |     await expect(page.getByLabel('Seu nome completo')).toBeVisible()
  67 |     await expect(page.getByLabel('E-mail')).toBeVisible()
> 68 |     await expect(page.getByLabel('Senha')).toBeVisible()
     |                                            ^ Error: expect(locator).toBeVisible() failed
  69 |     await expect(page.getByLabel('Confirmar senha')).toBeVisible()
  70 |   })
  71 | 
  72 |   // ── TC-008 ───────────────────────────────────────────────────────────
  73 |   test('TC-008 [-] Cadastro com senhas diferentes exibe erro de validação', async ({ page }) => {
  74 |     await page.goto('/signup')
  75 |     await page.getByLabel('Nome da paróquia').fill('Paróquia Inválida')
  76 |     await page.getByLabel('Seu nome completo').fill('Teste Usuário')
  77 |     await page.getByLabel('E-mail').fill('novo@paroquia-test.dev')
  78 |     await page.getByLabel('Senha').fill('Senha@123')
  79 |     await page.getByLabel('Confirmar senha').fill('Senha@999')
  80 |     await page.getByRole('button', { name: /criar conta/i }).click()
  81 |     await expect(page.getByText(/senhas não coincidem/i)).toBeVisible({ timeout: 5_000 })
  82 |   })
  83 | 
  84 |   // ── TC-009 ───────────────────────────────────────────────────────────
  85 |   test('TC-009 [+] Página de recuperação de senha aceita email válido', async ({ page }) => {
  86 |     await page.goto('/forgot-password')
  87 |     await page.getByLabel('E-mail').fill('qualquer@email.com')
  88 |     await page.getByRole('button', { name: /enviar link/i }).click()
  89 |     // Página deve mostrar confirmação (não importa se email existe ou não)
  90 |     await expect(page.getByText(/email enviado/i)).toBeVisible({ timeout: 10_000 })
  91 |   })
  92 | })
  93 | 
```