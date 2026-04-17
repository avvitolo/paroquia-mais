---
title: ParoquiaMais — Product Requirements Document
version: 2.0
date: 2026-04-17
author: Atila
status: current
inputDocuments:
  - docs/prd/ (sharded — 14 sections)
  - docs/architecture/ (sharded — 16 sections)
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/implementation-artifacts/epic-6-melhorias-fluxo.md
  - _bmad-output/implementation-artifacts/deferred-work.md
  - _bmad-output/planning-artifacts/implementation-readiness-report-2026-04-09.md
  - supabase/migrations/ (20 migrations through 2026-04-16)
---

# Product Requirements Document — Paróquia+

**Project:** ParoquiaMais (Paróquia+)
**Author:** Atila
**Date:** 2026-04-17
**Version:** 2.0 (consolidated — reflects state as of 2026-04-16 including Epic 6 migrations)

---

## 1. Project Overview

**Paróquia+** is a multi-tenant SaaS platform for managing liturgical schedules in Catholic parishes. It centralizes agenda management, ministry (pastoral) organization, member coordination, and attendance confirmation — replacing manual processes with a structured, role-aware web application.

### Problem Statement

Parishes managing liturgical celebrations face recurring operational pain points:

- **Scheduling conflicts**: members double-booked or assigned while unavailable
- **Lack of organization**: schedules managed via WhatsApp groups or spreadsheets with no traceability
- **Low confirmation rates**: coordinators cannot reliably know who will attend
- **No centralized calendar**: celebrations, schedules, and member assignments exist in disconnected channels

### Vision

A single platform where each parish operates as an isolated tenant with full control over its pastorals, members, celebrations, and schedules — with automated conflict detection, publication workflows, and member confirmation.

---

## 2. Goals

### Primary Goal

Automate and centralize liturgical schedule management for Catholic parishes.

### Secondary Goals

- Reduce scheduling conflicts by 80%
- Improve attendance confirmation rates through direct notifications
- Scale to multiple parishes as a self-serve SaaS product
- Enforce subscription-based access with plan limits per tenant

---

## 3. Technology Stack

### Frontend

| Technology | Role |
|------------|------|
| Next.js 15+ (App Router) | Framework |
| React Server Components | Default rendering strategy |
| Server Actions | Mutation layer |
| TypeScript (strict mode) | Language |
| TailwindCSS | Styling |
| shadcn/ui | Component library |

### Backend

| Technology | Role |
|------------|------|
| Supabase (PostgreSQL) | Primary database |
| Supabase Auth | Authentication (Magic Link) |
| Supabase RLS | Row-level security (multi-tenancy) |
| Supabase Edge Functions | Stripe webhook processing |

### Payments

| Technology | Role |
|------------|------|
| Stripe Checkout | Subscription onboarding |
| Stripe Webhooks | Subscription status sync via Edge Functions |

### Notifications

| Technology | Role |
|------------|------|
| Resend | Transactional email delivery |

---

## 4. Architecture

### Folder Structure

```
/app
  /(public)       — landing, login, register
  /(auth)         — auth callbacks
  /(dashboard)    — protected routes (admin, coordinator, member views)
/components       — shared UI components
/features         — domain feature modules
/lib
  /supabase       — Supabase client initialization
  /mcp            — MCP layer (single access point to Supabase)
/services         — business logic services
/repositories     — data access patterns
```

### MCP Layer (Critical Architecture Rule)

All database queries **must** go through `/lib/mcp`. Direct Supabase calls from components or Server Actions are forbidden.

MCP files: `parish.mcp.ts`, `schedule.mcp.ts`, `member.mcp.ts`, `pastoral-role.mcp.ts`, `celebration-requirement.mcp.ts`, `swap-request.mcp.ts`

### Critical Data Flow

```
UI Component → Server Action → MCP → Supabase DB
```

No component or Server Action may bypass the MCP layer.

### Conventions

- Code written in English
- Comments written in Portuguese
- Small functions with single responsibility
- Server Components by default; Client Components only when interactivity requires it

---

## 5. Data Model

### Tables

| Table | Description |
|-------|-------------|
| `parishes` | Tenant root — each parish is an isolated tenant |
| `users` | Auth users linked to a parish with a role |
| `members` | Parish members (may not have a user account) |
| `member_pastorals` | N:N — members can belong to multiple pastorals |
| `pastorals` | Ministry groups within a parish |
| `pastoral_roles` | Specific functions within a pastoral (e.g., "Missal", "Turíbulo") |
| `member_availability` | Member unavailability windows |
| `celebrations` | Liturgical events on the parish calendar |
| `celebration_requirements` | Required pastoral functions per celebration (with quantity) |
| `schedules` | A schedule linking a celebration to assigned members |
| `schedule_assignments` | Individual member-to-role assignments within a schedule |
| `swap_requests` | Member requests to swap a schedule assignment |
| `subscriptions` | Stripe subscription status per parish |

