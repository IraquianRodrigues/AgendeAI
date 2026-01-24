-- ============================================
-- VERIFICAÇÃO: Estrutura da Tabela Appointments
-- ============================================
-- Execute este script para verificar se a migração funcionou
-- ============================================

-- 1. Ver todas as colunas da tabela appointments
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- 2. Verificar se service_id e professional_id existem
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND column_name IN ('service_id', 'professional_id', 'service_code', 'professional_code')
ORDER BY column_name;

-- 3. Ver foreign keys da tabela appointments
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'appointments';

-- 4. Contar appointments existentes
SELECT COUNT(*) as total_appointments FROM appointments;

-- 5. Ver alguns appointments (se houver)
SELECT 
  id,
  service_id,
  professional_id,
  service_code,
  professional_code,
  customer_name,
  start_time,
  status
FROM appointments 
LIMIT 5;
