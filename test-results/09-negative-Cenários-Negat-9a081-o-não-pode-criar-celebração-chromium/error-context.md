# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 09-negative.spec.ts >> Cenários Negativos — Validação e Rejeição >> TC-088 [-] Membro não pode criar celebração
- Location: tests\e2e\09-negative.spec.ts:139:7

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  getByRole('button', { name: /nova celebração|adicionar/i })
Expected: not visible
Received: visible
Timeout:  5000ms

Call log:
  - Expect "not toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /nova celebração|adicionar/i })
    9 × locator resolved to <button tabindex="0" type="button" data-slot="button" class="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 da…>+ Nova Celebração</button>
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
> 144 |     await expect(addBtn).not.toBeVisible({ timeout: 5_000 })
      |                              ^ Error: expect(locator).not.toBeVisible() failed
  145 |   })
  146 | 
  147 |   // ── TC-089 ───────────────────────────────────────────────────────────
  148 |   test('TC-089 [-] Formulário de recuperação de senha sem email exibe erro', async ({ page }) => {
  149 |     await page.goto('/forgot-password')
  150 |     await page.getByRole('button', { name: /enviar|recuperar/i }).click()
  151 |     // Deve exibir erro de validação
  152 |     const emailField = page.getByLabel(/e-mail/i)
  153 |     if (await emailField.isVisible({ timeout: 3_000 }).catch(() => false)) {
  154 |       const hasError = await page.getByText(/obrigatório|required|e-mail/i)
  155 |         .isVisible({ timeout: 3_000 }).catch(() => false)
  156 |       const fieldStillVisible = await emailField.isVisible()
  157 |       expect(hasError || fieldStillVisible).toBeTruthy()
  158 |     } else {
  159 |       // Página pode não ter campo separado — verifica que não crashou
  160 |       await expect(page.locator('body')).toBeVisible()
  161 |     }
  162 |   })
  163 | 
  164 |   // ── TC-090 ───────────────────────────────────────────────────────────
  165 |   test('TC-090 [-] Excluir pastoral com membros associados exibe aviso ou bloqueia', async ({ page }) => {
  166 |     const env = loadTestEnv()
  167 |     await loginAs(page, env.adminUser.email, env.adminUser.password)
  168 |     await page.goto('/pastorals')
  169 |     // Tenta deletar a pastoral que tem membros (pastoral1 do setup)
  170 |     const row = page.getByText(env.pastoral1.name).locator('..')
  171 |     const deleteBtn = row.getByRole('button', { name: /excluir|deletar/i })
  172 |     if (await deleteBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
  173 |       await deleteBtn.click()
  174 |       // Deve exibir confirmação ou erro de integridade referencial
  175 |       const confirmBtn = page.getByRole('button', { name: /confirmar|sim/i })
  176 |       if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
  177 |         await confirmBtn.click()
  178 |         // Após confirmar: pode bloquear com erro ou deletar (cascata)
  179 |         // O sistema não deve crashar
  180 |         await expect(page.locator('body')).toBeVisible({ timeout: 5_000 })
  181 |       } else {
  182 |         // Modal de confirmação já é proteção suficiente
  183 |         expect(true).toBeTruthy()
  184 |       }
  185 |     } else {
  186 |       // Botão excluir não visível para pastoral em uso é comportamento correto
  187 |       test.skip(true, 'Botão excluir não disponível — pastoral em uso')
  188 |     }
  189 |   })
  190 | })
  191 | 
```