### Multi-Tenancy Rule

Every table has a mandatory `parish_id UUID` column. RLS policies enforce isolation:

```sql
parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
```

### Key Schema Details

**`users.role`** — expanded role system (as of 2026-04-15):

```
admin_sistema | admin_paroquial | paroco | secretario | coordenador | membro
```

**`pastorals.coordinator_id`** — nullable FK to `members(id)`. Each pastoral can have a designated coordinator.

**`member_pastorals`** — replaces the single `members.pastoral_id` FK, enabling members to belong to multiple pastorals. Legacy `pastoral_id` column preserved for compatibility.

**`member_availability.availability_type`** — enum: `single_date | period | weekend | weekday`

**`schedule_assignments.pastoral_role_id`** — nullable FK to `pastoral_roles(id)`. Supports typed role assignments; text fallback maintained for backward compatibility.

**`celebration_requirements`** — links a celebration to required `(pastoral_id, pastoral_role_id, quantity)` tuples so coordinators know exactly what to fill.

---

## 6. Security

### Row-Level Security

RLS is mandatory and enabled on all tables. Base policy pattern:

```sql
parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
```

Role checks use `auth.jwt() -> 'app_metadata' ->> 'role'`.

### Role Hierarchy

| Role | Level | Description |
|------|-------|-------------|
| `admin_sistema` | Platform admin | Full access, manages subscriptions |
| `admin_paroquial` | Parish admin | Full access within the parish |
| `paroco` | Parish priest | Same permissions as admin_paroquial |
| `secretario` | Secretary | Same permissions as admin_paroquial |
| `coordenador` | Coordinator | Manages pastorals, members, celebrations, schedules |
| `membro` | Member | Views own schedules, confirms/declines, manages own availability |

### Route Protection

All routes under `/(dashboard)` are protected by Next.js middleware. Unauthenticated users are redirected to `/login`. Suspended subscriptions are redirected to a renewal page.

---

## 7. Functional Requirements

### FR1 — Parish Registration & Commercial Onboarding

The system must allow parish registration with plan selection and Stripe payment, granting immediate tenant access after confirmation.

**Flow:** `/register` → Stripe Checkout → Stripe Webhook → Edge Function → `parishes` record created → `subscriptions` record created → admin user linked → `/dashboard` access granted.

### FR2 — Multi-Tenant Data Isolation

The system must support multiple tenants (parishes) with full data isolation via RLS using `parish_id`. No data from one parish may be visible to users of another.

### FR3 — Authentication via Magic Link

The system must allow authentication via Magic Link (Supabase Auth) with a server-side session protected by middleware. No passwords required.

### FR4 — Role-Based Access Control

The system must enforce role-based access control with 6 distinct roles: `admin_sistema`, `admin_paroquial`, `paroco`, `secretario`, `coordenador`, `membro`. Each role maps to distinct UI surfaces and Server Action permissions.

### FR5 — Pastoral Management

The system must allow creation, editing, and deletion of pastorals (ministry groups). Each pastoral can have a designated coordinator (`coordinator_id`). Deletion blocked if active members or schedules are linked.

### FR6 — Member Management

The system must allow creation and management of members, including:
- Multi-pastoral assignment (N:N via `member_pastorals`)
- Activation/deactivation (`is_active` flag)
- Permanent deletion (blocked if historical schedule assignments exist)
- Optional user account linkage for member portal access

### FR7 — Pastoral Role Management

The system must allow creation and management of specific functions (roles) within each pastoral (e.g., "Acólito → Missal, Turíbulo, Naveta"). These roles are used in celebration requirements and schedule assignments.

### FR8 — Member Availability Management

The system must allow members (and admins/coordinators on their behalf) to register unavailability windows with types: `single_date`, `period`, `weekend`, `weekday`.

### FR9 — Parish Agenda (Celebrations)

The system must allow creation and management of celebrations on the parish liturgical calendar, including:
- Title, date, time, type (mass, novena, etc.)
- Approval flow (optional)
- Celebration requirements: which pastoral functions are needed and how many

### FR10 — Schedule Management

