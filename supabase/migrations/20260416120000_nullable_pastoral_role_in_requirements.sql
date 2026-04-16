-- Torna pastoral_role_id opcional em celebration_requirements
-- Permite registrar a pastoral em uma celebração mesmo sem função específica definida
ALTER TABLE celebration_requirements
  ALTER COLUMN pastoral_role_id DROP NOT NULL;
