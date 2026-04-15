---
stepsCompleted: [draft]
epic: 6
version: 1.0
date: 2026-04-15
---

# Epic 6: Melhorias de Fluxo e Funcionalidades Pastorais

## Contexto

Levantamento de melhorias identificadas após revisão das telas do sistema em 2026-04-15.
Baseado em análise do código existente e discussão com o time (party mode session).

---

## Story S1 — Política de Desconexão por Inatividade

**Como** usuário autenticado,
**Quero** ser desconectado automaticamente após 30 minutos de inatividade,
**Para que** minha sessão não fique exposta em dispositivos desacompanhados.

**Acceptance Criteria:**

- **Dado** que estou autenticado em qualquer rota do dashboard
- **Quando** não houver interação (mouse, teclado, toque) por 30 minutos
- **Então** um modal de aviso é exibido com contagem regressiva de 2 minutos

- **Dado** que o modal de aviso está visível
- **Quando** o tempo de 2 minutos expirar sem interação
- **Então** o sistema executa o logout (`/auth/signout`) automaticamente

- **Dado** que o modal de aviso está visível
- **Quando** o usuário interagir (clicar "Continuar")
- **Então** o timer é resetado e a sessão continua

**Dependências:** nenhuma
**Complexidade:** M
**Arquivo principal:** `components/auth/inactivity-guard.tsx`

---

## Story S2 — Membros: Desativar e Excluir

**Como** admin ou coordenador,
**Quero** poder desativar ou excluir permanentemente um membro,
**Para que** eu tenha controle completo sobre quem compõe o cadastro da paróquia.

**Acceptance Criteria:**

- **Dado** que um membro está ativo
- **Quando** clicar em "Desativar"
- **Então** `is_active` vai para `false` e o membro some das opções de escala (já implementado)

- **Dado** que um membro existe no sistema
- **Quando** clicar em "Excluir" e confirmar
- **E** o membro não possui atribuições em escalas
- **Então** o registro é removido permanentemente do banco

- **Dado** que o membro possui atribuições históricas
- **Quando** tentar excluir
- **Então** o sistema retorna erro explicativo e sugere desativação

**Dependências:** nenhuma
**Complexidade:** S
**Arquivos:** `lib/mcp/member.mcp.ts`, `features/members/actions.ts`, `components/members/member-crud.tsx`

---

## Story S3 — CRUD de Funções por Pastoral

**Como** admin ou coordenador,
**Quero** cadastrar funções específicas dentro de cada pastoral,
**Para que** as escalas possam ser organizadas com precisão por função.

**Exemplo:** Pastoral "Acólitos" → funções: Missal, Turíbulo, Naveta

**Acceptance Criteria:**

- **Dado** que estou na página de pastorais
- **Quando** expandir uma pastoral
- **Então** vejo a lista de funções cadastradas para ela

- **Dado** que estou gerenciando funções de uma pastoral
- **Quando** criar uma função com nome
- **Então** ela é salva em `pastoral_roles` vinculada à pastoral e paróquia

- **Dado** que uma função existe
- **Quando** clicar em excluir
- **E** ela não estiver em uso em nenhuma escala ou requisito de celebração
- **Então** ela é removida

**Dependências:** nenhuma (nova tabela)
**Complexidade:** M
**Arquivos:** `lib/mcp/pastoral-role.mcp.ts` (novo), `features/pastoral-roles/actions.ts` (novo), `components/pastorals/pastoral-crud.tsx`

---

## Story S4 — Requisitos de Pastoral/Função por Celebração

**Como** admin ou coordenador,
**Quero** definir quais pastorais e funções (e quantas vagas) são necessárias ao cadastrar uma celebração,
**Para que** a escala saiba exatamente o que precisa ser preenchido.

**Exemplo:** Missa de Pentecostes → 2× Acólito-Missal + 1× Acólito-Turíbulo + 1× Cantor

**Acceptance Criteria:**

- **Dado** que estou criando ou editando uma celebração
- **Quando** acessar a seção "Funções necessárias"
- **Então** posso adicionar requisitos (pastoral + função + quantidade)

- **Dado** que uma celebração tem requisitos cadastrados
- **Quando** abrir a escala dessa celebração
- **Então** os requisitos são exibidos com indicador "X de Y preenchidos"

- **Dado** que uma celebração tem requisitos
- **Quando** tentar publicar a escala com requisitos incompletos
- **Então** o sistema exibe aviso (não bloqueia, apenas alerta)

**Dependências:** S3
**Complexidade:** M
**Arquivos:** `lib/mcp/celebration-requirement.mcp.ts` (novo), `features/celebration-requirements/actions.ts` (novo), `components/celebrations/celebration-crud.tsx`

---

## Story S5 — Validação de Escala por Pastoral e Função

**Como** coordenador,
**Quero** que ao adicionar um membro à escala, o sistema filtre automaticamente as funções disponíveis com base na pastoral do membro,
**Para que** eu não possa escalar um membro para uma função que não é da sua pastoral.

**Acceptance Criteria:**

- **Dado** que estou adicionando um membro à escala
- **Quando** selecionar um membro
- **Então** o campo "Função" mostra apenas as funções das `celebration_requirements` que correspondem à pastoral daquele membro

- **Dado** que um membro não tem pastoral cadastrada
- **Quando** tentar adicioná-lo à escala
- **Então** o sistema exibe aviso e lista todas as funções da celebração (sem filtro)