The system must allow creation of schedules for celebrations with:
- Member assignments to typed roles (`pastoral_role_id`)
- Conflict detection (double-booking + unavailability window checks)
- Requirement coverage indicator ("X of Y filled")
- Draft → Published status transition

### FR11 — Schedule Publication

Published schedules become visible to assigned members. Coordinators can only publish when no unresolved conflicts exist. A warning (non-blocking) is shown if celebration requirements are not fully met.

### FR12 — Member Attendance Confirmation

Members must be able to confirm or decline their presence on published schedules. Declined assignments appear as uncovered roles available for reassignment.

### FR13 — Schedule Swap Requests

Members must be able to request a schedule swap, providing a reason. Coordinators can review, approve, decline, or reassign the request.

### FR14 — Schedule Notifications

Upon schedule publication, email notifications must be sent to all assigned members via Resend. Notification includes: celebration name, date, time, assigned role, and a direct confirmation link. Notification failures are logged but do not revert publication.

### FR15 — Subscription Access Gate

Dashboard access is blocked when the parish subscription is `inactive` or `past_due`. A suspended subscription page with a renewal CTA is shown.

### FR16 — Plan Limits Enforcement

The system must enforce plan-based limits on the number of members and pastorals. Creating records beyond plan limits returns an error with an upgrade CTA.

### FR17 — Mandatory Operation Logging

All critical operations (schedule creation, publication, payment events, role changes) must be logged with: timestamp, `user_id`, `parish_id`, operation name, and status.

### FR18 — Session Inactivity Timeout

Users must be automatically logged out after 30 minutes of inactivity. A warning modal with a 2-minute countdown is shown before logout.

### FR19 — Member Portal

Members with user accounts must have a dedicated dashboard view showing:
- Upcoming schedule assignments with confirmation status
- Own unavailability management
- Swap request submission

### FR20 — Calendar View for Schedules

Coordinators and admins must be able to view schedules in a monthly calendar view, with navigation between months and status indicators (draft/published).

---

## 8. Non-Functional Requirements

| # | Requirement |
|---|-------------|
| NFR1 | Frontend: Next.js 15+, App Router, RSC, Server Actions, TypeScript strict, TailwindCSS, shadcn/ui |
| NFR2 | Backend: Supabase exclusively — no additional API layer |
| NFR3 | All DB queries via MCP layer (`/lib/mcp`) — direct Supabase calls forbidden |
| NFR4 | RLS mandatory on all tables; base policy uses `app_metadata.parish_id` |
| NFR5 | Performance: mandatory pagination on all list views; `revalidate` caching; indexes on `parish_id` |
| NFR6 | Code in English; comments in Portuguese; small single-responsibility functions |
| NFR7 | Server-first: Server Components by default; Client Components only when necessary |
| NFR8 | MVP: no mandatory automated test suite — manual validation + structured logging |

---

## 9. User Flows

### Commercial Flow

```
/register → Plan Selection → Stripe Checkout → Stripe Webhook
→ Edge Function: create parish + subscription + admin user
→ /dashboard (admin access)
```

### Authentication Flow

```
/login → Enter email → Supabase sends Magic Link
→ User clicks link → Server-side session created
→ Middleware validates session → /dashboard
```

### Schedule Creation Flow

```
Admin/Coordinator: Create celebration (+ requirements)
→ Create schedule (draft)
→ Assign members to typed roles
→ System validates: double-booking + unavailability conflicts
→ Requirement coverage indicator updates
→ Publish schedule
→ Notifications sent to assigned members (Resend)
→ Members: confirm or decline
→ Declined roles flagged for reassignment
```

### Swap Request Flow

```
Member: Submit swap request (reason)
→ Coordinator notified
→ Coordinator: approve / decline / reassign
→ Schedule updated
```

---

## 10. Business Rules

| Rule | Description |
|------|-------------|
| BR1 | Subscription gate | Dashboard inaccessible when subscription is `inactive` or `past_due` |
| BR2 | Plan limits | Creating members or pastorals beyond plan limits is blocked with upgrade CTA |
| BR3 | Conflict detection | Assigning a member who is double-booked or unavailable returns a blocking error |
| BR4 | Requirement warnings | Publishing a schedule with unmet celebration requirements shows a non-blocking warning |
| BR5 | Deletion guards | Pastorals with active members/schedules cannot be deleted; members with historical assignments cannot be permanently deleted |
| BR6 | Multi-pastoral | A member may belong to multiple pastorals; role filtering in schedules uses the member's pastoral(s) |
| BR7 | Role filtering | When assigning a member to a schedule, only roles matching the member's pastoral(s) are shown (falls back to free text if no requirements defined) |
| BR8 | Coordinator scope | `coordenador` role manages only their pastoral(s); cannot access subscription or role management |
| BR9 | Notification resilience | Email notification failures are logged but do not revert schedule publication |
| BR10 | Inactivity logout | 30-minute inactivity timer with 2-minute warning modal before forced logout |

