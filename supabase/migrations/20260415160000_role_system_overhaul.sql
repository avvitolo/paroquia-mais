-- Migration: Role system overhaul
-- Expande o enum de roles para o modelo completo do PRD e migra dados existentes.
-- admin       → admin_sistema
-- coordinator → coordenador
-- member      → membro
-- [novos]     → admin_paroquial, paroco, secretario (mesmo nível hierárquico)

SET search_path TO public;

-- ─── 1. Remover constraint antigo ────────────────────────────────────────────

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

-- ─── 2. Migrar dados existentes em public.users ANTES de adicionar constraint ─

UPDATE users SET role = 'admin_sistema' WHERE role = 'admin';
UPDATE users SET role = 'coordenador'   WHERE role = 'coordinator';
UPDATE users SET role = 'membro'        WHERE role = 'member';

-- ─── 3. Novo constraint com roles completos ───────────────────────────────────

ALTER TABLE users
  ADD CONSTRAINT users_role_check
    CHECK (role IN (
      'admin_sistema',
      'admin_paroquial',
      'paroco',
      'secretario',
      'coordenador',
      'membro'
    ));

-- ─── 3. Sincronizar app_metadata em auth.users para que o JWT seja atualizado ─
-- Necessário para que as RLS policies que leem app_metadata continuem funcionando
-- na próxima sessão do usuário.

UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', 'admin_sistema')
  WHERE raw_app_meta_data ->> 'role' = 'admin';

UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', 'coordenador')
  WHERE raw_app_meta_data ->> 'role' = 'coordinator';

UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', 'membro')
  WHERE raw_app_meta_data ->> 'role' = 'member';

-- ─── 4. Atualizar trigger handle_new_user com novo default ───────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new.raw_app_meta_data ->> 'parish_id' IS NOT NULL THEN
    INSERT INTO public.users (id, parish_id, email, full_name, role)
    VALUES (
      new.id,
      (new.raw_app_meta_data ->> 'parish_id')::uuid,
      new.email,
      COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
      COALESCE(new.raw_app_meta_data ->> 'role', 'membro')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$;

-- ─── 5. Atualizar todas as RLS policies para usar os novos nomes de role ──────
-- Padrão:
--   'admin'       → IN ('admin_sistema','admin_paroquial','paroco','secretario')
--   'coordinator' → 'coordenador'
--   IN ('admin','coordinator') → IN ('admin_sistema','admin_paroquial','paroco','secretario','coordenador')

-- ── parishes ──────────────────────────────────────────────────────────────────
-- SELECT já ok (verifica apenas parish_id)

-- ── users ─────────────────────────────────────────────────────────────────────
-- Políticas de SELECT e UPDATE self-service já ok.
-- Adiciona política para gestores poderem atualizar role de outros usuários.
DROP POLICY IF EXISTS "Gestores atualizam role de usuários" ON users;

CREATE POLICY "Gestores atualizam role de usuários"
  ON users FOR UPDATE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario'
    )
  );

-- ── pastorals ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin cria pastorais"    ON pastorals;
DROP POLICY IF EXISTS "Admin atualiza pastorais" ON pastorals;
DROP POLICY IF EXISTS "Admin exclui pastorais"   ON pastorals;

CREATE POLICY "Gestores criam pastorais"
  ON pastorals FOR INSERT
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario'
    )
  );

CREATE POLICY "Gestores atualizam pastorais"
  ON pastorals FOR UPDATE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario'
    )
  );

CREATE POLICY "Gestores excluem pastorais"
  ON pastorals FOR DELETE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario'
    )
  );

-- ── members ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin e coordenador criam membros"     ON members;
DROP POLICY IF EXISTS "Admin e coordenador atualizam membros" ON members;

CREATE POLICY "Gestores e coordenador criam membros"
  ON members FOR INSERT
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  );

CREATE POLICY "Gestores e coordenador atualizam membros"
  ON members FOR UPDATE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  );

-- ── member_availability ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin e coordenador gerenciam indisponibilidades" ON member_availability;
DROP POLICY IF EXISTS "Admin e coordenador removem indisponibilidades"   ON member_availability;

CREATE POLICY "Gestores e coordenador gerenciam indisponibilidades"
  ON member_availability FOR INSERT
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  );

CREATE POLICY "Gestores e coordenador removem indisponibilidades"
  ON member_availability FOR DELETE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  );

-- ── schedules ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Membros veem escalas publicadas; admin/coord veem todas" ON schedules;
DROP POLICY IF EXISTS "Admin e coordenador criam escalas"                       ON schedules;
DROP POLICY IF EXISTS "Admin e coordenador atualizam escalas"                   ON schedules;
DROP POLICY IF EXISTS "Admin e coordenador excluem escalas em rascunho"         ON schedules;

CREATE POLICY "Membros veem escalas publicadas; gestores veem todas"
  ON schedules FOR SELECT
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (
      status = 'published'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
        'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
      )
    )
  );

CREATE POLICY "Gestores e coordenador criam escalas"
  ON schedules FOR INSERT
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  );

CREATE POLICY "Gestores e coordenador atualizam escalas"
  ON schedules FOR UPDATE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  );

CREATE POLICY "Gestores e coordenador excluem escalas em rascunho"
  ON schedules FOR DELETE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
    AND status = 'draft'
  );

-- ── schedule_assignments ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Membros veem suas próprias atribuições; admin/coord veem todas" ON schedule_assignments;
DROP POLICY IF EXISTS "Admin e coordenador criam atribuições"                          ON schedule_assignments;
DROP POLICY IF EXISTS "Admin e coordenador removem atribuições"                        ON schedule_assignments;
DROP POLICY IF EXISTS "Membro confirma ou recusa sua própria atribuição"               ON schedule_assignments;

CREATE POLICY "Membros veem suas atribuições; gestores veem todas"
  ON schedule_assignments FOR SELECT
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') IN (
        'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
      )
      OR member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Gestores e coordenador criam atribuições"
  ON schedule_assignments FOR INSERT
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  );

CREATE POLICY "Gestores e coordenador removem atribuições"
  ON schedule_assignments FOR DELETE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  );

CREATE POLICY "Membro confirma ou recusa sua própria atribuição"
  ON schedule_assignments FOR UPDATE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') IN (
        'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
      )
      OR member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

-- ── pastoral_roles ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin or coordinator can manage pastoral_roles" ON pastoral_roles;

CREATE POLICY "Gestores e coordenador gerenciam pastoral_roles"
  ON pastoral_roles FOR ALL
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  )
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  );

-- ── celebration_requirements ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin or coordinator can manage celebration_requirements" ON celebration_requirements;

CREATE POLICY "Gestores e coordenador gerenciam celebration_requirements"
  ON celebration_requirements FOR ALL
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  )
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  );
