-- ============================================
-- DADOS DE TESTE - Sistema de Estética
-- ============================================
-- Execute este script DEPOIS de executar fix-appointments-structure.sql
-- ============================================

-- 1. PROFISSIONAIS
INSERT INTO professionals (code, name, specialty) VALUES
('PROF001', 'Maria Silva', 'Manicure e Pedicure'),
('PROF002', 'João Santos', 'Barbeiro'),
('PROF003', 'Ana Costa', 'Designer de Sobrancelhas'),
('PROF004', 'Carlos Oliveira', 'Esteticista Facial')
ON CONFLICT (code) DO NOTHING;

-- 2. SERVIÇOS
INSERT INTO services (code, duration_minutes, price) VALUES
('MANI', 30, 50.00),
('PEDI', 45, 60.00),
('CORTE-MASC', 30, 40.00),
('CORTE-FEM', 45, 60.00),
('BARBA', 20, 30.00),
('DESIGN-SOBR', 20, 35.00),
('LIMPEZA-PELE', 60, 120.00),
('HIDRATACAO-FACIAL', 45, 90.00),
('DEPILACAO-BUCO', 15, 25.00),
('DEPILACAO-PERNAS', 40, 80.00)
ON CONFLICT (code) DO NOTHING;

-- 3. ASSOCIAR PROFISSIONAIS COM SERVIÇOS
-- Maria Silva (Manicure) - Serviços de unhas
INSERT INTO professional_services (professional_id, service_id, custom_duration_minutes, is_active)
SELECT 
  p.id, 
  s.id, 
  s.duration_minutes,
  true
FROM professionals p
CROSS JOIN services s
WHERE p.code = 'PROF001' 
  AND s.code IN ('MANI', 'PEDI')
ON CONFLICT (professional_id, service_id) DO NOTHING;

-- João Santos (Barbeiro) - Serviços masculinos
INSERT INTO professional_services (professional_id, service_id, custom_duration_minutes, is_active)
SELECT 
  p.id, 
  s.id, 
  s.duration_minutes,
  true
FROM professionals p
CROSS JOIN services s
WHERE p.code = 'PROF002' 
  AND s.code IN ('CORTE-MASC', 'BARBA')
ON CONFLICT (professional_id, service_id) DO NOTHING;

-- Ana Costa (Designer) - Serviços de sobrancelha e depilação
INSERT INTO professional_services (professional_id, service_id, custom_duration_minutes, is_active)
SELECT 
  p.id, 
  s.id, 
  s.duration_minutes,
  true
FROM professionals p
CROSS JOIN services s
WHERE p.code = 'PROF003' 
  AND s.code IN ('DESIGN-SOBR', 'DEPILACAO-BUCO', 'DEPILACAO-PERNAS')
ON CONFLICT (professional_id, service_id) DO NOTHING;

-- Carlos Oliveira (Esteticista) - Serviços faciais
INSERT INTO professional_services (professional_id, service_id, custom_duration_minutes, is_active)
SELECT 
  p.id, 
  s.id, 
  s.duration_minutes,
  true
FROM professionals p
CROSS JOIN services s
WHERE p.code = 'PROF004' 
  AND s.code IN ('LIMPEZA-PELE', 'HIDRATACAO-FACIAL', 'DESIGN-SOBR')
ON CONFLICT (professional_id, service_id) DO NOTHING;

-- 4. CLIENTES DE EXEMPLO
INSERT INTO clientes (nome, telefone, trava, endereco, cidade, bairro, data_nascimento) VALUES
('Juliana Mendes', '(11) 98765-4321', false, 'Rua das Flores, 123', 'São Paulo', 'Jardins', '1990-05-15'),
('Roberto Lima', '(11) 97654-3210', false, 'Av. Paulista, 456', 'São Paulo', 'Bela Vista', '1985-08-22'),
('Fernanda Costa', '(11) 96543-2109', false, 'Rua Augusta, 789', 'São Paulo', 'Consolação', '1995-03-10'),
('Pedro Alves', '(11) 95432-1098', false, 'Rua Oscar Freire, 321', 'São Paulo', 'Jardins', '1988-11-30')
ON CONFLICT DO NOTHING;

