# Story 6.2: Plan Limits Enforcement

Status: review

## Story

As a platform operator,
I want the system to enforce the plan's limits on members and pastorals,
So that parishes cannot exceed what their subscription allows.

## Acceptance Criteria

1. **Given** a parish is on the `basico` plan (limit: 30 members, 3 pastorals)
   **When** an admin tries to create a member that would exceed 30
   **Then** the Server Action throws an error: "Limite do plano atingido: máximo de 30 membros. Faça upgrade para o plano Pro."
   **And** the member is NOT created

2. **Given** a parish is on the `basico` plan
   **When** an admin tries to create a pastoral that would exceed 3
   **Then** the Server Action throws an error: "Limite do plano atingido: máximo de 3 pastorais. Faça upgrade para o plano Pro."
   **And** the pastoral is NOT created

3. **Given** a parish is on the `pro` plan (unlimited)
   **When** an admin creates any number of members or pastorals
   **Then** no limit is enforced — creation proceeds normally

4. **Given** the subscription fetch fails (null) or plan is unknown
   **When** a creation action runs
   **Then** creation proceeds normally (fail-open — never block due to infrastructure error)

5. **Given** a parish upgrades from `basico` to `pro` via Stripe
   **When** the webhook updates `subscriptions.plan` to `pro`
   **Then** the new unlimited limits apply immediately on the next action (no re-login required)

## Tasks / Subtasks

- [x] Task 1 — Define plan limits constants (AC: #1, #2, #3)
  - [x] Create `lib/plan-limits.ts` with exported constants `PLAN_LIMITS`
  - [x] `basico`: `{ members: 30, pastorals: 3 }`
  - [x] `pro`: `{ members: Infinity, pastorals: Infinity }`
  - [x] Export helper `getPlanLimits(plan: string): { members: number; pastorals: number }`

- [x] Task 2 — Add count functions to MCP (AC: #1, #2, #4)
  - [x] Add `countActiveMembers(parishId: string): Promise<number>` to `lib/mcp/member.mcp.ts`
  - [x] Add `countPastorals(parishId: string): Promise<number>` to `lib/mcp/pastoral.mcp.ts`
  - [x] Both use `adminClient` and count only for the given parishId
  - [x] Return 0 on error (fail-open)

- [x] Task 3 — Enforce member limit in `createMemberAction` (AC: #1, #3, #4)
  - [x] In `features/members/actions.ts`, before `createMember`:
    1. Fetch subscription via `getSubscriptionByParishId(user.parish_id)`
    2. Get limits via `getPlanLimits(subscription?.plan ?? 'pro')` — default to pro (fail-open)
    3. If `limits.members < Infinity`: count active members, check if count >= limit, throw error if so
  - [x] Error message: `Limite do plano atingido: máximo de ${limit} membros. Faça upgrade para o plano Pro.`

- [x] Task 4 — Enforce pastoral limit in `createPastoralAction` (AC: #2, #3, #4)
  - [x] In `features/pastorals/actions.ts`, before `createPastoral`:
    1. Fetch subscription via `getSubscriptionByParishId(user.parish_id)`
    2. Get limits via `getPlanLimits(subscription?.plan ?? 'pro')` — default to pro (fail-open)
    3. If `limits.pastorals < Infinity`: count pastorals, check if count >= limit, throw error if so
  - [x] Error message: `Limite do plano atingido: máximo de ${limit} pastorais. Faça upgrade para o plano Pro.`

## Dev Notes

### Plan Limits

| Plan | Members | Pastorals |
|------|---------|-----------|
| `basico` | 30 | 3 |
| `pro` | unlimited | unlimited |

### Fail-Open Rules

- Subscription fetch null → use `pro` limits (no restriction)
- Count query error → return 0 (creation proceeds)
- Unknown plan → use `pro` limits (no restriction)

### Architecture Constraints

- MCP rule: count queries go through `/lib/mcp`
- Plan limits are pure constants — no DB table needed
- Limit check happens BEFORE the creation call — no rollback needed
- `getSubscriptionByParishId` already exists in `lib/mcp/parish.mcp.ts` (Story 6.1)

### References

- `lib/mcp/parish.mcp.ts` — `getSubscriptionByParishId` (Story 6.1)
- `lib/mcp/member.mcp.ts` — add `countActiveMembers`
- `lib/mcp/pastoral.mcp.ts` — add `countPastorals`
- `features/members/actions.ts` — `createMemberAction`
- `features/pastorals/actions.ts` — `createPastoralAction`
- Epic 2 Story 2.4 AC in `_bmad-output/planning-artifacts/epics.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

(none yet)

### Completion Notes List

- `lib/plan-limits.ts` criado com `getPlanLimits` — `basico` = 30 membros / 3 pastorais, `pro` = ilimitado. Plano desconhecido: fail-open (retorna pro).
- `countActiveMembers` adicionada a `member.mcp.ts` — usa adminClient, conta apenas membros ativos, retorna 0 em erro.
- `countPastorals` adicionada a `pastoral.mcp.ts` — usa adminClient, retorna 0 em erro.
- `createMemberAction` agora verifica limite antes de criar: busca subscription, obtém limites, conta membros ativos, bloqueia com mensagem clara se >= limite.
- `createPastoralAction` aplica mesma lógica para pastorais.
- Ambas as actions usam `isFinite()` para pular a verificação quando o limite é `Infinity` (plano pro).
- Erros TypeScript pré-existentes em `schedule.mcp.ts:127,140` não afetam esta story.

### File List

- `lib/plan-limits.ts` — novo
- `lib/mcp/member.mcp.ts` — modificado (adicionado `countActiveMembers`)
- `lib/mcp/pastoral.mcp.ts` — modificado (adicionado `countPastorals`)
- `features/members/actions.ts` — modificado (imports + enforcement em createMemberAction)
- `features/pastorals/actions.ts` — modificado (imports + enforcement em createPastoralAction)
