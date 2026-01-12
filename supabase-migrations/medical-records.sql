-- ============================================
-- PRONTUÁRIO MÉDICO - Tabela de Registros Clínicos
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Criar tabela de registros médicos
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  clinical_notes TEXT,
  observations TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_medical_records_client ON medical_records(client_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records(date);

-- 3. Habilitar RLS
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ver registros médicos"
    ON medical_records FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar registros médicos"
    ON medical_records FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar registros médicos"
    ON medical_records FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar registros médicos"
    ON medical_records FOR DELETE
    USING (auth.role() = 'authenticated');

-- 5. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_medical_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;

CREATE TRIGGER update_medical_records_updated_at 
    BEFORE UPDATE ON medical_records
    FOR EACH ROW 
    EXECUTE FUNCTION update_medical_records_updated_at();

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Verificar se a tabela foi criada:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'medical_records';

-- Verificar as colunas:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'medical_records'
ORDER BY ordinal_position;
