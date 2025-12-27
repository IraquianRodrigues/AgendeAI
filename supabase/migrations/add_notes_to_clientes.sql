-- Adiciona coluna 'notes' na tabela 'clientes'
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS notes text;
