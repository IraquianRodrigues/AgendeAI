-- Script de exemplo para popular horários dos profissionais
-- IMPORTANTE: Ajuste os professional_id pelos IDs reais do seu banco

-- Exemplo 1: Dr. João trabalha Segunda a Sexta, 8h às 18h (com intervalo)
-- Substitua 1 pelo ID real do profissional

-- Segunda-feira: manhã 8h-12h e tarde 14h-18h
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, is_active)
VALUES 
  (1, 1, '08:00', '12:00', true),  -- Segunda manhã
  (1, 1, '14:00', '18:00', true);  -- Segunda tarde

-- Terça-feira: manhã 8h-12h e tarde 14h-18h
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, is_active)
VALUES 
  (1, 2, '08:00', '12:00', true),  -- Terça manhã
  (1, 2, '14:00', '18:00', true);  -- Terça tarde

-- Quarta-feira: manhã 8h-12h e tarde 14h-18h
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, is_active)
VALUES 
  (1, 3, '08:00', '12:00', true),  -- Quarta manhã
  (1, 3, '14:00', '18:00', true);  -- Quarta tarde

-- Quinta-feira: manhã 8h-12h e tarde 14h-18h
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, is_active)
VALUES 
  (1, 4, '08:00', '12:00', true),  -- Quinta manhã
  (1, 4, '14:00', '18:00', true);  -- Quinta tarde

-- Sexta-feira: manhã 8h-12h e tarde 14h-18h
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, is_active)
VALUES 
  (1, 5, '08:00', '12:00', true),  -- Sexta manhã
  (1, 5, '14:00', '18:00', true);  -- Sexta tarde

-- Exemplo 2: Dra. Maria trabalha Segunda a Quarta, 9h às 17h (sem intervalo)
-- Substitua 2 pelo ID real do profissional

-- Segunda-feira: 9h-17h
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, is_active)
VALUES (2, 1, '09:00', '17:00', true);

-- Terça-feira: 9h-17h
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, is_active)
VALUES (2, 2, '09:00', '17:00', true);

-- Quarta-feira: 9h-17h
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, is_active)
VALUES (2, 3, '09:00', '17:00', true);

-- Exemplo 3: Dr. Pedro trabalha apenas Sábado, 8h às 12h
-- Substitua 3 pelo ID real do profissional

INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time, is_active)
VALUES (3, 6, '08:00', '12:00', true);  -- Sábado

-- Verificar os horários inseridos
SELECT 
  ps.id,
  p.name as profissional,
  CASE ps.day_of_week
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda-feira'
    WHEN 2 THEN 'Terça-feira'
    WHEN 3 THEN 'Quarta-feira'
    WHEN 4 THEN 'Quinta-feira'
    WHEN 5 THEN 'Sexta-feira'
    WHEN 6 THEN 'Sábado'
  END as dia_semana,
  ps.start_time as horario_inicio,
  ps.end_time as horario_fim,
  ps.is_active as ativo
FROM professional_schedules ps
JOIN professionals p ON ps.professional_id = p.id
ORDER BY p.name, ps.day_of_week, ps.start_time;




