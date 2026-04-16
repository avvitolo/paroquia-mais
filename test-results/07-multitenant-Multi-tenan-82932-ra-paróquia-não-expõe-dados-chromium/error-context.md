# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 07-multitenant.spec.ts >> Multi-tenant — Isolamento de dados >> TC-064 [sec] Manipulação de URL com ID de outra paróquia não expõe dados
- Location: tests\e2e\07-multitenant.spec.ts:103:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e5]: Paróquia+
      - generic [ref=e6]:
        - paragraph [ref=e7]: Admin Beta
        - generic [ref=e8]: admin_sistema
      - navigation [ref=e9]
      - link "Sair" [ref=e11] [cursor=pointer]:
        - /url: /auth/signout
    - main [ref=e12]:
      - generic [ref=e14]:
        - heading "404" [level=1] [ref=e15]
        - heading "This page could not be found." [level=2] [ref=e17]
  - region "Notifications alt+T"
  - alert [ref=e18]
```

# Test source

```ts
  12  |     const env = loadTestEnv()
  13  |     // Login como admin da paróquia B
  14  |     await loginAs(page, env.adminUser2.email, env.adminUser2.password)
  15  |     await page.goto('/members')
  16  |     // Não deve ver o membro criado no setup (que pertence à paróquia A)
  17  |     await expect(page.getByText(env.member1.name)).not.toBeVisible({ timeout: 5_000 })
  18  |   })
  19  | 
  20  |   // ── TC-061 ──────────────────────��───────────────────────────��────────
  21  |   test('TC-061 [sec] Admin da paróquia B não vê pastorais da paróquia A na UI', async ({ page }) => {
  22  |     const env = loadTestEnv()
  23  |     await loginAs(page, env.adminUser2.email, env.adminUser2.password)
  24  |     await page.goto('/pastorals')
  25  |     await expect(page.getByText(env.pastoral1.name)).not.toBeVisible({ timeout: 5_000 })
  26  |   })
  27  | 
  28  |   // ── TC-062 ─────────────────────���─────────────────────────��───────────
  29  |   test('TC-062 [sec] API: consulta de membro com ID de outra paróquia não retorna dados', async ({ page }) => {
  30  |     const env = loadTestEnv()
  31  |     // Login como admin da paróquia B
  32  |     await loginAs(page, env.adminUser2.email, env.adminUser2.password)
  33  | 
  34  |     // Tenta buscar membro da paróquia A via Supabase REST diretamente
  35  |     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  36  |     const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  37  | 
  38  |     // Obtém o token da sessão atual via localStorage/cookie
  39  |     const token = await page.evaluate(() => {
  40  |       const keys = Object.keys(localStorage)
  41  |       for (const k of keys) {
  42  |         if (k.includes('auth-token') || k.includes('supabase')) {
  43  |           try {
  44  |             const v = JSON.parse(localStorage.getItem(k) ?? '{}')
  45  |             return v?.access_token ?? null
  46  |           } catch { return null }
  47  |         }
  48  |       }
  49  |       return null
  50  |     })
  51  | 
  52  |     if (!token) {
  53  |       test.skip(true, 'Token não obtido via localStorage — sessão usa cookies httpOnly')
  54  |       return
  55  |     }
  56  | 
  57  |     // Faz request direto à API do Supabase como usuário da paróquia B
  58  |     const res = await page.request.get(
  59  |       `${supabaseUrl}/rest/v1/members?id=eq.${env.member1.id}&select=*`,
  60  |       { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } }
  61  |     )
  62  |     const body = await res.json()
  63  |     // RLS deve retornar array vazio — membro pertence à paróquia A
  64  |     expect(Array.isArray(body)).toBeTruthy()
  65  |     expect(body).toHaveLength(0)
  66  |   })
  67  | 
  68  |   // ── TC-063 ───────────────────────────────────────────────────────────
  69  |   test('TC-063 [sec] API: consulta de pastoral com ID de outra paróquia retorna vazio', async ({ page }) => {
  70  |     const env = loadTestEnv()
  71  |     await loginAs(page, env.adminUser2.email, env.adminUser2.password)
  72  | 
  73  |     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  74  |     const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  75  | 
  76  |     const token = await page.evaluate(() => {
  77  |       const keys = Object.keys(localStorage)
  78  |       for (const k of keys) {
  79  |         if (k.includes('supabase')) {
  80  |           try {
  81  |             const v = JSON.parse(localStorage.getItem(k) ?? '{}')
  82  |             return v?.access_token ?? null
  83  |           } catch { return null }
  84  |         }
  85  |       }
  86  |       return null
  87  |     })
  88  | 
  89  |     if (!token) {
  90  |       test.skip(true, 'Token não obtido via localStorage — sessão usa cookies httpOnly')
  91  |       return
  92  |     }
  93  | 
  94  |     const res = await page.request.get(
  95  |       `${supabaseUrl}/rest/v1/pastorals?id=eq.${env.pastoral1.id}&select=*`,
  96  |       { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } }
  97  |     )
  98  |     const body = await res.json()
  99  |     expect(body).toHaveLength(0)
  100 |   })
  101 | 
  102 |   // ── TC-064 ─────────────────────────────────���─────────────────────────
  103 |   test('TC-064 [sec] Manipulação de URL com ID de outra paróquia não expõe dados', async ({ page }) => {
  104 |     const env = loadTestEnv()
  105 |     await loginAs(page, env.adminUser2.email, env.adminUser2.password)
  106 |     // Tenta acessar escala de outra paróquia por URL direta com ID inventado
  107 |     await page.goto(`/schedules/00000000-0000-0000-0000-000000000001`)
  108 |     // Deve mostrar 404 ou redirecionar — nunca mostrar dados de outra paróquia
  109 |     const url = page.url()
  110 |     const is404 = await page.getByText(/não encontrad|not found/i).isVisible({ timeout: 5_000 }).catch(() => false)
  111 |     const isRedirected = !url.includes('/schedules/00000000')
> 112 |     expect(is404 || isRedirected).toBeTruthy()
      |                                   ^ Error: expect(received).toBeTruthy()
  113 |   })
  114 | })
  115 | 
```