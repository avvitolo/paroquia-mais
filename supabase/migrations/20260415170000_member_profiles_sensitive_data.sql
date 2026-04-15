-- Migration: Dados sensíveis de membros (CPF e endereço)
-- Cria tabela member_profiles separada com RLS restrita.
-- Acesso permitido apenas para: admin_sistema, admin_paroquial, paroco, secretario.
-- coordenador e membro NÃO têm acesso.

SET search_path TO public;

CREATE TABLE IF NOT EXISTS member_profiles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id  UUID        NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
  parish_id  UUID        NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  cpf        TEXT,
  address    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX member_profiles_member_id_idx ON member_profiles(member_id);
CREATE INDEX member_profiles_parish_id_idx ON member_profiles(parish_id);

ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;

-- Apenas gestores leem dados sensíveis
CREATE POLICY "Gestores leem dados sensíveis de membros"
  ON member_profiles FOR SELECT
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario'
    )
  );

-- Apenas gestores inserem dados sensíveis
CREATE POLICY "Gestores inserem dados sensíveis de membros"
  ON member_profiles FOR INSERT
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario'
    )
  );

-- Apenas gestores atualizam dados sensíveis
CREATE POLICY "Gestores atualizam dados sensíveis de membros"
  ON member_profiles FOR UPDATE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario'
    )
  );

-- Apenas admin_sistema pode excluir perfis sensíveis
CREATE POLICY "Admin sistema exclui dados sensíveis de membros"
  ON member_profiles FOR DELETE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin_sistema'
  );
