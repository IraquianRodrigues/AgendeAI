-- ============================================
-- DIAGNÓSTICO E CORREÇÃO: Tabela Appointments
-- ============================================
-- Este script verifica e corrige a estrutura da tabela appointments
-- ============================================

-- PASSO 1: VERIFICAR ESTRUTURA ATUAL
-- ============================================
SELECT 'PASSO 1: Verificando estrutura atual da tabela appointments' as step;

SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND column_name IN ('service_id', 'professional_id', 'service_code', 'professional_code')
ORDER BY column_name;

-- PASSO 2: ADICIONAR COLUNAS SE NÃO EXISTIREM
-- ============================================
SELECT 'PASSO 2: Adicionando colunas service_id e professional_id se necessário' as step;

-- Adicionar service_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE appointments 
    ADD COLUMN service_id BIGINT REFERENCES services(id) ON DELETE CASCADE;
    RAISE NOTICE 'Coluna service_id adicionada';
  ELSE
    RAISE NOTICE 'Coluna service_id já existe';
  END IF;
END $$;

-- Adicionar professional_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'professional_id'
  ) THEN
    ALTER TABLE appointments 
    ADD COLUMN professional_id BIGINT REFERENCES professionals(id) ON DELETE CASCADE;
    RAISE NOTICE 'Coluna professional_id adicionada';
  ELSE
    RAISE NOTICE 'Coluna professional_id já existe';
  END IF;
END $$;

-- PASSO 3: MIGRAR DADOS EXISTENTES
-- ============================================
SELECT 'PASSO 3: Migrando dados de service_code/professional_code para service_id/professional_id' as step;

-- Migrar service_code para service_id (se service_code existir)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'service_code'
  ) THEN
    UPDATE appointments 
    SET service_id = service_code 
    WHERE service_id IS NULL AND service_code IS NOT NULL;
    RAISE NOTICE 'Dados de service_code migrados para service_id';
  END IF;
END $$;

-- Migrar professional_code para professional_id (se professional_code existir)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'professional_code'
  ) THEN
    UPDATE appointments 
    SET professional_id = professional_code 
    WHERE professional_id IS NULL AND professional_code IS NOT NULL;
    RAISE NOTICE 'Dados de professional_code migrados para professional_id';
  END IF;
END $$;

-- PASSO 4: CRIAR ÍNDICES
-- ============================================
SELECT 'PASSO 4: Criando índices para performance' as step;

CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);

-- PASSO 5: VERIFICAÇÃO FINAL
-- ============================================
SELECT 'PASSO 5: Verificação final' as step;

-- Ver estrutura final
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND column_name IN ('service_id', 'professional_id', 'service_code', 'professional_code')
ORDER BY column_name;

-- Ver alguns registros
SELECT 
  id,
  service_id,
  professional_id,
  customer_name,
  start_time,
  status
FROM appointments 
LIMIT 5;

-- Contar registros
SELECT 
  COUNT(*) as total_appointments,
  COUNT(service_id) as with_service_id,
  COUNT(professional_id) as with_professional_id
FROM appointments;

SELECT '✅ Diagnóstico e correção concluídos!' as resultado;
