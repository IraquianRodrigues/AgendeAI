-- Configurar Row Level Security (RLS) para a tabela professional_services
-- Execute este script no SQL Editor do Supabase APÓS criar a tabela

-- Habilitar RLS na tabela
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (ler): usuários autenticados podem ler todas as associações
CREATE POLICY "Usuários autenticados podem ler associações profissional-serviço"
ON professional_services
FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT (inserir): usuários autenticados podem criar novas associações
CREATE POLICY "Usuários autenticados podem criar associações profissional-serviço"
ON professional_services
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE (atualizar): usuários autenticados podem atualizar associações
CREATE POLICY "Usuários autenticados podem atualizar associações profissional-serviço"
ON professional_services
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE (deletar): usuários autenticados podem deletar associações
CREATE POLICY "Usuários autenticados podem deletar associações profissional-serviço"
ON professional_services
FOR DELETE
TO authenticated
USING (true);

