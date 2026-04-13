-- Tabela de membros da paróquia (Story 2.3)
-- Membros são pessoas que podem ser escaladas — diferentes de users (login)
create table if not exists members (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid not null references parishes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, -- login vinculado, se houver
  full_name text not null,
  email text,
  phone text,
  pastoral_id uuid references pastorals(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists members_parish_id_idx on members(parish_id);
create index if not exists members_pastoral_id_idx on members(pastoral_id);
create index if not exists members_user_id_idx on members(user_id);

alter table members enable row level security;

create policy "Membros da paróquia veem membros"
  on members for select
  using (parish_id = (auth.jwt() ->> 'parish_id')::uuid);

create policy "Admin e coordenador criam membros"
  on members for insert
  with check (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'coordinator')
  );

create policy "Admin e coordenador atualizam membros"
  on members for update
  using (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') in ('admin', 'coordinator')
  );

-- Não permite exclusão física — membros são desativados (is_active = false)
