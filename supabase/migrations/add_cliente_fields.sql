-- Adiciona novos campos à tabela clientes para cadastro completo
-- Campos: endereço, cidade, bairro e data de nascimento

ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS bairro TEXT,
ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- Adiciona comentários para documentação
COMMENT ON COLUMN clientes.endereco IS 'Endereço completo do cliente';
COMMENT ON COLUMN clientes.cidade IS 'Cidade do cliente';
COMMENT ON COLUMN clientes.bairro IS 'Bairro do cliente';
COMMENT ON COLUMN clientes.data_nascimento IS 'Data de nascimento do cliente para cálculo de idade';
