---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
inputDocuments:
  - docs/prd/ (sharded)
  - docs/architecture/ (sharded)
---

# ParoquiaMais - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ParoquiaMais (Paróquia+), decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: The system must allow parish registration with plan selection and Stripe payment, granting immediate tenant access after confirmation
FR2: The system must support multiple tenants (parishes) with full data isolation via RLS using parish_id
FR3: The system must allow authentication via Magic Link (Supabase Auth) with server-side session protected by middleware
FR4: The system must allow role-based access control (admin, coordinator, member) with distinct permissions
FR5: The system must allow creation and management of pastorals (ministry groups) linked to the parish
FR6: The system must allow creation and management of members, associating them to pastorals
FR7: The system must allow creation and management of celebrations on the parish agenda
FR8: The system must allow creation of schedules for celebrations, assigning members to specific roles
FR9: The system must validate scheduling conflicts (member double-booked, unavailability)
FR10: The system must allow schedule publication after validation, making it visible to assigned members
FR11: The system must allow members to confirm or decline their presence on schedules
FR12: The system must send notifications to scheduled members
FR13: The system must block access to features when the subscription is inactive or expired
FR14: The system must enforce plan limits (e.g., number of members, pastorals, celebrations)
FR15: The system must log critical operations (mandatory logging in MVP)

### NonFunctional Requirements

NFR1: Frontend built with Next.js 15+ (App Router, React Server Components, Server Actions, TypeScript strict, TailwindCSS, shadcn/ui)
NFR2: Backend exclusively via Supabase (PostgreSQL, Auth, RLS) — no additional API layer
NFR3: All database queries MUST go through the MCP layer (/lib/mcp) — direct Supabase calls are forbidden
NFR4: RLS mandatory on all tables using base policy: `parish_id = auth.jwt()->>'parish_id'`
NFR5: Performance: mandatory pagination on listings, cache with revalidate, indexes by parish_id
NFR6: Code in English, comments in Portuguese, small functions with single responsibility
NFR7: Server-first architecture: Server Components by default, Client Components only when necessary
NFR8: MVP without mandatory automated tests — manual validation + logging

### Additional Requirements

- **Greenfield project**: folder structure defined by architecture (/app, /components, /features, /lib, /services, /repositories)
- **MCP layer**: create /lib/mcp with parish.mcp.ts, schedule.mcp.ts, member.mcp.ts — single access point to Supabase
- **Authentication**: Supabase Auth with Magic Link, server-side session, route protection middleware for /(dashboard)
- **RLS**: base policy `parish_id = auth.jwt()->>'parish_id'` must be present on all multi-tenant tables
- **Stripe Webhooks**: processing via Supabase Edge Functions to update subscription status in DB
- **Critical schedule flow**: UI → Server Action → MCP → DB (never direct Supabase calls)
- **Data model**: 8 main tables (parishes, users, members, pastorals, celebrations, schedules, schedule_assignments, subscriptions) with mandatory parish_id

### UX Design Requirements

N/A — No UX Design document was provided for this project.

### FR Coverage Map

FR1: Epic 1 — Parish registration + Stripe payment → tenant creation
FR2: Epic 1 — Multi-tenant isolation via RLS (parish_id)
FR3: Epic 1 — Magic Link authentication with server-side session
FR4: Epic 2 — Role-based access control (admin, coordinator, member)
FR5: Epic 2 — Pastoral CRUD
FR6: Epic 2 — Member CRUD linked to pastorals
FR7: Epic 3 — Celebration CRUD and calendar view
FR8: Epic 4 — Schedule creation with member assignment
FR9: Epic 2 / Story 2.5 (availability data) + Epic 4 / Story 4.2 (conflict detection)
FR10: Epic 4 — Schedule publication
FR11: Epic 5 — Member attendance confirmation/decline
FR12: Epic 5 — Notifications to scheduled members
FR13: Epic 1 — Access block for inactive subscriptions
FR14: Epic 2 — Plan limits enforcement
FR15: Epic 1 — Mandatory logging of critical operations

## Epic List

### Epic 1: Platform Foundation & Commercial Onboarding
The parish can register, pay, and access the system authenticated as an isolated tenant. Includes greenfield project setup, MCP layer, Stripe commercial flow, Magic Link authentication, multi-tenant RLS isolation, and mandatory logging.
**FRs covered:** FR1, FR2, FR3, FR13, FR15

