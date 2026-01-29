-- Tabela de horários dos profissionais
CREATE TABLE IF NOT EXISTS professional_schedules (
  id BIGSERIAL PRIMARY KEY,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir que start_time < end_time
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  
  -- Índices para performance
  CONSTRAINT unique_professional_schedule UNIQUE (professional_id, day_of_week, start_time, end_time)
);

-- Índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_professional_schedules_professional ON professional_schedules(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_schedules_day ON professional_schedules(day_of_week);

-- RLS Policies
ALTER TABLE professional_schedules ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
DROP POLICY IF EXISTS "Allow read for authenticated users" ON professional_schedules;
CREATE POLICY "Allow read for authenticated users"
  ON professional_schedules
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir insert para usuários autenticados
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON professional_schedules;
CREATE POLICY "Allow insert for authenticated users"
  ON professional_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir update para usuários autenticados
DROP POLICY IF EXISTS "Allow update for authenticated users" ON professional_schedules;
CREATE POLICY "Allow update for authenticated users"
  ON professional_schedules
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permitir delete para usuários autenticados
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON professional_schedules;
CREATE POLICY "Allow delete for authenticated users"
  ON professional_schedules
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para updated_at (assumindo que a função já existe)
DROP TRIGGER IF EXISTS update_professional_schedules_updated_at ON professional_schedules;
CREATE TRIGGER update_professional_schedules_updated_at
  BEFORE UPDATE ON professional_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
