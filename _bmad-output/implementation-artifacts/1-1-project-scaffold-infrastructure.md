# Story 1.1: Project Scaffold & Infrastructure

Status: ready-for-dev

## Story

As a developer,
I want the project scaffolded with Next.js 15, Supabase, and the MCP layer,
So that all subsequent stories have a consistent, production-ready foundation.

## Acceptance Criteria

1. **Given** the project setup is complete **When** inspecting the folder structure **Then** all required directories exist: `/app/(public)/login`, `/app/(public)/register`, `/app/(dashboard)/dashboard`, `/app/(dashboard)/celebrations`, `/app/(dashboard)/schedules`, `/app/(dashboard)/members`, `/app/(dashboard)/pastorals`, `/app/(dashboard)/settings`, `/components/ui`, `/components/shared`, `/features/auth`, `/features/parish`, `/features/celebration`, `/features/schedule`, `/features/member`, `/features/subscription`, `/lib/supabase`, `/lib/mcp`, `/lib/auth`, `/lib/validators`, `/lib/utils`, `/services`, `/repositories`

2. **Given** the project is running **When** `npm run dev` is executed **Then** Next.js starts without errors with TypeScript strict mode, TailwindCSS, and shadcn/ui configured

3. **Given** the Supabase client setup **When** inspecting `/lib/supabase` **Then** a browser client (`client.ts`) and server client (`server.ts`) exist using `@supabase/supabase-js` and `@supabase/ssr`

4. **Given** the MCP layer **When** inspecting `/lib/mcp` **Then** skeleton files exist: `parish.mcp.ts`, `schedule.mcp.ts`, `member.mcp.ts` — each exporting typed placeholder functions that call the Supabase server client

5. **Given** the Supabase project **When** inspecting the database **Then** the `parishes` and `users` tables exist with RLS enabled and base policy `parish_id = auth.jwt()->>'parish_id'`

6. **Given** environment configuration **When** inspecting the project root **Then** `.env.example` documents all required variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Tasks / Subtasks

- [ ] Task 1 — Install missing dependencies (AC: 2, 3)
  - [ ] `npm install @supabase/supabase-js @supabase/ssr`
  - [ ] Initialize shadcn/ui: `npx shadcn@latest init` (select default style, TailwindCSS)
  - [ ] Install shadcn/ui base components: `npx shadcn@latest add button input label card toast`

- [ ] Task 2 — Create full folder structure (AC: 1)
  - [ ] Create route groups: `/app/(public)/login/page.tsx`, `/app/(public)/register/page.tsx`
  - [ ] Create dashboard routes: `/app/(dashboard)/dashboard/page.tsx`, `/app/(dashboard)/celebrations/page.tsx`, `/app/(dashboard)/schedules/page.tsx`, `/app/(dashboard)/members/page.tsx`, `/app/(dashboard)/pastorals/page.tsx`, `/app/(dashboard)/settings/page.tsx`
  - [ ] Create layout files: `/app/(public)/layout.tsx`, `/app/(dashboard)/layout.tsx`
  - [ ] Create feature folders with `index.ts` barrel files: `/features/auth`, `/features/parish`, `/features/celebration`, `/features/schedule`, `/features/member`, `/features/subscription`
  - [ ] Create utility folders: `/lib/auth`, `/lib/validators`, `/lib/utils`, `/services`, `/repositories`, `/components/shared`

- [ ] Task 3 — Configure Supabase clients (AC: 3)
  - [ ] Create `/lib/supabase/client.ts` — browser client using `createBrowserClient`
  - [ ] Create `/lib/supabase/server.ts` — server client using `createServerClient` with cookies
  - [ ] Create `/lib/supabase/middleware.ts` — helper to refresh session in middleware

- [ ] Task 4 — Create MCP layer skeleton (AC: 4)
  - [ ] Create `/lib/mcp/parish.mcp.ts` with typed placeholder functions
  - [ ] Create `/lib/mcp/schedule.mcp.ts` with typed placeholder functions
  - [ ] Create `/lib/mcp/member.mcp.ts` with typed placeholder functions
  - [ ] Create `/lib/mcp/index.ts` barrel exporting all MCP modules

- [ ] Task 5 — Initialize Supabase project and DB schema (AC: 5)
  - [ ] Run `npx supabase init` in project root
  - [ ] Create migration: `npx supabase migration new initial_schema`
  - [ ] Write SQL for `parishes` and `users` tables with RLS
  - [ ] Apply migration locally or push to remote Supabase project

- [ ] Task 6 — Environment configuration (AC: 6)
  - [ ] Create `.env.example` with all required variables
  - [ ] Create `.env.local` (gitignored) with actual values
  - [ ] Verify `.gitignore` includes `.env.local` and `supabase/.temp`

