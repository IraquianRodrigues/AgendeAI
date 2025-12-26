-- Configurar Row Level Security (RLS) para a tabela professional_schedules
-- Execute este script no SQL Editor do Supabase APÓS criar a tabela

-- Habilitar RLS na tabela
ALTER TABLE professional_schedules ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (ler): usuários autenticados podem ler todos os horários
CREATE POLICY "Usuários autenticados podem ler horários de profissionais"
ON professional_schedules
FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT (inserir): usuários autenticados podem criar novos horários
CREATE POLICY "Usuários autenticados podem criar horários de profissionais"
ON professional_schedules
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE (atualizar): usuários autenticados podem atualizar horários
CREATE POLICY "Usuários autenticados podem atualizar horários de profissionais"
ON professional_schedules
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE (deletar): usuários autenticados podem deletar horários
CREATE POLICY "Usuários autenticados podem deletar horários de profissionais"
ON professional_schedules
FOR DELETE
TO authenticated
USING (true);










