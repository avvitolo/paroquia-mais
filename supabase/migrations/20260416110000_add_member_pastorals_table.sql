-- Tabela de relacionamento N:N entre membros e pastorais
-- Permite que um membro participe de mais de uma pastoral
CREATE TABLE IF NOT EXISTS member_pastorals (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id   UUID        NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  member_id   UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  pastoral_id UUID        NOT NULL REFERENCES pastorals(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, pastoral_id)
);

-- RLS
ALTER TABLE member_pastorals ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer usuário autenticado da mesma paróquia
CREATE POLICY "member_pastorals_read" ON member_pastorals
  FOR SELECT USING (
    parish_id::text = (auth.jwt() ->> 'parish_id')
  );

-- Escrita: apenas admins, pároco e secretário
CREATE POLICY "member_pastorals_write" ON member_pastorals
  FOR ALL USING (
    parish_id::text = (auth.jwt() ->> 'parish_id')
    AND (auth.jwt() ->> 'role') IN (
      'admin_sistema', 'admin_paroquial', 'paroco', 'secretario', 'coordenador'
    )
  );

-- Migra dados existentes (membros que já têm pastoral_id)
INSERT INTO member_pastorals (parish_id, member_id, pastoral_id)
SELECT parish_id, id, pastoral_id
FROM members
WHERE pastoral_id IS NOT NULL
ON CONFLICT (member_id, pastoral_id) DO NOTHING;

-- Índices
CREATE INDEX idx_member_pastorals_member_id   ON member_pastorals(member_id);
CREATE INDEX idx_member_pastorals_pastoral_id ON member_pastorals(pastoral_id);
CREATE INDEX idx_member_pastorals_parish_id   ON member_pastorals(parish_id);
