-- Tabelas de escalas e atribuições (Stories 4.1, 4.2, 4.3, 5.1)

-- Escala vinculada a uma celebração
create table if not exists schedules (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid not null references parishes(id) on delete cascade,
  celebration_id uuid not null references celebrations(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'published')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists schedules_parish_id_idx on schedules(parish_id);
create index if not exists schedules_celebration_id_idx on schedules(celebration_id);

alter table schedules enable row level security;

create policy "Membros veem escalas publicadas; admin/coord veem todas"
  on schedules for select
  using (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (
      status = 'published'
      or (auth.jwt() ->> 'role') in ('admin', 'coordinator')
    )
  );

create policy "Admin e coordenador criam escalas"
  on schedules for insert
  with check (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'coordinator')
  );

create policy "Admin e coordenador atualizam escalas"
  on schedules for update
  using (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'coordinator')
  );

create policy "Admin e coordenador excluem escalas em rascunho"
  on schedules for delete
  using (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'coordinator')
    and status = 'draft'
  );

-- Atribuições de membros a funções dentro de uma escala
create table if not exists schedule_assignments (
  id uuid primary key default uuid_generate_v4(),
  schedule_id uuid not null references schedules(id) on delete cascade,
  parish_id uuid not null references parishes(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  role text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  unique (schedule_id, member_id) -- um membro só pode ter uma função por escala
);

create index if not exists assignments_schedule_id_idx on schedule_assignments(schedule_id);
create index if not exists assignments_member_id_idx on schedule_assignments(member_id);
create index if not exists assignments_parish_id_idx on schedule_assignments(parish_id);

alter table schedule_assignments enable row level security;

create policy "Membros veem suas próprias atribuições; admin/coord veem todas"
  on schedule_assignments for select
  using (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (
      (auth.jwt() ->> 'role') in ('admin', 'coordinator')
      or member_id in (
        select id from members where user_id = auth.uid()
      )
    )
  );

create policy "Admin e coordenador criam atribuições"
  on schedule_assignments for insert
  with check (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'coordinator')
  );

create policy "Admin e coordenador removem atribuições"
  on schedule_assignments for delete
  using (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'coordinator')
  );

-- Membros confirmam ou recusam sua própria atribuição (Story 5.1)
create policy "Membro confirma ou recusa sua própria atribuição"
  on schedule_assignments for update
  using (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (
      (auth.jwt() ->> 'role') in ('admin', 'coordinator')
      or member_id in (
        select id from members where user_id = auth.uid()
      )
    )
  );
