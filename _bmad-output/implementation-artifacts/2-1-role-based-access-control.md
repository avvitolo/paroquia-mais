# Story 2.1: Role-Based Access Control

Status: review

## Story

As a parish admin,
I want to assign roles to users (admin, coordinator, member),
So that each person only accesses the features appropriate to their responsibility.

## Acceptance Criteria

1. **Given** a user is authenticated **When** they access an admin-only route or Server Action **Then** the system verifies the user's role and users without `admin` role receive a redirect to `/dashboard` or a 403 response

2. **Given** I am logged in as `coordinator` **When** I access the dashboard **Then** I only see coordination features (schedules, celebrations, members of my pastoral) **And** I do not have access to `/settings` or role management UI

3. **Given** I am logged in as `member` **When** I access the dashboard **Then** I only see my own schedules and confirmation/decline actions **And** navigation to `/members`, `/pastorals`, `/settings` is hidden

## Tasks / Subtasks

- [x] Task 1 — Migration: add `coordinator` to role constraint
  - [x] Run `supabase migration new add_coordinator_role`
  - [x] SQL: `ALTER TABLE users DROP CONSTRAINT users_role_check; ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'coordinator', 'member'));`

- [x] Task 2 — `lib/mcp/user.mcp.ts`: getCurrentUser helper
  - [x] Create file with `getCurrentUser(): Promise<AppUser | null>`
  - [x] Query `public.users` by `supabase.auth.getUser()` uid
  - [x] Export type `AppUser` with fields: `id`, `parish_id`, `full_name`, `email`, `role`, `created_at`
  - [x] Export `AppRole = 'admin' | 'coordinator' | 'member'`
  - [x] Export helper `hasRole(user: AppUser, ...roles: AppRole[]): boolean`
  - [x] Add export to `lib/mcp/index.ts`

- [x] Task 3 — Role-based protection in `proxy.ts`
  - [x] Add role check after existing auth check
  - [x] Fetch user role from JWT: `user.app_metadata?.role` (string set by inviteUserByEmail)
  - [x] Define `ADMIN_ONLY_PATHS = ['/settings']`
  - [x] If authenticated user's role is not `admin` and path matches `ADMIN_ONLY_PATHS` → redirect to `/dashboard`
  - [x] Do NOT add role checks for `/members` or `/pastorals` at proxy level — those pages are also visible to `coordinator` (filtered UI is handled at page level)

- [x] Task 4 — Dashboard layout: provide user+role context
  - [x] Update `app/(dashboard)/layout.tsx` to call `getCurrentUser()` (from MCP) after auth check
  - [x] Pass `user` as prop to a new `DashboardShell` client component (or render nav inline)
  - [x] Render `<Sidebar user={user} />` component
  - [x] Create `components/dashboard/sidebar.tsx` (client component)
  - [x] Sidebar shows nav links filtered by role:
    - `admin`: Dashboard, Pastorais, Membros, Celebrações, Escalas, Configurações
    - `coordinator`: Dashboard, Membros, Celebrações, Escalas
    - `member`: Dashboard, Minhas Escalas

- [x] Task 5 — Sidebar component
  - [x] Create `components/dashboard/sidebar.tsx` as `"use client"`
  - [x] Receive `user: AppUser` as prop
  - [x] Use `hasRole()` to conditionally render nav items
  - [x] Style: dark navy left rail (`bg-[#002045]`), white text, active link highlight with `bg-[#1a365d]`
  - [x] Include logout button calling `signOut` Server Action
  - [x] Include user's `full_name` and role badge at top

- [x] Task 6 — Role guard Server Action helper
  - [x] Create `lib/auth/require-role.ts` with `requireRole(...roles: AppRole[]): Promise<AppUser>`
  - [x] Calls `getCurrentUser()`, throws redirect to `/dashboard` if role not in allowed list
  - [x] Server Actions in future stories must call this at the top for protected operations

## Dev Notes

### ⚠️ Critical: Schema mismatch — `coordinator` role missing

The initial schema (`20260409143815_initial_schema.sql`) defines:
```sql
role text not null default 'member' check (role in ('admin', 'member'))
```
`'coordinator'` is **not in the check constraint**. Task 1 migration is a prerequisite — without it, inserting a coordinator user will throw a DB constraint violation.

### Role in JWT vs. Database

The user's `role` is stored in two places:
- `auth.users.raw_app_meta_data->>'role'` — set by `inviteUserByEmail` webhook; available in JWT as `user.app_metadata.role`
- `public.users.role` — the canonical source; always query this for Server Actions

For proxy.ts (Edge Runtime), reading `user.app_metadata.role` from the JWT is the correct approach — no DB query possible in Edge Runtime.

For Server Actions and Server Components, use `getCurrentUser()` (Task 2) which reads from `public.users`.

