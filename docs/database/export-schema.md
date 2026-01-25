# 🔄 Guia de Migração do Schema do Banco de Dados

## Método 1: Copiar SQL Manualmente (Mais Simples)

### Passo 1: Exportar do OdontoVida

1. Acesse o Supabase Dashboard do **OdontoVida**
2. Vá em **SQL Editor**
3. Execute este script para ver todas as tabelas:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Passo 2: Exportar Schema de Cada Tabela

Para cada tabela, execute:

```sql
-- Substitua 'nome_da_tabela' pelo nome real
SELECT
    'CREATE TABLE ' || table_name || ' (' ||
    string_agg(
        column_name || ' ' ||
        data_type ||
        CASE WHEN character_maximum_length IS NOT NULL
             THEN '(' || character_maximum_length || ')'
             ELSE '' END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
        ', '
    ) ||
    ');'
FROM information_schema.columns
WHERE table_name = 'nome_da_tabela'
GROUP BY table_name;
```

### Passo 3: Copiar para o Novo Banco (AgendeAI)

1. Copie o SQL gerado
2. Acesse o Supabase Dashboard do **AgendeAI**
3. Vá em **SQL Editor**
4. Cole e execute o SQL

---

## Método 2: Exportar Schema Completo via SQL

### No Supabase do OdontoVida:

Execute este script completo no SQL Editor:

```sql
-- 1. Criar todas as tabelas
SELECT
    'CREATE TABLE IF NOT EXISTS ' || tablename || ' (' ||
    string_agg(
        column_name || ' ' ||
        udt_name ||
        CASE
            WHEN character_maximum_length IS NOT NULL
            THEN '(' || character_maximum_length || ')'
            ELSE ''
        END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE
            WHEN column_default IS NOT NULL
            THEN ' DEFAULT ' || column_default
            ELSE ''
        END,
        ', '
    ) || ');' as create_statement
FROM pg_tables
LEFT JOIN information_schema.columns ON tablename = table_name AND schemaname = table_schema
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

Copie todo o resultado e execute no novo banco.

---

## Método 3: Usar Migrations do Supabase

Se você tem migrations na pasta `supabase-migrations`:

```powershell
# Navegar para a pasta do projeto
cd c:\Users\iraquian\agendeai

# Verificar se há migrations
ls supabase-migrations
```

Se houver arquivos `.sql`, você pode executá-los manualmente no SQL Editor do novo Supabase.

---

## ✅ Verificar se a Migração Funcionou

Depois de executar o SQL no novo banco, verifique:

```sql
-- Listar todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Contar registros (deve estar vazio se for novo)
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 🚨 Importante: RLS Policies

Não esqueça de copiar as **Row Level Security (RLS) policies**:

### No banco OdontoVida:

```sql
-- Ver todas as policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public';
```

Copie e recrie no novo banco.

---

## 📝 Checklist

- [ ] Exportar lista de tabelas
- [ ] Exportar schema de cada tabela
- [ ] Executar CREATE TABLE no novo banco
- [ ] Verificar que todas as tabelas foram criadas
- [ ] Copiar RLS policies
- [ ] Copiar triggers (se houver)
- [ ] Copiar functions (se houver)
- [ ] Testar conexão da aplicação

---

**Dica:** Se você já tem arquivos SQL na pasta `supabase-migrations`, é mais fácil executá-los diretamente!
