🏗️ Paróquia+ | PRD Técnico Otimizado (Next.js & Supabase)Data: 17 de Abril de 2026Arquitetura: Server-First com Camada de Abstração MCP1. Governança de Dados e Segurança (Strict RLS)Como o sistema é um SaaS Multi-tenant, a segurança não depende do frontend, mas da base de dados:Isolamento de Tenant: Cada query executada via Camada MCP deve validar o parish_id extraído do app_metadata do JWT do usuário.Camada MCP (/lib/mcp): Atua como o "Single Point of Truth". Nenhuma Server Action acessa o cliente Supabase diretamente, garantindo que validações de plano e regras de negócio sejam executadas em um único lugar.Logging Obrigatório: Toda mutação (Escala, Troca, Publicação) deve registrar um log na tabela de auditoria com o user_id e o timestamp.2. Otimização do Fluxo de Escalas (Epic 6)Com a migração total para código, podemos refinar as validações de backend de forma mais robusta que em plataformas low-code:Validação de Conflitos (FR10):Double-booking: O MCP deve verificar se o member_id já possui um schedule_assignment ativo para o mesmo celebration.date e horário.Indisponibilidade (FR8): Cruzamento obrigatório com a tabela member_availability antes de permitir a atribuição.Requisitos de Celebração (FR9):O sistema deve impedir a publicação se os requisitos obrigatórios (celebration_requirements) não atingirem a quantidade mínima definida.3. Gestão de Assinaturas e Limites (Commercial Gate)A integração com Stripe + Supabase Edge Functions é o motor do SaaS:Bloqueio de Acesso (BR1): O middleware do Next.js deve redirecionar para /billing se o status da subscriptions for diferente de active.Enforcement de Planos (BR2): O MCP deve realizar um count na tabela members antes de permitir novas inserções, comparando com o limite do plano atual da paróquia.4. Checklist Técnico Pré-Go-LiveCategoriaAção NecessáriaStatusInfraConfigurar o domínio oficial no Resend e atualizar as chaves de API no Vercel.⚠️ PendenteSegurançaAuditar todas as tabelas para garantir que RLS está ENABLED.✅ OKAuthReativar a confirmação de e-mail no Supabase para produção.⚠️ PendentePerformanceAdicionar índices nas colunas parish_id de todas as tabelas para otimizar o filtro de tenant.🔄 Em Progresso5. Padronização de DesenvolvimentoPara manter a escalabilidade do projeto "Carinho em Fio" e "Paróquia+":Nomenclatura: Continuar usando camelCase para campos técnicos.Organização: Manter o uso do Notion para o checklist de checkboxes das tarefas concluídas da Epic 6.

# ⛪ Paróquia+ — Product Requirements Document (SaaS Edition)

**Versão:** 2.1 (Full Code / No-Bubble)
**Data:** 17 de Abril de 2026
**Status:** Em Implementação (Foco: Epic 6)
**Arquitetura:** Next.js 15 + Supabase + MCP Layer

---

## 1. Visão Geral do Projeto
O **Paróquia+** é uma plataforma SaaS multi-tenant para gestão de escalas litúrgicas. O sistema substitui processos manuais por um fluxo automatizado de escalação, detecção de conflitos e confirmação de presença.

## 2. Pilares Tecnológicos (Stack)
* **Frontend:** Next.js 15+ (App Router), React Server Components (RSC).
* **Backend:** Supabase (Auth, PostgreSQL, RLS, Edge Functions).
* **Linguagem:** TypeScript (Strict Mode).
* **Comunicações:** Resend (E-mail transacional).
* **Pagamentos:** Stripe Checkout + Webhooks.

---

## 3. Arquitetura de Software (Crítica)

### 3.1 Camada MCP (Multi-tenant Command Pattern)
Toda interação com o banco de dados **DEVE** passar por `/lib/mcp`. Chamadas diretas ao cliente Supabase fora desta camada são proibidas.
* **Arquivos MCP:** `parish.mcp.ts`, `schedule.mcp.ts`, `member.mcp.ts`, `pastoral-role.mcp.ts`, `swap-request.mcp.ts`.
* **Fluxo:** Componente UI → Server Action → MCP → Supabase.

### 3.2 Isolamento de Dados (RLS)
O isolamento entre paróquias é garantido via Row-Level Security (RLS) no PostgreSQL, utilizando o `parish_id` injetado no `app_metadata` do usuário.

---

## 4. Regras de Negócio e Validações

### 4.1 Validação de Escalas (Core)
Ao tentar escalar um membro, o MCP deve validar:
1.  **Conflito de Horário:** Bloquear se o membro já estiver escalado em outra celebração no mesmo horário.
2.  **Indisponibilidade:** Validar contra a tabela `member_availability` (datas únicas, períodos, finais de semana ou dias de semana).
3.  **Vínculo de Pastoral:** Só permitir escalar membros que pertençam à pastoral exigida para a função (`member_pastorals`).

### 4.2 Gestão de Assinaturas
* **Bloqueio de Acesso:** Paróquias com assinatura `inactive` ou `past_due` são redirecionadas para a página de renovação.
* **Limites de Plano:** O sistema deve impedir a criação de novos membros ou pastorais caso o limite do plano contratado tenha sido atingido.

---

## 5. Requisitos Funcionais em Foco (Epic 6)

* **RF07 (Pastoral Roles):** Gerenciar funções específicas por pastoral (ex: Missal, Turíbulo).
* **RF13 (Swap Requests):** Fluxo para membros solicitarem trocas de escala com justificativa, sujeito à aprovação do coordenador.
* **RF18 (Inactivity Timeout):** Logout automático após 30 minutos de inatividade, com aviso prévio aos 28 minutos.
* **RF19 (Member Portal):** Dashboard exclusivo para membros gerenciarem suas escalas e disponibilidades.

---

## 6. Padrões de Desenvolvimento
* **Nomenclatura:** Usar `camelCase` para campos técnicos e nomes de arquivos.
* **Idioma:** Código em Inglês; Comentários em Português.
* **Organização:** Manter o acompanhamento de progresso via checklist no Notion.

---

## 7. Glossário Técnico
* **Tenant:** A Paróquia (unidade raiz de isolamento).
* **Pastoral:** Grupo de serviço (ex: Acólitos, Coro).
* **Escala (Schedule):** Atribuição de membros a funções em uma celebração específica.