-- 5. AGENDAMENTOS DE EXEMPLO (para hoje e próximos dias)
-- Vamos criar alguns agendamentos para testar
DO $$
DECLARE
  maria_id BIGINT;
  joao_id BIGINT;
  ana_id BIGINT;
  carlos_id BIGINT;
  mani_id BIGINT;
  corte_masc_id BIGINT;
  design_id BIGINT;
  limpeza_id BIGINT;
BEGIN
  -- Buscar IDs dos profissionais
  SELECT id INTO maria_id FROM professionals WHERE code = 'PROF001';
  SELECT id INTO joao_id FROM professionals WHERE code = 'PROF002';
  SELECT id INTO ana_id FROM professionals WHERE code = 'PROF003';
  SELECT id INTO carlos_id FROM professionals WHERE code = 'PROF004';
  
  -- Buscar IDs dos serviços
  SELECT id INTO mani_id FROM services WHERE code = 'MANI';
  SELECT id INTO corte_masc_id FROM services WHERE code = 'CORTE-MASC';
  SELECT id INTO design_id FROM services WHERE code = 'DESIGN-SOBR';
  SELECT id INTO limpeza_id FROM services WHERE code = 'LIMPEZA-PELE';
  
  -- Criar agendamentos para hoje
  INSERT INTO appointments (customer_name, customer_phone, service_id, professional_id, start_time, end_time, status)
  VALUES
    ('Juliana Mendes', '(11) 98765-4321', mani_id, maria_id, 
     NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 hours 30 minutes', 'agendado'),
    ('Roberto Lima', '(11) 97654-3210', corte_masc_id, joao_id, 
     NOW() + INTERVAL '3 hours', NOW() + INTERVAL '3 hours 30 minutes', 'agendado'),
    ('Fernanda Costa', '(11) 96543-2109', design_id, ana_id, 
     NOW() + INTERVAL '4 hours', NOW() + INTERVAL '4 hours 20 minutes', 'agendado'),
    ('Pedro Alves', '(11) 95432-1098', limpeza_id, carlos_id, 
     NOW() + INTERVAL '5 hours', NOW() + INTERVAL '6 hours', 'agendado')
  ON CONFLICT DO NOTHING;
  
  -- Criar agendamentos para amanhã
  INSERT INTO appointments (customer_name, customer_phone, service_id, professional_id, start_time, end_time, status)
  VALUES
    ('Juliana Mendes', '(11) 98765-4321', design_id, ana_id, 
     NOW() + INTERVAL '1 day' + INTERVAL '10 hours', NOW() + INTERVAL '1 day' + INTERVAL '10 hours 20 minutes', 'agendado'),
    ('Roberto Lima', '(11) 97654-3210', corte_masc_id, joao_id, 
     NOW() + INTERVAL '1 day' + INTERVAL '14 hours', NOW() + INTERVAL '1 day' + INTERVAL '14 hours 30 minutes', 'agendado')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute para ver os dados criados:

-- Ver profissionais
SELECT * FROM professionals ORDER BY name;

-- Ver serviços
SELECT * FROM services ORDER BY code;

-- Ver associações profissional-serviço
SELECT 
  p.name as profissional,
  s.code as servico,
  ps.custom_duration_minutes as duracao
FROM professional_services ps
JOIN professionals p ON ps.professional_id = p.id
JOIN services s ON ps.service_id = s.id
WHERE ps.is_active = true
ORDER BY p.name, s.code;

-- Ver agendamentos
SELECT 
  a.id,
  a.customer_name as cliente,
  s.code as servico,
  p.name as profissional,
  a.start_time,
  a.status
FROM appointments a
JOIN services s ON a.service_id = s.id
JOIN professionals p ON a.professional_id = p.id
ORDER BY a.start_time;

-- ============================================
