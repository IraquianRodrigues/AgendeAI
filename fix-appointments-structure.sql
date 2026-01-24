-- ============================================
-- MIGRAÇÃO: Corrigir Estrutura de Appointments
-- ============================================
-- Este script corrige a tabela appointments para usar foreign keys
-- ao invés de códigos numéricos simples
-- ============================================

-- 1. Adicionar novas colunas com foreign keys
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS professional_id BIGINT REFERENCES professionals(id) ON DELETE CASCADE;

-- 2. Migrar dados existentes (se houver)
-- Assumindo que service_code e professional_code correspondem aos IDs
UPDATE appointments 
SET service_id = service_code, 
    professional_id = professional_code
WHERE service_id IS NULL OR professional_id IS NULL;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);

-- 4. Remover colunas antigas (após confirmar que dados foram migrados)
-- CUIDADO: Só execute isso depois de verificar que os dados foram migrados corretamente
-- ALTER TABLE appointments DROP COLUMN IF EXISTS service_code;
-- ALTER TABLE appointments DROP COLUMN IF EXISTS professional_code;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute para verificar se a migração funcionou:
-- SELECT id, service_id, professional_id, customer_name, start_time 
-- FROM appointments 
-- LIMIT 5;
-- ============================================
