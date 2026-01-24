-- ============================================
-- VERIFICAR TODAS AS TABELAS - AgendeAI
-- ============================================
-- Execute este script para ver quais colunas existem
-- em cada tabela importante
-- ============================================

SELECT '
============================================
📋 TABELA: APPOINTMENTS
============================================
' as info;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY column_name;

SELECT '
============================================
📋 TABELA: SERVICES
============================================
' as info;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'services' 
ORDER BY column_name;

SELECT '
============================================
📋 TABELA: PROFESSIONALS
============================================
' as info;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'professionals' 
ORDER BY column_name;

SELECT '
============================================
📋 TABELA: CLIENTES
============================================
' as info;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY column_name;

SELECT '
============================================
📋 TABELA: PROFESSIONAL_SERVICES
============================================
' as info;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'professional_services' 
ORDER BY column_name;

SELECT '
============================================
✅ VERIFICAÇÃO CONCLUÍDA
============================================
' as resultado;
