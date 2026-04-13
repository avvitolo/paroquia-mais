# Story 1.3: Parish Registration & Stripe Onboarding

Status: ready-for-dev

## Story

As a parish admin,
I want to register my parish and complete payment via Stripe,
So that my parish is provisioned as an isolated tenant and I can access the platform.

## Acceptance Criteria

1. **Given** I am on `/register` **When** I fill in parish name, my email, and select a plan **Then** a Stripe Checkout session is created and I am redirected to Stripe's hosted checkout page

2. **Given** the Stripe payment is completed successfully **When** the Stripe webhook fires `checkout.session.completed` **Then** a Supabase Edge Function processes the event and:
   - Creates a record in `parishes` table with a unique `id` (UUID) and the parish name
   - Creates a record in `subscriptions` table with `status = 'active'`, `plan`, and Stripe IDs
   - Invites the admin user via `supabase.auth.admin.inviteUserByEmail` so they receive a Magic Link
   - The user record in `users` table is linked to the parish with `role = 'admin'` (created on first sign-in via a Supabase trigger or on webhook)

3. **Given** the Stripe payment fails or is cancelled **When** the user is redirected to `cancel_url` **Then** no tenant is created and the user sees the registration page with an error message

4. **Given** I complete payment **When** I click the Magic Link from the invite email **Then** I am authenticated and redirected to `/dashboard`

5. **Given** the webhook signature verification fails **When** the Edge Function receives a request **Then** it returns 400 and logs the error — no DB changes are made

## Tasks / Subtasks

