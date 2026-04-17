🚀 PAROQUIA+ — PRD EXECUTÁVEL (CLAUDE READY)
🧠 SYSTEM CONTEXT

You are building a SaaS called ParoquiaMais (Paróquia+).

This is a multi-tenant system for managing liturgical schedules in Catholic parishes.

🔒 GLOBAL RULES (NON-NEGOTIABLE)
1. EVERY table MUST have parish_id
2. EVERY query MUST filter by parish_id
3. NO direct database access outside MCP layer
4. ALL business logic MUST run before DB writes
5. USE TypeScript strict mode
6. USE Server Actions (Next.js)
🧱 CORE DOMAINS
Parish (Tenant)
root entity
controls subscription and access
User
authenticated via magic link
has role
Member
may exist without login
belongs to multiple pastorals
Pastoral
ministry group
PastoralRole
function inside pastoral
Celebration
event (mass, etc)
Schedule
assignments for a celebration
Assignment
member + role + schedule
🧭 ROLE SYSTEM
type Role =
  | "admin_sistema"
  | "admin_paroquial"
  | "paroco"
  | "secretario"
  | "coordenador"
  | "membro"
🔁 STATE MACHINES
Schedule
type ScheduleStatus =
  | "DRAFT"
  | "PUBLISHED"

Rules:

DRAFT:
full edit allowed
PUBLISHED:
no structural edits
allows confirmation
Assignment
type AssignmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DECLINED"
⚙️ CORE FLOWS
1. CREATE SCHEDULE
INPUT:
- celebration_id

PROCESS:
1. fetch celebration_requirements
2. create schedule with status = "DRAFT"
3. initialize coverage = 0

OUTPUT:
- schedule_id
2. ASSIGN MEMBER
INPUT:
- schedule_id
- member_id
- pastoral_role_id

VALIDATIONS (BLOCKING):

1. member belongs to pastoral of role
2. member is NOT unavailable
3. member is NOT assigned to another schedule at same datetime

IF FAIL:
→ throw error

IF SUCCESS:
1. create assignment (status = PENDING)
2. recalculate coverage

OUTPUT:
- assignment_id
3. PUBLISH SCHEDULE
INPUT:
- schedule_id

VALIDATIONS:

1. NO conflicts allowed
2. coverage may be incomplete (warning only)

PROCESS:

1. update status → PUBLISHED
2. trigger notifications (async)

OUTPUT:
- status = PUBLISHED
4. CONFIRM ASSIGNMENT
INPUT:
- assignment_id
- status ("CONFIRMED" | "DECLINED")

PROCESS:

1. update assignment.status

IF DECLINED:
→ mark role as unfilled

OUTPUT:
- updated_assignment
5. SWAP REQUEST
INPUT:
- assignment_id
- reason

PROCESS:
1. create swap_request

COORDINATOR ACTION:
- approve → reassign
- reject → close request
🚨 VALIDATION RULES
RULE 1 — DOUBLE BOOKING
A member CANNOT be assigned to:
two schedules at the same datetime
RULE 2 — AVAILABILITY
member_availability blocks assignment
RULE 3 — ROLE MATCH
member MUST belong to the pastoral of the role
RULE 4 — MULTI-TENANT
ALL operations MUST respect parish_id
RULE 5 — PUBLISH LOCK
PUBLISHED schedules cannot be structurally edited
📊 COVERAGE CALCULATION
coverage = assigned_roles / required_roles
🧩 MCP CONTRACTS
schedule.mcp.ts
createSchedule(input: {
  celebration_id: string
}): {
  schedule_id: string
  status: "DRAFT"
}
assignMember(input: {
  schedule_id: string
  member_id: string
  pastoral_role_id: string
}): {
  assignment_id: string
}
publishSchedule(input: {
  schedule_id: string
}): {
  status: "PUBLISHED"
}
confirmAssignment(input: {
  assignment_id: string
  status: "CONFIRMED" | "DECLINED"
}): {
  assignment: Assignment
}
🧱 DATA RULES
REQUIRED FIELDS
parish_id: string (mandatory on ALL tables)
created_at: timestamp
updated_at: timestamp
OPTIONAL BUT RECOMMENDED
deleted_at: timestamp (soft delete)
operation_id: string (idempotency)
🔐 SECURITY
RLS POLICY
parish_id = auth.jwt()->>'parish_id'
ROLE CHECK
auth.jwt()->>'role'
📩 NOTIFICATIONS

Triggered on:

schedule.status = PUBLISHED

Send email with:

celebration name
date/time
role
confirmation link

Failures:

MUST be logged
MUST NOT block flow
💳 SUBSCRIPTION RULES
IF subscription.status != "active"
→ BLOCK dashboard access
📈 PLAN LIMITS
LIMIT:
- members per parish
- pastorals per parish

IF exceeded:
→ throw error
🧠 SESSION RULE
AUTO LOGOUT after 30 minutes inactivity
WARNING modal at 28 minutes
🏗️ ARCHITECTURE RULES
UI → Server Action → MCP → Database
FORBIDDEN:
- direct DB access in components
- business logic inside UI
📁 EXPECTED STRUCTURE
/features/schedule
  /actions
  /services
  /mcp
  /types
🧪 TESTING STRATEGY
NO automated tests for MVP

USE:
- logs
- manual validation
🚫 OUT OF SCOPE
mobile app
chat system
AI scheduling
bulk notification optimization
✅ IMPLEMENTATION DIRECTIVE
FOLLOW STRICTLY:

- enforce all validation rules
- enforce state machines
- use MCP layer only
- never bypass business logic
- never ignore parish_id