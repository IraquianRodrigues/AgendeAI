-- ============================================
-- VERIFICAÇÃO E CORREÇÃO - Tabelas Financeiras
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('transactions', 'payment_plans', 'installments', 'expenses');

-- 2. Se as tabelas não aparecerem, execute o script completo novamente
-- Caso apareçam, verifique as permissões RLS

-- 3. Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('transactions', 'payment_plans', 'installments', 'expenses');

-- 4. Se necessário, recriar a tabela transactions com permissões corretas
DROP TABLE IF EXISTS transactions CASCADE;

CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    appointment_id UUID,
    type TEXT NOT NULL DEFAULT 'receita',
    category TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'pendente',
    due_date DATE NOT NULL,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Criar índices
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_appointment_id ON transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON transactions(due_date);

-- 6. Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 7. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem ver transações" ON transactions;
DROP POLICY IF EXISTS "Usuários autenticados podem criar transações" ON transactions;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar transações" ON transactions;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar transações" ON transactions;

-- 8. Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ver transações"
    ON transactions FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar transações"
    ON transactions FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar transações"
    ON transactions FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar transações"
    ON transactions FOR DELETE
    USING (auth.role() = 'authenticated');

-- 9. Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Verifique se a tabela foi criada:
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'transactions';

-- Verifique as colunas:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'transactions'
ORDER BY ordinal_position;
