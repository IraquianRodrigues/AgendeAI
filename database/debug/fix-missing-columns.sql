-- ============================================
-- CORRIGIR COLUNAS FALTANTES - AgendeAI
-- ============================================
-- Este script adiciona TODAS as colunas que podem estar faltando
-- nas tabelas vindas do OdontoVida
-- ============================================

-- APPOINTMENTS: Adicionar service_id e professional_id
-- ============================================
DO $$ 
BEGIN
  -- Adicionar service_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN service_id BIGINT;
    RAISE NOTICE '✅ Coluna service_id adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna service_id já existe';
  END IF;

  -- Adicionar professional_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'professional_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN professional_id BIGINT;
    RAISE NOTICE '✅ Coluna professional_id adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna professional_id já existe';
  END IF;

  -- Adicionar status se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'status'
  ) THEN
    ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'pending' NOT NULL;
    RAISE NOTICE '✅ Coluna status adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna status já existe';
  END IF;

  -- Adicionar completed_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE appointments ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE '✅ Coluna completed_at adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna completed_at já existe';
  END IF;
END $$;

-- ============================================
-- MIGRAR DADOS EXISTENTES
-- ============================================
DO $$ 
BEGIN
  -- Se service_code existir, copiar para service_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'service_code'
  ) THEN
    UPDATE appointments 
    SET service_id = service_code 
    WHERE service_id IS NULL AND service_code IS NOT NULL;
    RAISE NOTICE '✅ Dados migrados de service_code para service_id';
  END IF;

  -- Se professional_code existir, copiar para professional_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'professional_code'
  ) THEN
    UPDATE appointments 
    SET professional_id = professional_code 
    WHERE professional_id IS NULL AND professional_code IS NOT NULL;
    RAISE NOTICE '✅ Dados migrados de professional_code para professional_id';
  END IF;
END $$;

-- ============================================
-- ADICIONAR FOREIGN KEYS (se as tabelas existirem)
-- ============================================
DO $$ 
BEGIN
  -- Foreign key para services
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'appointments_service_id_fkey'
  ) THEN
    ALTER TABLE appointments 
    ADD CONSTRAINT appointments_service_id_fkey 
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Foreign key service_id criada';
  ELSE
    RAISE NOTICE '⚠️  Foreign key service_id já existe';
  END IF;

  -- Foreign key para professionals
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'appointments_professional_id_fkey'
  ) THEN
    ALTER TABLE appointments 
    ADD CONSTRAINT appointments_professional_id_fkey 
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Foreign key professional_id criada';
  ELSE
    RAISE NOTICE '⚠️  Foreign key professional_id já existe';
  END IF;
END $$;

-- ============================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT '
============================================
✅ VERIFICAÇÃO FINAL
============================================
' as resultado;

-- Mostrar todas as colunas da tabela appointments
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- Contar registros
SELECT 
  COUNT(*) as total_appointments,
  COUNT(service_id) as com_service_id,
  COUNT(professional_id) as com_professional_id,
  COUNT(service_code) as com_service_code,
  COUNT(professional_code) as com_professional_code
FROM appointments;

SELECT '✅ Script executado com sucesso!' as resultado;
