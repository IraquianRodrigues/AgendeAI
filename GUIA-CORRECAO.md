# 🔧 Guia de Correção - Migração OdontoVida → AgendeAI

## 🎯 Problema Identificado

Você migrou o banco de dados do **OdontoVida** para o **AgendeAI**, mas algumas colunas ficaram faltando nas tabelas. Isso está causando o erro ao criar agendamentos.

## ✅ Solução Passo a Passo

### Passo 1: Verificar Estrutura Atual

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor** → **New Query**
3. Cole o conteúdo do arquivo `check-all-tables.sql`
4. Clique em **Run**
5. Veja quais colunas existem em cada tabela

### Passo 2: Corrigir Colunas Faltantes

1. No **SQL Editor**, abra uma **nova query**
2. Cole o conteúdo do arquivo `fix-missing-columns.sql`
3. Clique em **Run**
4. Aguarde a execução (você verá mensagens de ✅ sucesso ou ⚠️ avisos)

### Passo 3: Verificar se Funcionou

Após executar o script, você deve ver:

```
✅ Coluna service_id adicionada
✅ Coluna professional_id adicionada
✅ Dados migrados de service_code para service_id
✅ Dados migrados de professional_code para professional_id
✅ Foreign key service_id criada
✅ Foreign key professional_id criada
```

### Passo 4: Testar Criação de Agendamento

1. Volte para a aplicação
2. Abra o console do navegador (F12)
3. Tente criar um novo agendamento
4. Deve funcionar agora! 🎉

## 📋 O Que o Script Faz

O script `fix-missing-columns.sql`:

1. ✅ Adiciona a coluna `service_id` (se não existir)
2. ✅ Adiciona a coluna `professional_id` (se não existir)
3. ✅ Adiciona a coluna `status` (se não existir)
4. ✅ Adiciona a coluna `completed_at` (se não existir)
5. ✅ Migra dados de `service_code` → `service_id`
6. ✅ Migra dados de `professional_code` → `professional_id`
7. ✅ Cria foreign keys para garantir integridade
8. ✅ Cria índices para melhorar performance

## 🔍 Se Ainda Não Funcionar

Se após executar o script o erro persistir:

1. Execute o `check-all-tables.sql` novamente
2. Tire um print do resultado
3. Abra o console do navegador (F12)
4. Tente criar um agendamento
5. Copie TODAS as mensagens de erro que aparecerem
6. Me envie essas informações

## 💡 Dica

O script é **seguro** e **idempotente**, ou seja:

- Não vai quebrar nada que já existe
- Pode ser executado várias vezes sem problemas
- Só adiciona o que está faltando

## 📝 Arquivos Criados

- `fix-missing-columns.sql` → Script principal de correção
- `check-all-tables.sql` → Verificação da estrutura das tabelas
- `verificacao-rapida.sql` → Teste rápido de inserção manual
