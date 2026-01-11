-- ============================================
-- INTEGRAÇÃO AGENDAMENTOS → FINANCEIRO
-- ============================================
-- Adiciona campos financeiros na tabela appointments
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Adicionar coluna de valor do procedimento
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS procedure_value DECIMAL(10, 2);

-- 2. Adicionar coluna de status de pagamento
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pendente';

-- 3. Adicionar coluna de referência à transação financeira
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;

-- 4. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_transaction_id ON appointments(transaction_id);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Verifique se as colunas foram adicionadas:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'appointments' 
-- AND column_name IN ('procedure_value', 'payment_status', 'transaction_id');
-- ============================================
