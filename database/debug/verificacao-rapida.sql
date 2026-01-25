-- ============================================
-- SCRIPT DE VERIFICAÇÃO RÁPIDA
-- ============================================
-- Execute este script e me envie o resultado
-- ============================================

-- 1. Ver TODAS as colunas da tabela appointments
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY column_name;

-- 2. Tentar inserir um registro de teste
-- IMPORTANTE: Substitua os valores abaixo por IDs reais do seu banco
-- Primeiro, vamos ver quais services e professionals existem:

SELECT 'SERVICES DISPONÍVEIS:' as info;
SELECT id, code FROM services LIMIT 5;

SELECT 'PROFESSIONALS DISPONÍVEIS:' as info;
SELECT id, code, name FROM professionals LIMIT 5;

-- 3. Agora tente inserir um appointment de teste
-- SUBSTITUA os valores 1 e 1 pelos IDs reais que apareceram acima
/*
INSERT INTO appointments (
  customer_name,
  customer_phone,
  service_id,
  professional_id,
  start_time,
  end_time,
  status
) VALUES (
  'Teste Manual',
  '11999999999',
  1,  -- SUBSTITUA pelo ID de um service real
  1,  -- SUBSTITUA pelo ID de um professional real
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '30 minutes',
  'agendado'
);
*/

-- 4. Se o INSERT acima funcionar, delete o registro de teste:
-- DELETE FROM appointments WHERE customer_name = 'Teste Manual';
