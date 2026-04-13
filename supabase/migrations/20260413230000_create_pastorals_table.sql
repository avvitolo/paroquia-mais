-- Tabela de pastorais — grupos ministeriais vinculados à paróquia
create table if not exists pastorals (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid not null references parishes(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- Índice para buscas por paróquia
create index if not exists pastorals_parish_id_idx on pastorals(parish_id);

-- RLS
alter table pastorals enable row level security;

-- Membros da paróquia podem ver as pastorais
create policy "Membros veem pastorais da própria paróquia"
  on pastorals for select
  using (parish_id = (auth.jwt() ->> 'parish_id')::uuid);

-- Apenas admin pode criar pastorais
create policy "Admin cria pastorais"
  on pastorals for insert
  with check (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') = 'admin'
  );

-- Apenas admin pode atualizar pastorais
create policy "Admin atualiza pastorais"
  on pastorals for update
  using (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') = 'admin'
  );

-- Apenas admin pode excluir pastorais
create policy "Admin exclui pastorais"
  on pastorals for delete
  using (
    parish_id = (auth.jwt() ->> 'parish_id')::uuid
    and (auth.jwt() ->> 'role') = 'admin'
  );