### Epic 2: Parish Configuration
The admin can structure the parish — defining roles, creating pastorals, registering members, and managing member availability, respecting the contracted plan limits.
**FRs covered:** FR4, FR5, FR6, FR9 (partial — availability data), FR14

### Epic 3: Parish Agenda
Coordinators can create and manage celebrations on the parish liturgical calendar.
**FRs covered:** FR7

### Epic 4: Schedule Management
Coordinators can create schedules for celebrations, assign members to roles, validate conflicts, and publish schedules.
**FRs covered:** FR8, FR9, FR10

### Epic 5: Confirmation & Communication
Members receive notifications about schedules and can confirm or decline attendance.
**FRs covered:** FR11, FR12

## Epic 1: Platform Foundation & Commercial Onboarding

The parish can register, pay, and access the system authenticated as an isolated tenant. Includes greenfield project setup, MCP layer, Stripe commercial flow, Magic Link authentication, multi-tenant RLS isolation, and mandatory logging.

### Story 1.1: Project Scaffold & Infrastructure

As a developer,
I want the project scaffolded with Next.js 15, Supabase, and the MCP layer,
So that all subsequent stories have a consistent, production-ready foundation.

**Acceptance Criteria:**

**Given** a new repository is initialized
**When** the project setup is complete
**Then** the folder structure matches `/app/(public)`, `/app/(dashboard)`, `/components/ui`, `/features`, `/lib/supabase`, `/lib/mcp`, `/services`, `/repositories`
**And** Next.js 15 runs locally with TypeScript strict mode, TailwindCSS, and shadcn/ui configured
**And** Supabase client is initialized in `/lib/supabase`
**And** MCP skeleton files exist: `parish.mcp.ts`, `schedule.mcp.ts`, `member.mcp.ts` in `/lib/mcp`
**And** the `parishes` and `users` tables exist in Supabase with RLS enabled and base policy `parish_id = auth.jwt()->>'parish_id'`
**And** environment variables for Supabase URL, anon key, and service role key are documented in `.env.example`

### Story 1.2: Authentication with Magic Link

As a parish admin,
I want to authenticate via Magic Link,
So that I can securely access my parish dashboard without managing a password.

**Acceptance Criteria:**

**Given** I am on the login page `/login`
**When** I enter my email and request a Magic Link
**Then** Supabase Auth sends the link to my email
**And** clicking the link redirects me to `/dashboard` with an active server-side session

**Given** I try to access any route under `/(dashboard)`
**When** I am not authenticated
**Then** the middleware redirects me to `/login`

**Given** I am authenticated
**When** I click logout
**Then** the session is terminated and I am redirected to `/login`

### Story 1.3: Parish Registration & Stripe Onboarding

As a parish admin,
I want to register my parish and complete payment via Stripe,
So that my parish is provisioned as an isolated tenant and I can access the platform.

**Acceptance Criteria:**

**Given** I am on the registration page `/register`
**When** I fill in parish name, my email, and select a plan
**Then** I am redirected to Stripe Checkout with the selected plan

**Given** the Stripe payment is completed successfully
**When** the Stripe webhook fires
**Then** an Edge Function processes the event and creates a record in the `parishes` table with a unique `parish_id`
**And** a record in the `subscriptions` table is created with status `active`
**And** my user is linked to the parish with role `admin`
**And** I receive access to the dashboard `/dashboard`

**Given** the Stripe payment fails or is cancelled
**When** the webhook returns an error
**Then** no tenant is created and the user receives a failure message

### Story 1.4: Subscription Access Gate & Logging

As a platform operator,
I want inactive subscriptions to block dashboard access and all critical operations to be logged,
So that access control is enforced and the system is auditable.

**Acceptance Criteria:**

**Given** a parish subscription is `inactive` or `past_due`
**When** the admin tries to access `/(dashboard)`
**Then** the middleware blocks access and displays a suspended subscription page with a link to renew

**Given** any critical operation is performed (schedule creation, publication, payment)
**When** a Server Action is executed successfully or fails
**Then** a structured log is recorded with timestamp, user_id, parish_id, operation, and status

## Epic 2: Parish Configuration

The admin can structure the parish — defining roles, creating pastorals, and registering members, respecting the contracted plan limits.

