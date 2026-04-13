# Story 1.2: Authentication with Magic Link

Status: done

## Story

As a parish admin,
I want to authenticate via Magic Link,
so that I can securely access my parish dashboard without managing a password.

## Acceptance Criteria

1. **Given** I am on the login page `/login` **When** I enter my email and submit the form **Then** `supabase.auth.signInWithOtp({ email })` is called and a success message is displayed ("Check your email for the magic link")

2. **Given** I click the magic link in my email **When** Supabase redirects to `/auth/callback?code=...` **Then** the callback route exchanges the code for a session via `supabase.auth.exchangeCodeForSession(code)` and redirects me to `/dashboard`

3. **Given** I try to access any route under `/(dashboard)` (e.g., `/dashboard`, `/members`, `/schedules`) **When** I am not authenticated **Then** the root `middleware.ts` redirects me to `/login`

4. **Given** I am authenticated and navigate to `/login` **When** the middleware runs **Then** I am redirected to `/dashboard`

5. **Given** I am authenticated **When** I trigger the logout Server Action **Then** `supabase.auth.signOut()` is called and I am redirected to `/login`

6. **Given** the dashboard layout renders **When** a Server Component fetches the current user **Then** the user's data is available for display in the layout

## Tasks / Subtasks

- [ ] Task 1 — Root middleware for route protection (AC: 3, 4)
  - [ ] Create `middleware.ts` at project root
  - [ ] Create Supabase client inline (DO NOT use lib/supabase/server — middleware uses edge runtime)
  - [ ] Refresh session via `supabase.auth.getUser()` on every request
  - [ ] Redirect unauthenticated requests to `/login` for protected paths: `/dashboard`, `/celebrations`, `/schedules`, `/members`, `/pastorals`, `/settings`
  - [ ] Redirect authenticated users away from `/login` to `/dashboard`
  - [ ] Set matcher to cover all paths except static assets and `_next`

- [ ] Task 2 — Auth callback route (AC: 2)
  - [ ] Create `app/auth/callback/route.ts` as a Next.js Route Handler (GET)
  - [ ] Extract `code` from URL search params
  - [ ] Call `supabase.auth.exchangeCodeForSession(code)` using server client
  - [ ] On success: redirect to `next` param or `/dashboard`
  - [ ] On error: redirect to `/login?error=auth_callback_failed`

- [ ] Task 3 — Login page UI and Server Action (AC: 1)
  - [ ] Create `app/(public)/login/actions.ts` with `signInWithMagicLink(email: string)` Server Action
  - [ ] Action calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })`
  - [ ] `emailRedirectTo` must point to `{origin}/auth/callback`
  - [ ] Replace placeholder in `app/(public)/login/page.tsx` with full UI (see Dev Notes for design spec)
  - [ ] Form has controlled state — use `useActionState` (React 19) or `useState` for email + loading + success
  - [ ] On success: display "Verifique seu e-mail para o link de acesso" message
  - [ ] On error: display error toast using Sonner

- [ ] Task 4 — Logout Server Action (AC: 5)
  - [ ] Create `app/(dashboard)/actions.ts` (or `features/auth/actions.ts`) with `signOut()` Server Action
  - [ ] Action calls `supabase.auth.signOut()` then `redirect('/login')`
  - [ ] Export from `features/auth/index.ts`

- [ ] Task 5 — Dashboard layout auth check (AC: 6)
  - [ ] Update `app/(dashboard)/layout.tsx` to fetch current user via `supabase.auth.getUser()`
  - [ ] If no user: `redirect('/login')` (defense in depth — middleware already handles this)
  - [ ] Make user data available as prop or context for child pages
  - [ ] Add minimal layout chrome: navigation sidebar placeholder (content will be populated in Story 2.1)

## Dev Notes

### ⚠️ Critical: Middleware Edge Runtime

The root `middleware.ts` runs on Edge Runtime. **Do NOT import `@/lib/supabase/server`** (it uses `next/headers` which is not available in Edge). Instead, create the Supabase client inline inside middleware.ts using `createServerClient` directly from `@supabase/ssr`. The `lib/supabase/middleware.ts` helper from Story 1.1 already demonstrates this correct pattern.

```typescript
// middleware.ts — edge-compatible supabase client
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const PROTECTED_PATHS = ['/dashboard', '/celebrations', '/schedules', '/members', '/pastorals', '/settings']
  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### Auth Callback Route