- **Dado** que uma celebração não tem requisitos cadastrados
- **Quando** adicionar membro
- **Então** o campo "Função" aceita texto livre (comportamento atual mantido)

**Dependências:** S3 + S4
**Complexidade:** L
**Arquivos:** `components/schedules/schedule-detail.tsx`, `app/(dashboard)/schedules/[id]/page.tsx`

---

## Story S6 — Calendário de Escalas Publicadas

**Como** admin ou coordenador,
**Quero** visualizar as escalas em um calendário mensal,
**Para que** eu tenha visão completa das celebrações e status das escalas.

**Acceptance Criteria:**

- **Dado** que estou na página de Escalas
- **Quando** alternar para a aba "Calendário"
- **Então** vejo uma grade mensal com as escalas do mês

- **Dado** que o calendário está visível
- **Quando** passar o mouse ou clicar em uma escala
- **Então** vejo título da celebração, horário e status (rascunho/publicada)

- **Dado** que quero navegar entre meses
- **Quando** clicar nas setas de navegação
- **Então** o calendário avança ou retrocede o mês

**Dependências:** nenhuma
**Complexidade:** M
**Arquivos:** `components/schedules/schedule-calendar.tsx` (novo), `components/schedules/schedule-list.tsx`

---

## Story S7 — Portal do Membro: Minhas Escalas e Indisponibilidades

**Como** membro,
**Quero** um painel completo com minhas escalas, status de confirmação e gestão de indisponibilidades,
**Para que** eu possa me organizar e comunicar minha disponibilidade sem depender do coordenador.

**Acceptance Criteria:**

- **Dado** que estou logado como membro
- **Quando** acessar o dashboard
- **Então** vejo cards de próximas escalas com data, celebração, função e status de confirmação

- **Dado** que tenho uma escala pendente
- **Quando** clicar "Confirmar" ou "Recusar"
- **Então** meu status na `schedule_assignments` é atualizado

- **Dado** que quero registrar indisponibilidade
- **Quando** clicar em "Minhas Indisponibilidades"
- **Então** vejo uma lista das indisponibilidades registradas e posso adicionar ou remover

**Nota:** query `getMyAssignments` corrigida para filtrar `status = 'published'` no banco (não no cliente).

**Dependências:** nenhuma (aprimoramento do existente)
**Complexidade:** M
**Arquivos:** `app/(dashboard)/dashboard/page.tsx`, `lib/mcp/schedule.mcp.ts`, `components/dashboard/member-portal.tsx` (novo)

---

## Story S8 — Solicitação de Troca de Escala

**Como** membro,
**Quero** solicitar a troca de uma escala que não posso cumprir,
**Para que** o coordenador possa organizar um substituto sem precisar de contato direto.

**Acceptance Criteria:**

- **Dado** que tenho uma atribuição confirmada
- **Quando** clicar em "Solicitar Troca"
- **Então** posso informar o motivo e submeter a solicitação

- **Dado** que existe uma solicitação de troca
- **Quando** o coordenador acessar a escala
- **Então** vê o alerta e pode aprovar, recusar ou reatribuir

**Dependências:** S7
**Complexidade:** L
**Arquivos:** `supabase/migrations/...swap_requests.sql`, `lib/mcp/swap-request.mcp.ts`, `features/swap-requests/actions.ts`
**Status:** Backlog (próxima sprint)

---

## Story S9 — Fluxo de Acesso para Membros e Coordenadores

**Como** admin,
**Quero** criar usuários para membros e coordenadores vinculando-os a registros existentes,
**Para que** eles possam fazer login no mesmo portal e acessar suas funções específicas.

**Acceptance Criteria:**

- **Dado** que sou admin
- **Quando** editar um membro
- **Então** posso vincular um usuário existente ou convidar um novo por e-mail

- **Dado** que um convite é enviado
- **Quando** o usuário clicar no link do e-mail
- **Então** é redirecionado para definir senha e acessar o sistema com o papel correto

- **Dado** que o usuário faz login
- **Quando** o redirect pós-login é executado
- **Então** admin e coordinator vão para `/dashboard` (gestão), member vai para `/dashboard` (portal pessoal)

**Dependências:** nenhuma
**Complexidade:** M
**Status:** Backlog (próxima sprint — requer configuração de e-mail transacional)

---

## Backlog de Issues Técnicas

| # | Descrição | Origem | Prioridade |
|---|-----------|--------|-----------|
| T1 | Fix: `getMyAssignments` filtra `status=published` no cliente, não no banco | Análise código | Alta |
| T2 | `pastoral_id` em `members` é nullable — enforçar no form como recomendado | Análise | Média |
| T3 | Migração campo `role` string → `pastoral_role_id` nas escalas existentes | S3/S5 | Média |
| T4 | Envio paralelo de notificações (loop sequencial atual — ver deferred-work.md) | Deferred | Baixa |

---

## Sequência de Implementação

```
Sprint 1 (imediato):
  S1 → Inatividade (independente)
  S2 → Delete membro (independente)
  S3 → Funções por pastoral (independente)
  T1 → Fix query getMyAssignments

Sprint 2:
  S4 → Requisitos celebração (depende S3)
  S5 → Validação escala (depende S3+S4)
  S6 → Calendário escalas (independente)
  S7 → Portal do membro (depende T1)

Sprint 3 (backlog):
  S8 → Solicitação de troca
  S9 → Fluxo convite/login
  T2 → pastoral_id obrigatório
  T3 → Migração role → pastoral_role_id
```