- [ ] Task 1 — New Stripe dependency approval (HALT before proceeding)
  - [ ] Confirm with user: install `stripe` (server-side SDK, ~v17) — required for Checkout session creation and webhook verification
  - [ ] After approval: `npm install stripe`
  - [ ] Add env vars to `.env.local` and `.env.example`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_BASICO`, `STRIPE_PRICE_ID_PRO`

- [ ] Task 2 — Database migration: `subscriptions` table
  - [ ] Run `supabase migration new add_subscriptions_table`
  - [ ] Write SQL: create `subscriptions` table with columns: `id uuid PK`, `parish_id uuid FK parishes(id)`, `stripe_customer_id text`, `stripe_subscription_id text`, `stripe_session_id text`, `plan text check ('basico','pro')`, `status text check ('active','inactive','past_due','canceled')`, `created_at timestamptz default now()`
  - [ ] Enable RLS on `subscriptions`
  - [ ] Add RLS policy: `parish_id = (auth.jwt()->>'parish_id')::uuid` for SELECT
  - [ ] Apply migration via `supabase db push` or Supabase dashboard

- [ ] Task 3 — Register page UI (AC: 1, 3)
  - [ ] Replace placeholder in `app/(public)/register/page.tsx` with full client component
  - [ ] Use `"use client"` directive (form state required)
  - [ ] Fields: parish name (text), email (email), plan selection (radio: Básico / Pro)
  - [ ] On submit: call Server Action `createCheckoutSession`, handle redirect
  - [ ] Match login page design: gradient bg `from-[#002045] to-[#1a365d]`, white card, Manrope heading
  - [ ] Show loading state during submission
  - [ ] If `?canceled=true` in URL params: show "Pagamento cancelado" message

- [ ] Task 4 — Server Action: create Stripe Checkout session (AC: 1)
  - [ ] Create `app/(public)/register/actions.ts` with `createCheckoutSession(data: RegisterFormData)`
  - [ ] Mark `'use server'`
  - [ ] Use `stripe.checkout.sessions.create` with:
    - `mode: 'subscription'`
    - `line_items`: price ID from env based on selected plan
    - `customer_email`: user's email
    - `metadata`: `{ parish_name, admin_email, plan }`
    - `success_url`: `${origin}/register/success?session_id={CHECKOUT_SESSION_ID}`
    - `cancel_url`: `${origin}/register?canceled=true`
  - [ ] Return the checkout session URL and redirect via `redirect()` from `next/navigation`
  - [ ] NEVER use `STRIPE_SECRET_KEY` in client code — server-side only

- [ ] Task 5 — Supabase Edge Function: Stripe webhook handler (AC: 2, 5)
  - [ ] Create `supabase/functions/stripe-webhook/index.ts`
  - [ ] Verify Stripe signature using `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`
  - [ ] Handle `checkout.session.completed` event:
    - Extract `metadata.parish_name`, `metadata.admin_email`, `metadata.plan`, `customer`, `subscription`
    - Use Supabase service role client (available via `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` env)
    - Insert into `parishes`: `{ name: parish_name }`
    - Insert into `subscriptions`: `{ parish_id, stripe_customer_id: customer, stripe_subscription_id: subscription, stripe_session_id: session.id, plan, status: 'active' }`
    - Call `supabase.auth.admin.inviteUserByEmail(admin_email, { data: { parish_id, role: 'admin' } })` — this sends Magic Link and pre-fills app_metadata
  - [ ] Return 200 on success, 400 on signature failure, 500 on DB error
  - [ ] Register Edge Function URL in Stripe Dashboard webhook settings

- [ ] Task 6 — Register success page (AC: 4)
  - [ ] Create `app/(public)/register/success/page.tsx` (server component)
  - [ ] Display: "Paróquia registrada! Verifique seu e-mail para acessar o sistema."
  - [ ] Match design system (gradient bg, white card)
  - [ ] Link to `/login` for users who already have a session

- [ ] Task 7 — User-parish linkage on first sign-in trigger (AC: 2)
  - [ ] Create Supabase DB migration: `add_handle_new_user_trigger`
  - [ ] Write `handle_new_user()` PL/pgSQL function that runs `AFTER INSERT ON auth.users`
  - [ ] In the trigger: if `new.raw_app_meta_data->>'parish_id'` exists, insert into `users` table with `{ id: new.id, parish_id, email: new.email, full_name: new.email, role: new.raw_app_meta_data->>'role' }`
  - [ ] This ensures the `users` record is created automatically when the invited user signs in

## Dev Notes

### ⚠️ HALT Before Starting: New Dependency Required

`stripe` (npm) is NOT currently in `package.json`. **Ask the user before installing.** Do not run `npm install stripe` until explicitly approved.

### Next.js Version: 16.2.3 (NOT 15)

This project uses Next.js **16.2.3**, not 15. The middleware file is `proxy.ts` (not `middleware.ts`) and exports `proxy` (not `middleware`). Do NOT create `middleware.ts`. See `proxy.ts` for reference.

### Registration Form — Design Reference

Follow the exact same card pattern as the login page (`app/(public)/login/page.tsx`):

```tsx
// Full-screen gradient background
<main className="min-h-screen bg-gradient-to-br from-[#002045] to-[#1a365d] flex items-center justify-center p-4">
  <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8">
    <h1 className="font-heading text-3xl font-bold text-[#002045]">Paróquia+</h1>
    {/* form content */}
  </div>
</main>
```

Available shadcn/ui components (already installed): `Button`, `Input`, `Label`, `Card` from `@/components/ui/*`. Use `sonner` for toasts.

### Stripe Checkout — Server Action Pattern

```typescript
// app/(public)/register/actions.ts
'use server'
import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckoutSession(data: {
  parishName: string
  email: string
  plan: 'basico' | 'pro'
}) {
  const headersList = await headers()
  const origin = headersList.get('origin') ?? ''

  const priceId = data.plan === 'pro'
    ? process.env.STRIPE_PRICE_ID_PRO!
    : process.env.STRIPE_PRICE_ID_BASICO!

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: data.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      parish_name: data.parishName,
      admin_email: data.email,
      plan: data.plan,
    },
    success_url: `${origin}/register/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/register?canceled=true`,
  })

  redirect(session.url!)
}
```

### Supabase Edge Function — Stripe Webhook

Edge Functions run on Deno (not Node.js). Import Stripe from esm.sh or use the Deno-compatible version. The Supabase service role key is injected automatically as `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`.

```typescript
// supabase/functions/stripe-webhook/index.ts
import Stripe from 'https://esm.sh/stripe@17?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

Deno.serve(async (req) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { parish_name, admin_email, plan } = session.metadata!

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Cria paróquia
    const { data: parish, error: parishError } = await supabase
      .from('parishes')
      .insert({ name: parish_name })
      .select()
      .single()

    if (parishError) return new Response('DB error', { status: 500 })

    // Cria assinatura
    await supabase.from('subscriptions').insert({
      parish_id: parish.id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      stripe_session_id: session.id,
      plan,
      status: 'active',
    })

    // Convida admin — envia Magic Link com parish_id e role no app_metadata
    await supabase.auth.admin.inviteUserByEmail(admin_email, {
      data: { parish_id: parish.id, role: 'admin' },
    })
  }

  return new Response('ok', { status: 200 })
})
```

### DB Trigger — Auto-create `users` Record on Sign-in

When the invited user accepts the Magic Link, `auth.users` is updated. Use a trigger on `auth.users` to automatically create the `public.users` record:

```sql
-- supabase/migrations/TIMESTAMP_add_handle_new_user_trigger.sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  -- Cria registro em users apenas se parish_id estiver no app_metadata
  if new.raw_app_meta_data->>'parish_id' is not null then
    insert into public.users (id, parish_id, email, full_name, role)
    values (
      new.id,
      (new.raw_app_meta_data->>'parish_id')::uuid,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.email),
      coalesce(new.raw_app_meta_data->>'role', 'member')
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**Security note:** `raw_app_meta_data` is set server-side (via `inviteUserByEmail`) and is NOT user-editable, making it safe for authorization (unlike `raw_user_meta_data`). This is the correct pattern for RLS.

### Environment Variables

Add to `.env.local` (and document in `.env.example`):
```
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASICO=price_...
STRIPE_PRICE_ID_PRO=price_...
```

### Stripe Edge Function Secrets

Supabase Edge Functions require secrets set via CLI:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

These are NOT the same as `.env.local`. The Edge Function reads from `Deno.env`, not `.env.local`.

### MCP Layer

Story 1.1 established that all DB queries must go through `/lib/mcp`. However, the Supabase Edge Function is outside the Next.js app — it uses the Supabase client directly (service role). This is an exception: Edge Functions are backend infrastructure, not app code, so MCP does not apply there.

For any Next.js Server Actions that read subscription data, use `lib/mcp/subscription.mcp.ts` (create if needed).

### RLS Note

The `subscriptions` table RLS uses the JWT claim `parish_id`. This claim is injected by Supabase when the user's session is set up via the invite flow. The `handle_new_user` trigger sets `app_metadata.parish_id`, which Supabase includes in the JWT on the next token refresh.

### Code Standards (NFR6)

- All code in **English**
- All comments in **Portuguese**
- Server Components by default; `"use client"` only on register form
- No `any` types — use Stripe SDK types

### Installed Packages Available

Do NOT reinstall:
- `@supabase/supabase-js`, `@supabase/ssr` — already in package.json
- shadcn/ui: `button`, `input`, `label`, `card`, `sonner` — already available
- `supabase` CLI — in devDependencies

Must install (after user approval):
- `stripe` — NOT in package.json

### References

- Story 1.1 Dev Notes: Next.js 16.2.3, proxy.ts naming, TailwindCSS v4
- Story 1.2 Dev Notes: login page design pattern (card on gradient)
- `app/(public)/login/page.tsx` — design reference for register page
- `lib/mcp/parish.mcp.ts` — existing MCP pattern for parish queries
- `supabase/migrations/20260409143815_initial_schema.sql` — existing schema (`parishes`, `users`)
- Architecture: Stripe → Webhook → Edge Function → DB (critical flow)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

- `app/(public)/register/page.tsx` — registration form UI (modify existing placeholder)
- `app/(public)/register/actions.ts` — Server Action: create Stripe Checkout session
- `app/(public)/register/success/page.tsx` — post-payment success page
- `supabase/functions/stripe-webhook/index.ts` — Edge Function: webhook handler
- `supabase/migrations/TIMESTAMP_add_subscriptions_table.sql` — subscriptions table + RLS
- `supabase/migrations/TIMESTAMP_add_handle_new_user_trigger.sql` — auto-create users trigger
- `.env.local` — Stripe env vars (add)
- `.env.example` — document new Stripe env vars

### Change Log