### Story 2.1: Role-Based Access Control

As a parish admin,
I want to assign roles to users (admin, coordinator, member),
So that each person only accesses the features appropriate to their responsibility.

**Acceptance Criteria:**

**Given** a user is authenticated
**When** they try to access an admin-only route or Server Action
**Then** the system verifies the user's role via JWT/session
**And** users without permission receive a 403 error or are redirected

**Given** I am logged in as `coordinator`
**When** I access the dashboard
**Then** I only see coordination features (schedules, celebrations, members of my pastoral)
**And** I do not have access to subscription settings or role management

**Given** I am logged in as `member`
**When** I access the dashboard
**Then** I only see my schedules and can confirm or decline attendance

### Story 2.2: Pastoral Management

As a parish admin,
I want to create and manage pastorals,
So that the parish's ministry groups are organized and available for scheduling.

**Acceptance Criteria:**

**Given** I am logged in as `admin`
**When** I create a new pastoral with name and description
**Then** the record is saved in the `pastorals` table linked to the `parish_id`
**And** the pastoral appears in the dashboard listing

**Given** I want to edit a pastoral
**When** I update its name or description
**Then** the changes are saved and immediately reflected in the listing

**Given** I want to delete a pastoral
**When** I confirm the deletion
**Then** the pastoral is removed only if it has no linked active members or schedules
**And** otherwise, I receive an error message explaining the constraint

### Story 2.3: Member Management

As a parish admin or coordinator,
I want to register and manage members,
So that they can be assigned to pastorals and scheduled for celebrations.

**Acceptance Criteria:**

**Given** I am logged in as `admin` or `coordinator`
**When** I create a new member with name, email, and pastoral assignment
**Then** the record is saved in the `members` table linked to the `parish_id`
**And** the member appears in the listing and can be scheduled

**Given** I want to edit a member's information or change their pastoral
**When** I update the member record
**Then** the changes are saved and reflected in future schedules

**Given** I want to deactivate a member
**When** I mark them as inactive
**Then** the member no longer appears in future scheduling options
**And** their history in past schedules is preserved

### Story 2.4: Plan Limits Enforcement

As a platform operator,
I want the system to enforce the plan's limits on members and pastorals,
So that parishes cannot exceed what their subscription allows.

**Acceptance Criteria:**

**Given** a parish is on a plan with a member limit
**When** an admin tries to create a member that would exceed the limit
**Then** the Server Action returns an error with a message informing the limit has been reached
**And** a CTA for plan upgrade is displayed

**Given** a parish is on a plan with a pastoral limit
**When** an admin tries to create a pastoral that would exceed the limit
**Then** the same block is applied with a clear limit message

**Given** a parish upgrades their plan via Stripe
**When** the webhook updates the record in `subscriptions`
**Then** the new limits are applied immediately without requiring re-login

### Story 2.5: Member Availability Management

As a member or admin,
I want to register unavailability windows for specific dates or periods,
So that the schedule coordinator can avoid assigning unavailable members and prevent conflicts.

**Acceptance Criteria:**

**Given** I am logged in as `member`
**When** I navigate to my profile or availability settings
**Then** I can add an unavailability window with a start date, end date, and optional reason

**Given** I add an unavailability window
**When** I save it
**Then** the record is stored linked to my `member_id` and `parish_id`
**And** it is visible to admins and coordinators when assigning schedules

**Given** I am logged in as `admin` or `coordinator`
**When** I view a member's profile
**Then** I can see their registered unavailability windows

**Given** I want to remove an unavailability window
**When** I delete it
**Then** the record is removed and the member becomes available again for that period

## Epic 3: Parish Agenda

Coordinators can create and manage celebrations on the parish liturgical calendar.

### Story 3.1: Celebration Management

As a coordinator,
I want to create, edit, and delete celebrations on the parish agenda,
So that the liturgical calendar is organized and ready for scheduling.

**Acceptance Criteria:**

**Given** I am logged in as `admin` or `coordinator`
**When** I create a celebration with title, date, time, and type (e.g., mass, novena)
**Then** the record is saved in the `celebrations` table linked to the `parish_id`
**And** the celebration appears on the parish agenda

**Given** I want to edit a celebration
**When** I update its details
**Then** the changes are saved and reflected on the agenda

