-- Tabela de celebrações da agenda paroquial (Stories 3.1 e 3.2)
create table if not exists celebrations (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid not null references parishes(id) on delete cascade,
  title text not null,
  date date not null,
  time time not null,
  type text not null default 'missa',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists celebrations_parish_id_idx on celebrations(parish_id);
create index if not exists celebrations_date_idx on celebrations(parish_id, date);

alter table celebrations enable row level security;

create policy "Membros veem celebrações da paróquia"
  on celebrations for select
  using (parish_id = (auth.jwt() ->> 'parish_id')::uuid);

create policy "Admin e coordenador criam celebrações"
  on celebrations for insert
  with check (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'coordinator')
  );

create policy "Admin e coordenador atualizam celebrações"
  on celebrations for update
  using (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'coordinator')
  );

create policy "Admin e coordenador excluem celebrações"
  on celebrations for delete
  using (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'coordinator')
  );
