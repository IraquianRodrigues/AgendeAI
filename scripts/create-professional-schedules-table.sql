-- Cria tabela de horários dos profissionais
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS professional_schedules (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  
  -- Dia da semana: 0 = Domingo, 1 = Segunda, 2 = Terça, ..., 6 = Sábado
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Horário de início (formato TIME - apenas hora e minuto)
  start_time TIME NOT NULL,
  
  -- Horário de fim (formato TIME - apenas hora e minuto)
  end_time TIME NOT NULL CHECK (end_time > start_time),
  
  -- Se este horário está ativo
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Permite múltiplos períodos no mesmo dia (ex: manhã 8h-12h e tarde 14h-18h)
  -- Garante que não tenha horários sobrepostos para o mesmo profissional no mesmo dia
  CONSTRAINT unique_professional_day_period UNIQUE (professional_id, day_of_week, start_time)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_professional_schedules_professional_id 
  ON professional_schedules(professional_id);

CREATE INDEX IF NOT EXISTS idx_professional_schedules_day_of_week 
  ON professional_schedules(day_of_week);

CREATE INDEX IF NOT EXISTS idx_professional_schedules_active 
  ON professional_schedules(is_active) WHERE is_active = true;

-- Comentários
COMMENT ON TABLE professional_schedules IS 'Horários de trabalho dos profissionais por dia da semana';
COMMENT ON COLUMN professional_schedules.professional_id IS 'ID do profissional';
COMMENT ON COLUMN professional_schedules.day_of_week IS 'Dia da semana: 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado';
COMMENT ON COLUMN professional_schedules.start_time IS 'Horário de início do período (ex: 08:00)';
COMMENT ON COLUMN professional_schedules.end_time IS 'Horário de fim do período (ex: 12:00)';
COMMENT ON COLUMN professional_schedules.is_active IS 'Se este período está ativo';



