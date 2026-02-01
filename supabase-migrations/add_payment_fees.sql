-- ============================================
-- ADICIONAR CAMPOS DE TAXAS DE PAGAMENTO
-- ============================================
-- Adiciona campos para rastrear taxas de maquinetas
-- nas transações financeiras
-- ============================================

-- 1. Adicionar colunas de taxa na tabela transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_fee_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_fee_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2);

-- 2. Atualizar transações existentes
-- Calcular net_amount para transações que ainda não têm
UPDATE transactions 
SET net_amount = amount - COALESCE(payment_fee_amount, 0)
WHERE net_amount IS NULL;

-- 3. Criar índice para consultas de relatórios
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);

-- ============================================
-- COMENTÁRIOS DOS CAMPOS
-- ============================================
COMMENT ON COLUMN transactions.payment_fee_percentage IS 'Percentual da taxa cobrada pela maquineta (0-100)';
COMMENT ON COLUMN transactions.payment_fee_amount IS 'Valor em reais da taxa cobrada';
COMMENT ON COLUMN transactions.net_amount IS 'Valor líquido após descontar a taxa (amount - payment_fee_amount)';

-- ============================================
-- FIM DO SCRIPT
-- ============================================
