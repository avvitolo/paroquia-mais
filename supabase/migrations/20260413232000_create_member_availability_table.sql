-- Tabela de indisponibilidade de membros (Story 2.5)
create table if not exists member_availability (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references members(id) on delete cascade,
  parish_id uuid not null references parishes(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint end_after_start check (end_date >= start_date)
);

create index if not exists availability_member_id_idx on member_availability(member_id);
create index if not exists availability_parish_id_idx on member_availability(parish_id);
create index if not exists availability_dates_idx on member_availability(start_date, end_date);

alter table member_availability enable row level security;

create policy "Admin e coordenador veem indisponibilidades"
  on member_availability for select
  using (parish_id = (auth.jwt() ->> 'parish_id')::uuid);

create policy "Admin e coordenador gerenciam indisponibilidades"
  on member_availability for insert
  with check (parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'coordinator'));

create policy "Admin e coordenador removem indisponibilidades"
  on member_availability for delete
  using (parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'coordinator'));
