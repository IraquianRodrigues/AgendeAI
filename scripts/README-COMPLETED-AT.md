# Adicionar Coluna `completed_at` à Tabela `appointments`

## 📋 Descrição

Este script adiciona a coluna `completed_at` na tabela `appointments` para permitir marcar agendamentos como concluídos manualmente.

## 🎯 Funcionalidade

Com esta coluna, é possível:

- ✅ Marcar agendamentos como concluídos através do botão "Concluir" no dashboard
- ✅ Desmarcar agendamentos concluídos (reverter para pendente)
- ✅ Visualizar estatísticas de agendamentos concluídos vs pendentes
- ✅ Identificar visualmente agendamentos concluídos na tabela

## 🚀 Como Executar

### Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá para **SQL Editor**
3. Copie e cole o conteúdo do arquivo `add-completed-at-column.sql`
4. Execute o script

### Via CLI do Supabase

```bash
supabase db execute -f scripts/add-completed-at-column.sql
```

## 📊 Estrutura da Coluna

- **Nome**: `completed_at`
- **Tipo**: `timestamptz` (timestamp with timezone)
- **Nullable**: Sim (NULL = não concluído)
- **Valor**: Data/hora em que o agendamento foi marcado como concluído

## 🔍 Índice

O script também cria um índice para melhorar a performance em consultas que filtram por agendamentos concluídos:

```sql
CREATE INDEX idx_appointments_completed_at 
ON appointments(completed_at) 
WHERE completed_at IS NOT NULL;
```

## ✅ Verificação

Após executar o script, você pode verificar se a coluna foi criada corretamente:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments' 
AND column_name = 'completed_at';
```

## 🔄 Uso na Aplicação

Após executar o script:

1. Os agendamentos terão um botão "Concluir" na tabela
2. Ao clicar, o agendamento será marcado como concluído
3. O card de estatísticas "Concluídos" será atualizado automaticamente
4. Agendamentos concluídos aparecem com badge verde e fundo destacado


