# 🔧 Como Executar a Migração de Appointments

## ⚠️ IMPORTANTE

Você precisa executar o script SQL no Supabase **ANTES** de testar a aplicação novamente.

## Passo a Passo

### 1. Abrir o Supabase Dashboard

- Acesse [supabase.com](https://supabase.com)
- Faça login
- Selecione o projeto **AgendeAI**

### 2. Abrir o SQL Editor

- No menu lateral, clique em **SQL Editor**
- Clique em **New Query**

### 3. Copiar e Executar o Script

- Abra o arquivo `fix-appointments-structure.sql`
- Copie **TODO** o conteúdo
- Cole no SQL Editor
- Clique em **Run** (ou `Ctrl+Enter`)

### 4. Verificar se Funcionou

Execute este comando para verificar:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name IN ('service_id', 'professional_id', 'service_code', 'professional_code')
ORDER BY column_name;
```

**Resultado esperado:**

- `professional_id` - bigint
- `service_id` - bigint
- `professional_code` - integer (ainda existe, será removido depois)
- `service_code` - integer (ainda existe, será removido depois)

### 5. Testar a Aplicação

- Volte para `http://localhost:3001`
- Recarregue a página
- O erro "Erro ao buscar appointments" **deve ter sumido!** ✅

## O Que Foi Alterado

### No Banco de Dados

- ✅ Adicionadas colunas `service_id` e `professional_id` com foreign keys
- ✅ Migrados dados das colunas antigas
- ✅ Criados índices para performance
- ⏳ Colunas antigas mantidas temporariamente (para segurança)

### No Código

- ✅ Corrigidas todas as queries em `appointments.service.ts`
- ✅ Atualizado `createAppointment` para usar `service_id` e `professional_id`
- ✅ Atualizado `updateAppointment` para usar `service_id` e `professional_id`
- ✅ Corrigidas queries de `getAppointments`, `getAppointmentById`, `getAppointmentsByPhone`

## Próximos Passos

Após executar o script e testar:

1. ✅ Verificar se appointments carrega sem erros
2. 🎨 Remover funcionalidades de odontologia
3. 📝 Adaptar terminologia para estética
4. 🧹 Limpeza final
