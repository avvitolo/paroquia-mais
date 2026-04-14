# Story 6.1: Subscription Access Gate & Logging

Status: done

## Story

As a platform operator,
I want inactive subscriptions to block dashboard access and all critical operations to be logged,
So that access control is enforced and the system is auditable.

## Acceptance Criteria

1. **Given** a parish subscription is `inactive`, `past_due`, or `canceled`
   **When** the admin tries to access any route under `/(dashboard)`
   **Then** the dashboard layout detects the inactive subscription
   **And** renders a "subscription suspended" UI (inline, not a redirect) with a message explaining the situation and a contact/renewal link

2. **Given** any critical Server Action is executed (schedule creation, publication, member creation, pastoral creation)
   **When** the action completes successfully or fails
   **Then** a structured log entry is recorded via `console.log` with fields: `timestamp`, `user_id`, `parish_id`, `operation`, `status` (`success` | `failure`), and optional `error`

3. **Given** the subscription fetch itself fails (network/DB error)
   **When** the dashboard layout tries to check subscription status
   **Then** access is ALLOWED (fail-open) — subscription failure must not lock out the parish
   **And** the error is logged with `[checkSubscription]` prefix

4. **Given** a parish subscription is `active`
   **When** any user accesses the dashboard
   **Then** the normal dashboard renders without restriction

## Tasks / Subtasks

- [x] Task 1 — Add `getSubscriptionByParishId` to MCP layer (AC: #1, #3)
  - [x] Add function to `lib/mcp/parish.mcp.ts` that queries `subscriptions` table for the parish
  - [x] Return `{ status, plan }` or `null` on error (never throw)
  - [x] Use `createAdminClient` to bypass RLS (subscription check happens in layout before full auth context)

- [x] Task 2 — Create subscription suspended UI in dashboard layout (AC: #1, #3, #4)
  - [x] In `app/(dashboard)/layout.tsx`, after fetching the user, call `getSubscriptionByParishId(user.parish_id)`
  - [x] If status is `inactive`, `past_due`, or `canceled`: render an inline suspended notice (NOT a redirect) showing the status and a message
  - [x] Fail-open: if subscription fetch returns `null` (error), proceed normally
  - [x] Active subscriptions: render `{children}` as normal

- [x] Task 3 — Create structured logging utility (AC: #2)
  - [x] Create `lib/logger.ts` with `logOperation(params: LogParams): void`
  - [x] `LogParams`: `{ operation: string; userId: string; parishId: string; status: 'success' | 'failure'; error?: unknown }`
  - [x] Output: `console.log(JSON.stringify({ timestamp: new Date().toISOString(), ...params }))`
  - [x] Export type `LogParams` for use in Server Actions

- [x] Task 4 — Wire logging into critical Server Actions (AC: #2)
  - [x] `features/schedules/actions.ts`: log `createScheduleAction`, `publishScheduleAction`
  - [x] `features/members/actions.ts`: log `createMemberAction`
  - [x] `features/pastorals/actions.ts`: log `createPastoralAction`
  - [x] Pattern: try { ...existing logic...; logOperation({...success}); } catch (e) { logOperation({...failure, error: e}); throw e; }

## Dev Notes

### Existing Code to Reuse

- `lib/mcp/parish.mcp.ts` — add `getSubscriptionByParishId` here (file already exists)
- `app/(dashboard)/layout.tsx` — subscription check goes here after `getCurrentUser()`
- `features/schedules/actions.ts`, `features/members/actions.ts`, `features/pastorals/actions.ts` — wire logging here
- `lib/supabase/admin.ts` → `createAdminClient()` — use for subscription query

### Architecture Constraints

- MCP rule: subscription query must be in `/lib/mcp`, not directly in layout
- Server-only: `lib/logger.ts` is safe to import in server actions (no browser-sensitive data)
- Fail-open on subscription error: never block access due to DB failure
- Logging is fire-and-forget via `console.log` (no async, no external service) for MVP

### Subscription Status Values

| Status | Access |
|--------|--------|
| `active` | Full access |
| `inactive` | Blocked — show suspended notice |
| `past_due` | Blocked — show suspended notice |
| `canceled` | Blocked — show suspended notice |
| `null` (fetch error) | Allow — fail-open |

### Suspended UI Pattern

Render inline in the layout (replacing `{children}`), showing:
- "Assinatura Suspensa" heading
- Current status
- Message: "Sua assinatura está suspensa. Entre em contato para reativar."
- Simple button/link pointing to `/subscription` page (already exists)

### Log Format

```json
{"timestamp":"2026-04-14T10:00:00.000Z","operation":"createSchedule","userId":"uuid","parishId":"uuid","status":"success"}
{"timestamp":"2026-04-14T10:00:01.000Z","operation":"publishSchedule","userId":"uuid","parishId":"uuid","status":"failure","error":"message"}
```

### References

- `lib/mcp/parish.mcp.ts` — add subscription query here
- `app/(dashboard)/layout.tsx` — subscription gate
- Epic 1 Story 1.4 AC in `_bmad-output/planning-artifacts/epics.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

(none yet)

### Completion Notes List

- `getSubscriptionByParishId` adicionada a `lib/mcp/parish.mcp.ts` — usa adminClient, retorna null em erro (fail-open).
- Dashboard layout agora verifica assinatura após autenticação; statuses `inactive`, `past_due`, `canceled` renderizam notice inline com botão para `/subscription`.
- `lib/logger.ts` criado com `logOperation` — emite JSON estruturado com timestamp, operation, userId, parishId, status e error (opcional).
- Logging adicionado a 4 Server Actions críticas: `createScheduleAction`, `publishScheduleAction`, `createMemberAction`, `createPastoralAction` — padrão try/success/catch/failure.
- Erros TypeScript pré-existentes em `schedule.mcp.ts:127,140` não afetam esta story (documentados em 5-2).

### File List

- `lib/mcp/parish.mcp.ts` — modificado (adicionados `SubscriptionStatus`, `ParishSubscription`, `getSubscriptionByParishId`)
- `app/(dashboard)/layout.tsx` — modificado (subscription gate + suspended UI inline)
- `lib/logger.ts` — novo
- `features/schedules/actions.ts` — modificado (import + logging em createSchedule e publishSchedule)
- `features/members/actions.ts` — modificado (import + logging em createMember)
- `features/pastorals/actions.ts` — modificado (import + logging em createPastoral)
