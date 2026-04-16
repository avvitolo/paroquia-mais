-- Adiciona tipo de indisponibilidade em member_availability
-- Tipos: single_date (padrão), period (período), weekend (final de semana), weekday (durante a semana)
ALTER TABLE member_availability
  ADD COLUMN availability_type TEXT NOT NULL DEFAULT 'single_date'
    CHECK (availability_type IN ('single_date', 'period', 'weekend', 'weekday'));

-- Atualiza registros existentes: se start=end, é data única, senão é período
UPDATE member_availability
  SET availability_type = CASE
    WHEN start_date = end_date THEN 'single_date'
    ELSE 'period'
  END;
