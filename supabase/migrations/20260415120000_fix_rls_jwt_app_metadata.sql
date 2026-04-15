-- Corrige todas as políticas RLS que usam auth.jwt() ->> 'parish_id' / 'role'
-- incorretamente. No Supabase, esses valores ficam dentro de app_metadata, então
-- o caminho correto é: auth.jwt() -> 'app_metadata' ->> 'campo'
--
-- Sintoma: dados eram inseridos (admin client ignora RLS) mas leituras com o
-- client normal retornavam vazio porque a condição sempre avaliava NULL = UUID.

SET search_path TO public;

-- ─── parishes ───────────────────────────────────────────────────────────────
drop policy if exists "Users can view their own parish" on parishes;

create policy "Users can view their own parish"
  on parishes for select
  using (id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid));

-- ─── users ───────────────────────────────────────────────────────────────────
drop policy if exists "Users can view members of their parish" on users;
drop policy if exists "Users can view their own record and parish members" on users;

create policy "Users can view their own record and parish members"
  on users for select
  using (
    id = auth.uid()
    or parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
  );

-- ─── subscriptions ───────────────────────────────────────────────────────────
drop policy if exists "Users can view their parish subscription" on subscriptions;

create policy "Users can view their parish subscription"
  on subscriptions for select
  using (parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid));

-- ─── pastorals ───────────────────────────────────────────────────────────────
drop policy if exists "Membros veem pastorais da própria paróquia" on pastorals;
drop policy if exists "Admin cria pastorais" on pastorals;
drop policy if exists "Admin atualiza pastorais" on pastorals;
drop policy if exists "Admin exclui pastorais" on pastorals;

create policy "Membros veem pastorais da própria paróquia"
  on pastorals for select
  using (parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid));

create policy "Admin cria pastorais"
  on pastorals for insert
  with check (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admin atualiza pastorais"
  on pastorals for update
  using (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admin exclui pastorais"
  on pastorals for delete
  using (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ─── members ─────────────────────────────────────────────────────────────────
drop policy if exists "Membros da paróquia veem membros" on members;
drop policy if exists "Admin e coordenador criam membros" on members;
drop policy if exists "Admin e coordenador atualizam membros" on members;

create policy "Membros da paróquia veem membros"
  on members for select
  using (parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid));

create policy "Admin e coordenador criam membros"
  on members for insert
  with check (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
  );

create policy "Admin e coordenador atualizam membros"
  on members for update
  using (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
  );

-- ─── member_availability ────────────────────────────────────────────────────
drop policy if exists "Admin e coordenador veem indisponibilidades" on member_availability;
drop policy if exists "Admin e coordenador gerenciam indisponibilidades" on member_availability;
drop policy if exists "Admin e coordenador removem indisponibilidades" on member_availability;

create policy "Admin e coordenador veem indisponibilidades"
  on member_availability for select
  using (parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid));

create policy "Admin e coordenador gerenciam indisponibilidades"
  on member_availability for insert
  with check (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
  );

create policy "Admin e coordenador removem indisponibilidades"
  on member_availability for delete
  using (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
  );

-- ─── celebrations ────────────────────────────────────────────────────────────
drop policy if exists "Membros veem celebrações da paróquia" on celebrations;
drop policy if exists "Admin e coordenador criam celebrações" on celebrations;
drop policy if exists "Admin e coordenador atualizam celebrações" on celebrations;
drop policy if exists "Admin e coordenador excluem celebrações" on celebrations;

create policy "Membros veem celebrações da paróquia"
  on celebrations for select
  using (parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid));

create policy "Admin e coordenador criam celebrações"
  on celebrations for insert
  with check (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
  );

create policy "Admin e coordenador atualizam celebrações"
  on celebrations for update
  using (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
  );

create policy "Admin e coordenador excluem celebrações"
  on celebrations for delete
  using (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
  );

-- ─── schedules ───────────────────────────────────────────────────────────────
drop policy if exists "Membros veem escalas publicadas; admin/coord veem todas" on schedules;
drop policy if exists "Admin e coordenador criam escalas" on schedules;

create policy "Membros veem escalas publicadas; admin/coord veem todas"
  on schedules for select
  using (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (
      status = 'published'
      or (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
    )
  );

create policy "Admin e coordenador criam escalas"
  on schedules for insert
  with check (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
  );

drop policy if exists "Admin e coordenador atualizam escalas" on schedules;
drop policy if exists "Admin e coordenador excluem escalas em rascunho" on schedules;

create policy "Admin e coordenador atualizam escalas"
  on schedules for update
  using (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
  );

create policy "Admin e coordenador excluem escalas em rascunho"
  on schedules for delete
  using (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
    and status = 'draft'
  );

-- ─── schedule_assignments ────────────────────────────────────────────────────
drop policy if exists "Membros veem suas próprias atribuições; admin/coord veem todas" on schedule_assignments;
drop policy if exists "Admin e coordenador criam atribuições" on schedule_assignments;
drop policy if exists "Admin e coordenador removem atribuições" on schedule_assignments;
drop policy if exists "Membro confirma ou recusa sua própria atribuição" on schedule_assignments;

create policy "Membros veem suas próprias atribuições; admin/coord veem todas"
  on schedule_assignments for select
  using (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (
      (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
      or member_id in (
        select id from members where user_id = auth.uid()
      )
    )
  );

create policy "Admin e coordenador criam atribuições"
  on schedule_assignments for insert
  with check (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
  );

create policy "Admin e coordenador removem atribuições"
  on schedule_assignments for delete
  using (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
  );

create policy "Membro confirma ou recusa sua própria atribuição"
  on schedule_assignments for update
  using (
    parish_id = ((auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid)
    and (
      (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'coordinator')
      or member_id in (
        select id from members where user_id = auth.uid()
      )
    )
  );
