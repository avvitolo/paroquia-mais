-- Migration: Tabela de solicitações de troca de escala (swap_requests)
-- Um membro solicita troca; outro membro aceita ou rejeita.
-- Gestores e coordenadores podem visualizar e gerenciar todas as trocas.

SET search_path TO public;

CREATE TABLE IF NOT EXISTS swap_requests (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id      UUID        NOT NULL REFERENCES parishes(id)    ON DELETE CASCADE,
  schedule_id    UUID        NOT NULL REFERENCES schedules(id)   ON DELETE CASCADE,
  from_member_id UUID        NOT NULL REFERENCES members(id)     ON DELETE CASCADE,
  to_member_id   UUID                 REFERENCES members(id)     ON DELETE SET NULL,
  status         TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX swap_requests_parish_id_idx   ON swap_requests(parish_id);
CREATE INDEX swap_requests_schedule_id_idx ON swap_requests(schedule_id);
CREATE INDEX swap_requests_from_member_idx ON swap_requests(from_member_id);
CREATE INDEX swap_requests_to_member_idx   ON swap_requests(to_member_id);

ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;

-- Membros veem as trocas em que estão envolvidos; gestores e coordenadores veem todas
CREATE POLICY "Membros veem trocas próprias; gestores veem todas"
  ON swap_requests FOR SELECT
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') IN (
        'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
      )
      OR from_member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      OR to_member_id   IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

-- Qualquer membro pode solicitar uma troca (de si mesmo, status = 'pending')
CREATE POLICY "Membro solicita troca de escala"
  ON swap_requests FOR INSERT
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND from_member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    AND status = 'pending'
  );

-- Membro destinatário aceita/rejeita; gestores e coordenadores podem gerenciar qualquer troca
CREATE POLICY "Membro destinatário e gestores atualizam troca"
  ON swap_requests FOR UPDATE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') IN (
        'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
      )
      OR to_member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

-- Apenas gestores podem excluir registros de troca
CREATE POLICY "Gestores excluem swap_requests"
  ON swap_requests FOR DELETE
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario'
    )
  );
