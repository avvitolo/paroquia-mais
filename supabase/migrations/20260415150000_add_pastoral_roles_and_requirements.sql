-- Epic 6: Funções por pastoral e requisitos de celebração
-- Criado em 2026-04-15

-- Tabela de funções por pastoral (ex: Acólito → Missal, Turíbulo, Naveta)
CREATE TABLE pastoral_roles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id  UUID        NOT NULL REFERENCES parishes(id)  ON DELETE CASCADE,
  pastoral_id UUID       NOT NULL REFERENCES pastorals(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pastoral_id, name)
);

-- Índices
CREATE INDEX pastoral_roles_parish_id_idx  ON pastoral_roles (parish_id);
CREATE INDEX pastoral_roles_pastoral_id_idx ON pastoral_roles (pastoral_id);

-- RLS
ALTER TABLE pastoral_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parish members can read pastoral_roles"
  ON pastoral_roles FOR SELECT
  USING (parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid);

CREATE POLICY "admin or coordinator can manage pastoral_roles"
  ON pastoral_roles FOR ALL
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'coordinator')
  )
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'coordinator')
  );

-- -------------------------------------------------------------------------
-- Requisitos de pastoral/função por celebração
-- (quantos membros de cada função são necessários)
-- -------------------------------------------------------------------------
CREATE TABLE celebration_requirements (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id        UUID        NOT NULL REFERENCES parishes(id)       ON DELETE CASCADE,
  celebration_id   UUID        NOT NULL REFERENCES celebrations(id)   ON DELETE CASCADE,
  pastoral_id      UUID        NOT NULL REFERENCES pastorals(id)      ON DELETE CASCADE,
  pastoral_role_id UUID        NOT NULL REFERENCES pastoral_roles(id) ON DELETE CASCADE,
  quantity         INT         NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX celebration_requirements_parish_id_idx       ON celebration_requirements (parish_id);
CREATE INDEX celebration_requirements_celebration_id_idx  ON celebration_requirements (celebration_id);

-- RLS
ALTER TABLE celebration_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parish members can read celebration_requirements"
  ON celebration_requirements FOR SELECT
  USING (parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid);

CREATE POLICY "admin or coordinator can manage celebration_requirements"
  ON celebration_requirements FOR ALL
  USING (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'coordinator')
  )
  WITH CHECK (
    parish_id = (auth.jwt() -> 'app_metadata' ->> 'parish_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'coordinator')
  );

-- -------------------------------------------------------------------------
-- Adiciona pastoral_role_id em schedule_assignments (nullable para compat)
-- -------------------------------------------------------------------------
ALTER TABLE schedule_assignments
  ADD COLUMN pastoral_role_id UUID REFERENCES pastoral_roles(id) ON DELETE SET NULL;
