-- Este script adiciona a coluna 'status' na tabela 'appointments'
-- Executar no SQL Editor do Supabase

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Opcional: Atualizar registros antigos para ter um status inicial
UPDATE appointments 
SET status = 'completed'
WHERE completed_at IS NOT NULL AND status = 'pending';

UPDATE appointments 
SET status = 'pending'
WHERE completed_at IS NULL AND status IS NULL;