### proxy.ts Pattern (Edge Runtime)

The file is `proxy.ts` (NOT `middleware.ts`) — this is Next.js 16.2.3. The export is named `proxy` (not `middleware`). Do NOT create a `middleware.ts` file.

Reading role in proxy:
```typescript
// Após obter o user do auth...
const role = user?.app_metadata?.role as string | undefined

const ADMIN_ONLY_PATHS = ['/settings']
const isAdminOnly = ADMIN_ONLY_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

if (isAdminOnly && role !== 'admin') {
  const url = request.nextUrl.clone()
  url.pathname = '/dashboard'
  return NextResponse.redirect(url)
}
```

### getCurrentUser MCP Pattern

Follow the established MCP pattern from `lib/mcp/parish.mcp.ts`:
```typescript
// lib/mcp/user.mcp.ts
import { createClient } from '@/lib/supabase/server'

export type AppRole = 'admin' | 'coordinator' | 'member'
export type AppUser = {
  id: string
  parish_id: string
  full_name: string
  email: string
  role: AppRole
  created_at: string
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  if (error) return null
  return data as AppUser
}

export function hasRole(user: AppUser, ...roles: AppRole[]): boolean {
  return roles.includes(user.role)
}
```

### require-role Server Action Guard

```typescript
// lib/auth/require-role.ts
'use server'
import { redirect } from 'next/navigation'
import { getCurrentUser, type AppRole, type AppUser } from '@/lib/mcp/user.mcp'

export async function requireRole(...roles: AppRole[]): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user || !roles.includes(user.role)) {
    redirect('/dashboard')
  }
  return user
}
```

### Dashboard Layout Pattern

```typescript
// app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/mcp/user.mcp'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar user={user} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
```

### Design System (from ux-design.md)

- Primary: `#002045` (deep navy)
- Primary container: `#1a365d`
- Surface: `#f7fafc`
- Secondary container: `#fed65b` (accent/highlight)
- Font heading: Manrope (`font-headline` class)
- Font body: Work Sans (default)
- Border radius: `rounded` = 0.125rem, `rounded-xl` = 0.5rem

Sidebar should use `bg-sacred-gradient` or `bg-[#002045]` with white text.

### Role Navigation Map

| Route | admin | coordinator | member |
|-------|-------|-------------|--------|
| /dashboard | ✓ | ✓ | ✓ |
| /pastorals | ✓ | ✗ | ✗ |
| /members | ✓ | ✓ | ✗ |
| /celebrations | ✓ | ✓ | ✗ |
| /schedules | ✓ | ✓ | ✓ |
| /settings | ✓ | ✗ | ✗ |

### Code Standards

- All code in **English**
- All comments in **Portuguese**
- Server Components by default; `"use client"` only on Sidebar (needs interactive state for mobile menu later)
- No `any` types — use `AppUser` and `AppRole`

### References

- `proxy.ts` — add role protection after existing auth check
- `app/(dashboard)/layout.tsx` — extend with getCurrentUser + Sidebar
- `lib/mcp/parish.mcp.ts` — pattern to follow for user.mcp.ts
- `features/auth/actions.ts` — signOut action (import in Sidebar)
- `supabase/migrations/20260409143815_initial_schema.sql` — role constraint to fix
- Story 1.2 learnings: proxy.ts naming, Edge Runtime restrictions (no next/headers)
- Story 1.3 learnings: app_metadata.parish_id/role set via inviteUserByEmail

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Migration `20260413191724_add_coordinator_role.sql` criada — correção crítica do constraint de role que não incluía 'coordinator'
- `lib/mcp/user.mcp.ts` criado com AppUser, AppRole, getCurrentUser e hasRole seguindo o padrão MCP existente
- `proxy.ts` estendido com proteção de rotas admin-only via JWT app_metadata (Edge Runtime compatível)
- Sidebar filtra navegação por papel; badge amarelo (#fed65b) indica papel atual
- `lib/auth/require-role.ts` criado para guard de Server Actions em stories futuras
- TypeScript compila sem erros

### File List

- `supabase/migrations/20260413191724_add_coordinator_role.sql` — adds coordinator to role constraint
- `lib/mcp/user.mcp.ts` — getCurrentUser, AppUser type, AppRole type, hasRole helper
- `lib/mcp/index.ts` — added user.mcp export
- `lib/auth/require-role.ts` — Server Action guard helper
- `components/dashboard/sidebar.tsx` — role-filtered navigation sidebar
- `app/(dashboard)/layout.tsx` — updated with getCurrentUser + Sidebar
- `proxy.ts` — extended with admin-only path protection

### Change Log

- 2026-04-13: Story 2.1 implementada — RBAC com migration coordinator, MCP user, sidebar filtrada por papel, guard de Server Actions
