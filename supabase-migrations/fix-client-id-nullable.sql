-- ============================================
-- CORREÇÃO: Permitir despesas sem client_id
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query > Cole e Execute
-- ============================================

-- 1. Alterar a coluna client_id para permitir NULL
ALTER TABLE transactions 
ALTER COLUMN client_id DROP NOT NULL;

-- 2. Verificar a alteração
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'transactions'
AND column_name = 'client_id';

-- ============================================
-- RESULTADO ESPERADO:
-- column_name | data_type | is_nullable
-- client_id   | uuid      | YES
-- ============================================
