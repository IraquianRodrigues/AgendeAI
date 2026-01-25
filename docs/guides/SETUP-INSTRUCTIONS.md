# 🚀 Como Executar o Setup do Banco de Dados

## Passo a Passo

### 1. Abrir o Supabase Dashboard

- Acesse [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione o projeto **AgendeAI**

### 2. Abrir o SQL Editor

- No menu lateral, clique em **SQL Editor**
- Clique em **New Query**

### 3. Copiar e Colar o Script

- Abra o arquivo `setup-database.sql` deste projeto
- Copie **TODO** o conteúdo do arquivo
- Cole no SQL Editor do Supabase

### 4. Executar o Script

- Clique no botão **Run** (ou pressione `Ctrl+Enter`)
- Aguarde a execução (pode levar alguns segundos)
- ✅ Se tudo correr bem, você verá "Success. No rows returned"

### 5. Verificar se Funcionou

Execute este comando no SQL Editor para ver todas as tabelas criadas:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Resultado esperado:** Você deve ver estas tabelas:

- appointments
- audit_logs
- clientes
- expenses
- installments
- payment_plans
- professional_schedules
- professional_services
- professionals
- services
- transactions
- user_profiles

### 6. Criar Primeiro Usuário (Se Necessário)

Se você ainda não tem um usuário:

1. No Supabase Dashboard, vá em **Authentication** → **Users**
2. Clique em **Add user** → **Create new user**
3. Preencha:
   - Email: seu email
   - Password: sua senha
   - Auto Confirm User: ✅ (marque esta opção)
4. Clique em **Create user**

O sistema criará automaticamente um perfil com role `admin` para este usuário.

### 7. Testar o Login

1. Volte para a aplicação: `http://localhost:3002`
2. Faça login com o email e senha que você criou
3. ✅ Você deve conseguir acessar o sistema!

## 🎯 O Que Foi Criado

### Tabelas Base

- **user_profiles** - Perfis de usuários com sistema de roles
- **clientes** - Cadastro de clientes
- **appointments** - Agendamentos
- **professionals** - Profissionais
- **services** - Serviços oferecidos
- **professional_services** - Relação profissional-serviço
- **professional_schedules** - Horários dos profissionais

### Módulo Financeiro

- **transactions** - Transações financeiras
- **payment_plans** - Planos de pagamento
- **installments** - Parcelas
- **expenses** - Despesas

### Auditoria

- **audit_logs** - Logs de auditoria do sistema

### Segurança

- ✅ Row Level Security (RLS) habilitado em todas as tabelas
- ✅ Políticas de acesso configuradas
- ✅ Triggers automáticos para created_at e updated_at
- ✅ Trigger para criar perfil automaticamente ao registrar novo usuário

## ❓ Problemas Comuns

### Erro: "relation already exists"

Isso significa que algumas tabelas já existem. Você pode:

1. Ignorar (o script usa `IF NOT EXISTS`)
2. Ou deletar as tabelas existentes antes (cuidado!)

### Erro: "permission denied"

Verifique se você está usando o projeto correto do Supabase.

### Não consigo fazer login

1. Verifique se criou um usuário no Supabase
2. Verifique se marcou "Auto Confirm User"
3. Verifique se o `.env.local` está com as credenciais corretas

## 📝 Próximos Passos

Após executar o script com sucesso:

1. ✅ Fazer login na aplicação
2. ✅ Criar alguns dados de teste (clientes, profissionais, serviços)
3. ✅ Testar as funcionalidades principais
4. 🎨 Começar a adaptar o sistema para ser mais genérico (remover referências a odontologia)
