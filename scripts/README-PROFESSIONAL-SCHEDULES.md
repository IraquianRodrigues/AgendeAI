# Sistema de Horários dos Profissionais

## Descrição

Esta estrutura permite que cada profissional tenha seus próprios horários de trabalho configurados por dia da semana.

## Estrutura da Tabela

A tabela `professional_schedules` armazena:
- **professional_id**: ID do profissional
- **day_of_week**: Dia da semana (0=Domingo, 1=Segunda, ..., 6=Sábado)
- **start_time**: Horário de início (ex: 08:00)
- **end_time**: Horário de fim (ex: 12:00)
- **is_active**: Se o horário está ativo

## Como Aplicar

### 1. Criar a Tabela

Execute o script `create-professional-schedules-table.sql` no SQL Editor do Supabase.

### 2. Configurar RLS (Row Level Security)

Execute o script `setup-professional-schedules-rls.sql` para permitir acesso aos usuários autenticados.

### 3. Inserir Horários (Opcional)

Execute o script `seed-professional-schedules-example.sql` como exemplo, **lembrando de ajustar os IDs dos profissionais** pelos valores reais do seu banco.

## Exemplos de Uso

### Exemplo 1: Profissional com horário comercial (8h-12h e 14h-18h, Segunda a Sexta)

```sql
-- Para cada dia, inserir dois períodos (manhã e tarde)
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time)
VALUES 
  (1, 1, '08:00', '12:00'),  -- Segunda manhã
  (1, 1, '14:00', '18:00'),  -- Segunda tarde
  (1, 2, '08:00', '12:00'),  -- Terça manhã
  (1, 2, '14:00', '18:00');  -- Terça tarde
-- ... e assim por diante
```

### Exemplo 2: Profissional com horário único por dia (9h-17h, Segunda a Quarta)

```sql
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time)
VALUES 
  (2, 1, '09:00', '17:00'),  -- Segunda
  (2, 2, '09:00', '17:00'),  -- Terça
  (2, 3, '09:00', '17:00');  -- Quarta
```

### Exemplo 3: Profissional que trabalha apenas Sábado

```sql
INSERT INTO professional_schedules (professional_id, day_of_week, start_time, end_time)
VALUES (3, 6, '08:00', '12:00');  -- Sábado
```

## Consultas Úteis

### Ver todos os horários de um profissional

```sql
SELECT 
  CASE day_of_week
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Segunda-feira'
    WHEN 2 THEN 'Terça-feira'
    WHEN 3 THEN 'Quarta-feira'
    WHEN 4 THEN 'Quinta-feira'
    WHEN 5 THEN 'Sexta-feira'
    WHEN 6 THEN 'Sábado'
  END as dia,
  start_time as inicio,
  end_time as fim
FROM professional_schedules
WHERE professional_id = 1
  AND is_active = true
ORDER BY day_of_week, start_time;
```

### Ver horários de todos os profissionais

```sql
SELECT 
  p.name as profissional,
  CASE ps.day_of_week
    WHEN 0 THEN 'Dom'
    WHEN 1 THEN 'Seg'
    WHEN 2 THEN 'Ter'
    WHEN 3 THEN 'Qua'
    WHEN 4 THEN 'Qui'
    WHEN 5 THEN 'Sex'
    WHEN 6 THEN 'Sáb'
  END as dia,
  ps.start_time as inicio,
  ps.end_time as fim
FROM professional_schedules ps
JOIN professionals p ON ps.professional_id = p.id
WHERE ps.is_active = true
ORDER BY p.name, ps.day_of_week, ps.start_time;
```

### Desativar um horário específico

```sql
UPDATE professional_schedules
SET is_active = false
WHERE id = 1;  -- ID do horário específico
```

### Remover um horário

```sql
DELETE FROM professional_schedules
WHERE id = 1;  -- ID do horário específico
```

## Dia da Semana

- **0** = Domingo
- **1** = Segunda-feira
- **2** = Terça-feira
- **3** = Quarta-feira
- **4** = Quinta-feira
- **5** = Sexta-feira
- **6** = Sábado

## Observações

- Um profissional pode ter **múltiplos períodos no mesmo dia** (ex: manhã e tarde)
- Não é permitido horários sobrepostos para o mesmo profissional no mesmo dia
- Use `is_active = false` para desativar temporariamente um horário sem deletá-lo




