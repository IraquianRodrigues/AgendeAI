-- ============================================
-- VERIFICAÇÃO RÁPIDA: Dados Existentes
-- ============================================
-- Execute para ver se você tem profissionais e serviços
-- ============================================

-- 1. Contar profissionais
SELECT COUNT(*) as total_profissionais FROM professionals;

-- 2. Contar serviços
SELECT COUNT(*) as total_servicos FROM services;

-- 3. Ver profissionais (se houver)
SELECT id, code, name, specialty FROM professionals LIMIT 10;

-- 4. Ver serviços (se houver)
SELECT id, code, duration_minutes, price FROM services LIMIT 10;

-- 5. Ver associações profissional-serviço
SELECT COUNT(*) as total_associacoes FROM professional_services;
