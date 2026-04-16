# Paróquia+ — Plano de Testes E2E: Resumo e Recomendações

**Gerado em:** 2026-04-15
**Ferramenta:** Playwright (TypeScript)
**Cobertura total:** 74+ casos de teste, 10 suites

---

## Suítes Geradas

| Arquivo | Suite | TCs | Tipo |
|---------|-------|-----|------|
| `01-auth.spec.ts` | Autenticação | TC-001 a TC-009 | Funcional |
| `02-rbac.spec.ts` | Controle de Acesso (RBAC) | TC-010 a TC-016 | Segurança/Funcional |
| `03-pastorals.spec.ts` | Pastorais CRUD | TC-020 a TC-023 | Funcional |
| `04-members.spec.ts` | Membros CRUD | TC-030 a TC-035 | Funcional |
| `05-celebrations.spec.ts` | Celebrações + Aprovação | TC-040 a TC-046 | Funcional |
| `06-schedules.spec.ts` | Escalas CRUD | TC-050 a TC-054 | Funcional |
| `07-multitenant.spec.ts` | Isolamento Multi-tenant | TC-060 a TC-064 | Segurança CRÍTICO |
| `08-security.spec.ts` | Segurança | TC-070 a TC-074 | Segurança |
| `09-negative.spec.ts` | Cenários Negativos | TC-080 a TC-090 | Regressão |
| `10-edge-cases.spec.ts` | Edge Cases + Performance | TC-100 a TC-114 | Robustez/Perf |

---

## Infraestrutura de Testes

```
tests/e2e/
├── global.setup.ts          # Cria fixtures no Supabase via service role
├── helpers/
│   ├── auth.ts              # loginAs(), logout(), loadTestEnv()
│   └── supabase-admin.ts    # createTestParish(), createTestUser(), cleanupParish()
├── 01-auth.spec.ts
├── ...
└── 10-edge-cases.spec.ts
playwright.config.ts         # Config: serial workers, webServer, reporters
```

**Dados de Teste:** `global.setup.ts` cria automaticamente:
- 2 paróquias (paróquia A e paróquia B)
- 4 usuários (admin/coordenador/membro para paróquia A; admin para paróquia B)
- 1 pastoral + 1 membro na paróquia A
- Estado salvo em `.test-env.json` (gitignored)

---

## Prioridade dos Testes

### 🔴 P1 — Críticos (executar em todo CI/deploy)

| TC | Descrição | Motivo |
|----|-----------|--------|
| TC-001 | Login válido admin | Porta de entrada |
| TC-003 | Logout limpa sessão | Segurança |
| TC-010 | Admin vê menu completo | RBAC core |
| TC-013 | Membro não acessa /members | RBAC core |
| TC-060 | Paróquia B não vê dados da A (UI) | **Multi-tenant crítico** |
| TC-062 | API retorna vazio para parish errada | **RLS crítico** |
| TC-070 | Não autenticado → redireciona /login | Segurança básica |
| TC-071 | API sem token retorna vazio | RLS sem JWT |
| TC-040 | Admin cria celebração aprovada | Fluxo principal |
| TC-041 | Coordenador cria celebração pendente | Fluxo aprovação |
| TC-042 | Admin aprova celebração | Fluxo aprovação |
| TC-030 | Admin vê membro do setup | Sanidade CRUD |
| TC-081 | Login com senha errada → erro | Autenticação |

### 🟡 P2 — Importantes (executar antes de release)

| TC | Descrição |
|----|-----------|
| TC-020 a TC-023 | CRUD completo de pastorais |
| TC-031 a TC-034 | CRUD completo de membros |
| TC-050 a TC-053 | CRUD de escalas + atribuições |
| TC-072 | Coordenador não vê member_profiles (CPF) |
| TC-073 | SQL injection sanitizado |
| TC-074 | XSS não executa |
| TC-085 | Membro não pode criar pastoral |
| TC-088 | Membro não pode criar celebração |

### 🟢 P3 — Cobertura adicional (executar semanalmente)

| TC | Descrição |
|----|-----------|
| TC-035, TC-100 a TC-107 | Edge cases de input |
| TC-110 a TC-114 | Performance básica |
| TC-063, TC-064 | Multi-tenant API e URL |
| TC-089, TC-090 | Validações de formulário |

---

## Decisão: Playwright vs Cypress

**Recomendação: Playwright** ✅

| Critério | Playwright | Cypress |
|----------|-----------|---------|
| TypeScript nativo | ✅ | ✅ |
| Multi-browser | ✅ (Chrome, Firefox, Safari) | ⚠️ (Chrome only grátis) |
| Teste de API/REST | ✅ `page.request` nativo | ⚠️ `cy.request` limitado |
| Acesso a localStorage | ✅ `page.evaluate` | ✅ |
| Workers paralelos | ✅ | ⚠️ Pago |
| Supabase RLS testing | ✅ request direto | ✅ |
| já instalado no projeto | ✅ `@playwright/test` | ❌ |

O projeto já usa Playwright — manter consistência.

---

## Como Executar

```bash
# Instalar browsers (primeira vez)
npx playwright install chromium

# Executar todos os testes
npm test

# Interface visual interativa
npm run test:ui

# Testes com browser visível
npm run test:headed

# Ver último relatório HTML
npm run test:report

# Debug de um teste específico
npm run test:debug -- tests/e2e/07-multitenant.spec.ts
```

### Variáveis de ambiente necessárias (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...    # Para global.setup.ts criar fixtures
TEST_ADMIN_EMAIL=admin@paroquia-test.dev
TEST_ADMIN_PASSWORD=...
TEST_COORD_EMAIL=coord@paroquia-test.dev
TEST_COORD_PASSWORD=...
TEST_MEMBER_EMAIL=member@paroquia-test.dev
TEST_MEMBER_PASSWORD=...
TEST_ADMIN2_EMAIL=admin2@paroquia-test.dev
TEST_ADMIN2_PASSWORD=...
```

---

## Notas de Implementação

1. **Workers seriais (`workers: 1`)**: Configurado para respeitar o rate limit do Supabase free tier. Aumentar para `workers: 4` quando em plano pago ou staging dedicado.

2. **Tokens via localStorage**: Alguns testes de API (TC-062, TC-063, TC-072) tentam obter o JWT do localStorage. Se o projeto migrar para cookies `httpOnly`, esses testes serão automaticamente ignorados via `test.skip()`.

3. **Fluxo de aprovação de celebrações**: TC-041 → TC-042 dependem de execução em ordem. O `global.setup.ts` não pré-cria esses dados — eles são criados dentro dos próprios testes, garantindo isolamento.

4. **Limpeza de dados**: `global.setup.ts` registra `test.afterAll` que chama `cleanupParish()` para remover os dados de teste. Em caso de falha no cleanup, re-executar o setup limpará dados órfãos.

5. **Multi-tenant como P1**: TC-060 a TC-063 são os mais críticos do sistema. Uma falha aqui significa vazamento de dados entre clientes — bloqueador de deploy imediato.
