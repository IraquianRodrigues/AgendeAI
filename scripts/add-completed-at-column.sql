-- Script para adicionar coluna completed_at na tabela appointments
-- Esta coluna permite marcar agendamentos como concluídos manualmente

-- Adicionar coluna completed_at (nullable, timestamptz)
-- NULL = não concluído, timestamptz = data/hora em que foi concluído
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS completed_at timestamptz NULL;

-- Criar índice para melhorar performance em consultas filtradas por status
CREATE INDEX IF NOT EXISTS idx_appointments_completed_at 
ON appointments(completed_at) 
WHERE completed_at IS NOT NULL;

-- Comentário na coluna para documentação
COMMENT ON COLUMN appointments.completed_at IS 'Data e hora em que o agendamento foi marcado como concluído. NULL indica que o agendamento ainda não foi concluído.';