The magic link email redirects to `/auth/callback?code=PKCE_CODE`. This route must:
1. Exchange the code for a session
2. Redirect to the original destination or `/dashboard`

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
```

### Login Page Design Spec

No login mockup exists in the UX file, but the design system (from `ux-design.md`) defines:
- **Background:** `#f7fafc` (surface)
- **Primary:** `#002045` (deep navy)
- **Accent:** `#fed65b` (secondary-container)
- **Font heading:** Manrope — use `font-heading` Tailwind class
- **Font body:** Work Sans — default body font

Design the login page as a centered card on a gradient background:

```tsx
// app/(public)/login/page.tsx — design reference
// Full-screen: bg-gradient-to-br from-[#002045] to-[#1a365d]
// Centered white card: max-w-sm, rounded-xl, shadow-2xl, p-8
// Logo: "Paróquia+" in Manrope bold, primary color
// Subtext: "Acesse sua paróquia com segurança" in Work Sans
// Email input with Label (shadcn/ui)
// Submit button: full width, bg-primary text-white
// Success state: swap form for success message (check icon + text)
```

Use `"use client"` directive on the login page because it requires form state management (loading, success, error).

### signInWithOtp — emailRedirectTo

The `emailRedirectTo` must be an absolute URL. Build it dynamically from headers:

```typescript
// app/(public)/login/actions.ts
'use server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function signInWithMagicLink(email: string) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? ''

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) throw error
}
```

### React 19 — useActionState

This project uses React 19. The hook for handling Server Action state is `useActionState` (replaces `useFormState` from React DOM). Use it for managing loading and success/error states from the login form.

```typescript
import { useActionState } from 'react'
```

If you prefer simpler state management without `useActionState`, use `useState` with a regular async call wrapped in `try/catch` — both are valid in React 19.

### Dashboard Layout — Server-Side Auth Check

The `/(dashboard)/layout.tsx` must verify auth server-side as a second layer of protection:

```typescript
// app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
```

### Supabase Auth Configuration

For Magic Link to work, the Supabase project must have:
1. **Email Auth enabled** in Auth → Providers → Email
2. **Site URL** set to `http://localhost:3000` (dev) in Auth → URL Configuration
3. **Redirect URLs** allowlist: `http://localhost:3000/auth/callback`

These are Supabase dashboard settings — not code changes. Include a note in the story completion notes so the next developer knows to configure this.

### Code Standards (NFR6)

- All code in **English**
- All comments in **Portuguese**
- Server Components by default; use `"use client"` only on the login page (needs form state)
- No `any` types

### Installed Packages (Story 1.1)

Already available — do NOT reinstall:
- `@supabase/supabase-js` — auth client
- `@supabase/ssr` — `createServerClient` for middleware and server components
- `shadcn/ui`: `button`, `input`, `label`, `card`, `sonner` — all ready to use

### References

- [Source: docs/architecture/10-autenticao.md] — Authentication requirements
- [Source: docs/architecture/5-frontend-nextjs-15.md] — Server-first, minimal client components
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2] — Acceptance criteria
- [Source: _bmad-output/planning-artifacts/ux-design.md] — Design system colors and fonts
- [Source: lib/supabase/middleware.ts] — updateSession pattern (Story 1.1 reference)
- [Source: lib/supabase/server.ts] — Server client implementation
- Story 1.1 learnings: Next.js 16.2.3 (not 15), React 19, TailwindCSS v4 (no tailwind.config.js)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Next.js 16.2.3 renomeou `middleware.ts` → `proxy.ts` e a função exportada `middleware` → `proxy`. O arquivo foi criado como `proxy.ts` com export `proxy`.
- O Supabase precisa estar configurado no dashboard: Email Auth ativado, Site URL = `http://localhost:3000`, Redirect URL = `http://localhost:3000/auth/callback`.
- TailwindCSS v4 em uso — sem `tailwind.config.js`, tudo via `@theme` no `globals.css`.

### File List

- `proxy.ts` — proxy de autenticação Edge Runtime (proteção de rotas)
- `app/auth/callback/route.ts` — troca do código PKCE por sessão
- `app/(public)/login/page.tsx` — UI da página de login (client component)
- `app/(public)/login/actions.ts` — Server Action `signInWithMagicLink`
- `app/(dashboard)/layout.tsx` — layout com auth check server-side
- `features/auth/actions.ts` — Server Action `signOut`
- `features/auth/index.ts` — exportações do módulo
