-- ============================================
-- ADD PROFESSIONAL TO TRANSACTIONS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Adicionar coluna professional_id à tabela transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS professional_id INTEGER REFERENCES professionals(id);

-- 2. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_professional_id ON transactions(professional_id);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Ver estrutura da tabela:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;