**Given** I want to delete a celebration
**When** I confirm the deletion
**Then** the celebration is removed only if it has no linked schedules
**And** otherwise, I receive a warning listing the dependent schedules

### Story 3.2: Parish Calendar View

As a parish admin or coordinator,
I want to view all upcoming celebrations in a list view,
So that I can plan and manage schedules effectively.

**Acceptance Criteria:**

**Given** I am on the celebrations page
**When** the page loads
**Then** I see all upcoming celebrations for my parish in chronological order
**And** each celebration displays title, date, time, and type

**Given** I want to filter celebrations
**When** I apply a date range or type filter
**Then** only matching celebrations are displayed

**Given** there are many celebrations
**When** the list loads
**Then** pagination is applied as per NFR5

## Epic 4: Schedule Management

Coordinators can create schedules for celebrations, assign members to roles, validate conflicts, and publish schedules.

### Story 4.1: Schedule Creation & Member Assignment

As a coordinator,
I want to create a schedule for a celebration and assign members to functions,
So that each role in the celebration is covered by a responsible member.

**Acceptance Criteria:**

**Given** I am logged in as `admin` or `coordinator`
**When** I create a schedule for an existing celebration
**Then** the record is saved in the `schedules` table linked to `parish_id` and `celebration_id`
**And** I can add assignments in `schedule_assignments` with `member_id` and role (e.g., lector, cantor)

**Given** I want to assign a member to a function
**When** I select the member and their role in the schedule
**Then** the assignment is saved and the member appears on the schedule

**Given** I want to remove a member from the schedule
**When** I delete their assignment
**Then** the assignment is removed and the role becomes available again

### Story 4.2: Conflict Validation

As a coordinator,
I want the system to detect scheduling conflicts before saving,
So that no member is double-booked or scheduled when unavailable.

**Acceptance Criteria:**

**Given** I try to assign a member to a schedule
**When** that member is already assigned to another schedule at the same date and time
**Then** the Server Action returns a conflict error with details of the overlap
**And** the assignment is not saved

**Given** a member has marked unavailability for a specific date
**When** I try to assign them to a schedule on that date
**Then** the system detects the conflict and returns a warning before saving
**And** I can choose to substitute the member or cancel

### Story 4.3: Schedule Publication

As a coordinator,
I want to publish a validated schedule,
So that members can see their assignments and confirm attendance.

**Acceptance Criteria:**

**Given** a schedule has all required functions filled and no conflicts
**When** I click "Publish Schedule"
**Then** the `schedule` status changes to `published`
**And** the schedule becomes visible to assigned members on their dashboard

**Given** a schedule is in `draft` status
**When** it is not yet published
**Then** only admins and coordinators can view it

**Given** I try to publish a schedule with conflicts or missing required roles
**When** the publish action is triggered
**Then** the system blocks publication and lists the issues to be resolved

## Epic 5: Confirmation & Communication

Members receive notifications about schedules and can confirm or decline attendance.

### Story 5.1: Attendance Confirmation

As a member,
I want to confirm or decline my presence on a published schedule,
So that the coordinator knows whether I will be available for my assigned role.

**Acceptance Criteria:**

**Given** I am logged in as `member`
**When** I view my upcoming schedules on the dashboard
**Then** I see all published schedules where I have been assigned, including date, role, and celebration name

**Given** I see a schedule assignment awaiting confirmation
**When** I click "Confirm" or "Decline"
**Then** my assignment status in `schedule_assignments` is updated to `confirmed` or `declined`
**And** the coordinator can see my response in the schedule view

**Given** I declined a schedule
**When** the coordinator views the schedule
**Then** my role appears as uncovered and can be reassigned

### Story 5.2: Schedule Notifications

As a member,
I want to receive a notification when I am assigned to a published schedule,
So that I am aware of my upcoming responsibilities in time to confirm.

**Acceptance Criteria:**

**Given** a schedule is published by a coordinator
**When** the publish Server Action completes successfully
**Then** a notification is sent to each member assigned to that schedule
**And** the notification includes: celebration name, date, time, and assigned role

**Given** a notification is sent
**When** the member receives it
**Then** it includes a direct link to the schedule confirmation page

**Given** the notification system fails to deliver
**When** an error occurs during sending
**Then** the error is logged (as per FR15) and the schedule publication is not reverted
