-- ============================================
-- HABILITAR REALTIME PARA NOTIFICAÇÕES
-- ============================================
-- Execute este script no SQL Editor do Supabase

-- IMPORTANTE: Precisamos habilitar Realtime na tabela APPOINTMENTS
-- (não na tabela notifications, pois estamos escutando mudanças em appointments)

-- 1. Adicionar tabela appointments à publicação do Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- 2. Adicionar tabela notifications também (para futuras melhorias)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 3. Verificar se foram adicionadas corretamente
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Resultado esperado: você deve ver 'appointments' e 'notifications' na lista

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Se der erro "relation already exists in publication", execute:
-- ALTER PUBLICATION supabase_realtime DROP TABLE appointments;
-- ALTER PUBLICATION supabase_realtime DROP TABLE notifications;
-- E depois execute os comandos ADD acima novamente.