- [ ] Task 7 — Placeholder pages and global layout (AC: 2)
  - [ ] Update `/app/layout.tsx` with Manrope/Work Sans fonts (per UX design)
  - [ ] Add Toaster from shadcn/ui to root layout
  - [ ] Create minimal placeholder content for all route pages (h1 + "em construção")
  - [ ] Move existing `page.tsx` and `globals.css` to proper location or update

## Dev Notes

### ⚠️ Critical: Installed Versions

The project already has these packages installed — DO NOT reinstall or change:
- `next`: **16.2.3** (App Router, React Server Components, Server Actions)
- `react`: **19.2.4**
- `tailwindcss`: **^4** (different config from v3 — no `tailwind.config.js`, uses CSS-first config in `globals.css`)
- `supabase`: **^2.88.1** (this is the Supabase CLI — used for migrations, NOT the JS client)
- `typescript`: **^5**

You still need to install:
- `@supabase/supabase-js` — JS client for DB/Auth operations
- `@supabase/ssr` — SSR-compatible session helpers for Next.js App Router

### ⚠️ TailwindCSS v4 Differences

TailwindCSS v4 uses **CSS-first configuration** — there is no `tailwind.config.js`. Configuration lives in `globals.css` using `@theme` directive. Do NOT create a `tailwind.config.js` file.

Shadcn/ui `init` will handle the TailwindCSS v4 integration automatically when you select the correct options during setup.

### ⚠️ Next.js 16 / React 19

The installed version is Next.js 16.2.3 with React 19. All App Router patterns apply. Use Server Components by default; only use `"use client"` when state or browser APIs are required.

### Project Structure Notes

**Existing files (do not delete):**
```
app/
  favicon.ico       ← keep
  globals.css       ← keep, shadcn init will update it
  layout.tsx        ← update (add fonts, Toaster)
  page.tsx          ← replace with redirect to /login or /dashboard
```

**Route groups to create:**
```
app/
  (public)/
    layout.tsx        ← minimal layout, no auth check
    login/
      page.tsx
    register/
      page.tsx
  (dashboard)/
    layout.tsx        ← will add auth check in Story 1.2
    dashboard/
      page.tsx
    celebrations/
      page.tsx
    schedules/
      page.tsx
    members/
      page.tsx
    pastorals/
      page.tsx
    settings/
      page.tsx
```

### MCP Layer Pattern

All MCP files must follow this pattern — they are the ONLY point of contact with Supabase:

```typescript
// lib/mcp/parish.mcp.ts
// Camada de acesso ao Supabase para dados de paróquia
import { createClient } from '@/lib/supabase/server'

// Busca a paróquia do usuário autenticado
export async function getParish(parishId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parishes')
    .select('*')
    .eq('id', parishId)
    .single()
  if (error) throw error
  return data
}
```

**Rule:** No file outside `/lib/mcp/` may import from `@/lib/supabase/server` directly. All DB access goes through MCP.

### Supabase DB Schema — Story 1.1 Scope

Only create `parishes` and `users` tables in this story. Other tables are created in later stories when needed.

```sql
-- Tabela de paróquias (tenants)
create table parishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- RLS: isolamento por paróquia
alter table parishes enable row level security;

create policy "parishes_isolation" on parishes
  for all using (id = (auth.jwt()->>'parish_id')::uuid);

-- Tabela de usuários (estende auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  parish_id uuid references parishes(id),
  role text not null default 'member' check (role in ('admin', 'coordinator', 'member')),
  full_name text,
  created_at timestamptz default now()
);

alter table users enable row level security;

create policy "users_isolation" on users
  for all using (parish_id = (auth.jwt()->>'parish_id')::uuid);
```

### UX Reference — Fonts

Per UX design mockups, the app uses:
- **Headlines:** `Manrope` (weights 400, 600, 700, 800)
- **Body/Labels:** `Work Sans` (weights 300, 400, 500, 600)

Add to root layout:
```tsx
import { Manrope, Work_Sans } from 'next/font/google'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-headline' })
const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-body' })
```

### Code Standards (NFR6)

- All code in **English**
- All comments in **Portuguese**
- Small functions with single responsibility
- No `any` types — use proper TypeScript types throughout

### References

- [Source: docs/architecture/4-estrutura-de-pastas.md] — Folder structure definition
- [Source: docs/architecture/8-camada-mcp.md] — MCP layer specification
- [Source: docs/architecture/6-banco-de-dados.md] — Database tables
- [Source: docs/architecture/7-segurana-rls.md] — RLS policy pattern
- [Source: docs/architecture/5-frontend-nextjs-15.md] — Frontend principles
- [Source: docs/architecture/14-padres-de-cdigo.md] — Code standards
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — Story requirements
- [Source: _bmad-output/planning-artifacts/ux-design.md] — Font and color system

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
