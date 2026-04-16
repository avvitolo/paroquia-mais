-- Adiciona campo coordinator_id na tabela pastorals
-- O coordenador é um membro da paróquia (registrado na tabela members)
ALTER TABLE pastorals
  ADD COLUMN coordinator_id UUID REFERENCES members(id) ON DELETE SET NULL;

-- Índice para facilitar lookup de pastorais por coordenador
CREATE INDEX idx_pastorals_coordinator_id ON pastorals(coordinator_id);