---

## 11. Epic & Feature Breakdown

### Epic 1 — Platform Foundation & Commercial Onboarding
**Status:** Implemented

Stories: Project Scaffold, Magic Link Auth, Parish Registration + Stripe, Subscription Gate + Logging

**Covers:** FR1, FR2, FR3, FR15, FR17

---

### Epic 2 — Parish Configuration
**Status:** Implemented

Stories: RBAC (6 roles), Pastoral CRUD, Member CRUD, Plan Limits, Member Availability

**Covers:** FR4, FR5, FR6, FR8, FR16

---

### Epic 3 — Parish Agenda
**Status:** Implemented

Stories: Celebration CRUD, Parish Calendar List View

**Covers:** FR9

---

### Epic 4 — Schedule Management
**Status:** Implemented

Stories: Schedule Creation + Member Assignment, Conflict Validation, Schedule Publication

**Covers:** FR10, FR11

---

### Epic 5 — Confirmation & Communication
**Status:** Implemented

Stories: Attendance Confirmation, Schedule Notifications (Resend)

**Covers:** FR12, FR14

---

### Epic 6 — Flow Improvements & Pastoral Features
**Status:** Partially implemented (migrations applied 2026-04-15 / 2026-04-16)

| Story | Description | Status |
|-------|-------------|--------|
| S1 | Session inactivity timeout (30 min) | In progress |
| S2 | Member deactivate + permanent delete | In progress |
| S3 | Pastoral role CRUD | Schema applied |
| S4 | Celebration requirements (pastoral + role + quantity) | Schema applied |
| S5 | Schedule assignment validation by pastoral/role | Backlog |
| S6 | Monthly schedule calendar view | Backlog |
| S7 | Member portal (assignments + availability) | Backlog |
| S8 | Swap request flow | Schema applied |
| S9 | User invite flow for members/coordinators | Backlog |

**Covers:** FR7, FR13, FR18, FR19, FR20

---

## 12. Out of Scope (MVP)

- Native mobile application
- In-app chat or messaging
- AI-powered schedule generation
- Parallel bulk notification sending (deferred — see deferred-work.md)
- Rate limiting on notification send loop (deferred)
- Email confirmation on signup (disabled pending SMTP configuration — must be re-enabled before go-live)

---

## 13. Pre-Go-Live Checklist

| Item | Status |
|------|--------|
| Verify own domain on Resend and update `RESEND_FROM_EMAIL` in Vercel | Pending |
| Update `supabase/config.toml [auth.email.smtp] admin_email` | Pending |
| Re-enable Supabase email confirmation | Pending |
| Validate `FROM_EMAIL` is not using `onboarding@resend.dev` (sandbox) | Pending |
| Parallel notification sending (`Promise.allSettled`) | Deferred |
| Empty assignment list logging (silent return bug) | Deferred |

---

## 14. Success Indicators

| Metric | Target |
|--------|--------|
| Scheduling conflict reduction | ≥ 80% vs. manual baseline |
| Member attendance confirmation rate | ≥ 70% within 48h of schedule publication |
| Subscription growth | Month-over-month MRR growth |
| Notification delivery rate | ≥ 95% successful delivery |
| Schedule publication cycle time | ≤ 15 minutes from creation to publication |

---

## 15. Glossary

| Term | Definition |
|------|------------|
| Parish (Paróquia) | A Catholic parish — the root tenant unit |
| Pastoral | A ministry group within a parish (e.g., Acolytes, Choir, Liturgy) |
| Pastoral Role | A specific function within a pastoral (e.g., Missal, Turíbulo) |
| Celebration | A liturgical event (mass, novena, etc.) scheduled on the parish calendar |
| Schedule (Escala) | An assignment of members to roles for a specific celebration |
| Assignment | A single member–role pairing within a schedule |
| Coordinator | A user with `coordenador` role responsible for managing schedules for their pastoral |
| MCP Layer | The mandatory abstraction layer (`/lib/mcp`) through which all DB queries flow |
| RLS | Row-Level Security — Supabase/PostgreSQL mechanism enforcing data isolation per tenant |
