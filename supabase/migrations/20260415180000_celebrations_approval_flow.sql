-- Migration: Fluxo de aprovação de celebrações
-- Adiciona status (pending/approved/rejected) e created_by em celebrations.
-- Coordenador pode criar celebrações como 'pending'.
-- Gestores (admin_paroquial, paroco, secretario, admin_sistema) aprovam/rejeitam.
-- Gestores publicam diretamente como 'approved'.

SET search_path TO public;

-- ─── 1. Adicionar colunas em celebrations ────────────────────────────────────

ALTER TABLE celebrations
  ADD COLUMN IF NOT EXISTS status     TEXT  NOT NULL DEFAULT 'approved'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS created_by UUID  REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pastoral_id UUID REFERENCES pastorals(id)  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS celebrations_status_idx      ON celebrations(parish_id, status);
CREATE INDEX IF NOT EXISTS celebrations_created_by_idx  ON celebrations(created_by);

-- ─── 2. Atualizar RLS de celebrations ────────────────────────────────────────

DROP POLICY IF EXISTS "Membros veem celebrações da paróquia"          ON celebrations;
DROP POLICY IF EXISTS "Admin e coordenador criam celebrações"         ON celebrations;
DROP POLICY IF EXISTS "Admin e coordenador atualizam celebrações"     ON celebrations;
DROP POLICY IF EXISTS "Admin e coordenador excluem celebrações"       ON celebrations;

-- Todos da paróquia veem celebrações aprovadas.
-- Gestores veem todas (inclusive pending/rejected).
-- Coordenador vê as próprias pendentes.
CREATE POLICY "Membros veem celebrações aprovadas; gestores veem todas"
  ON celebrations FOR SELECT
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (
      status = 'approved'
      OR (auth.jwt() -> 'app_metadata' ->> 'role') IN (
        'admin_sistema', 'admin_paroquial', 'paroco', 'secretario'
      )
      OR (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'coordenador'
        AND created_by = auth.uid()
      )
    )
  );

-- Gestores inserem diretamente como 'approved'
CREATE POLICY "Gestores criam celebrações aprovadas"
  ON celebrations FOR INSERT
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario'
    )
  );

-- Coordenador só pode inserir como 'pending'
CREATE POLICY "Coordenador cria celebrações pendentes"
  ON celebrations FOR INSERT
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'coordenador'
    AND status = 'pending'
  );

-- Gestores atualizam (incluindo aprovar/rejeitar)
CREATE POLICY "Gestores atualizam celebrações"
  ON celebrations FOR UPDATE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario'
    )
  );

-- Coordenador pode editar apenas suas próprias celebrações pendentes
CREATE POLICY "Coordenador edita suas celebrações pendentes"
  ON celebrations FOR UPDATE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'coordenador'
    AND created_by = auth.uid()
    AND status = 'pending'
  );

-- Apenas gestores excluem
CREATE POLICY "Gestores excluem celebrações"
  ON celebrations FOR DELETE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario'
    )
  );
