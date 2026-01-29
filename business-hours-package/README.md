# 📦 Pacote Completo - Sistema de Horários de Funcionamento

Este pacote contém todos os arquivos necessários para implementar o sistema de controle de horários de funcionamento em qualquer CRM.

## 📋 Conteúdo do Pacote

### 1. **SQL** - Scripts de Banco de Dados

- `01-create-tables.sql` - Cria as 4 tabelas necessárias
- `02-create-policies.sql` - Configura as políticas de segurança (RLS)
- `03-seed-data.sql` - Dados iniciais (opcional)
- `04-debug-queries.sql` - Queries para debug e verificação

### 2. **Components** - Componentes React

- `business-hours-settings.tsx` - Componente principal com abas
- `weekly-schedule-editor.tsx` - Editor de horários semanais
- `breaks-manager.tsx` - Gerenciador de intervalos
- `holidays-manager.tsx` - Gerenciador de feriados
- `blocked-slots-manager.tsx` - Gerenciador de bloqueios pontuais

### 3. **Services** - Camada de Serviço

- `business-hours.service.ts` - Funções de acesso ao banco
- `use-business-hours.ts` - React Query hooks
- `index.ts` - Exports

### 4. **API** - Endpoint para N8N

- `route.ts` - API endpoint para consultar horários disponíveis

### 5. **Types** - TypeScript Types

- `database.types.ts` - Tipos do banco de dados

## 🚀 Como Usar

### Passo 1: Executar SQL no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute os scripts na ordem:
   - `01-create-tables.sql`
   - `02-create-policies.sql`
   - `03-seed-data.sql` (opcional)

### Passo 2: Copiar Arquivos do Projeto

```
seu-projeto/
├── src/
│   ├── components/
│   │   ├── business-hours-settings.tsx
│   │   ├── weekly-schedule-editor.tsx
│   │   ├── breaks-manager.tsx
│   │   ├── holidays-manager.tsx
│   │   └── blocked-slots-manager.tsx
│   ├── services/
│   │   └── business-hours/
│   │       ├── business-hours.service.ts
│   │       ├── use-business-hours.ts
│   │       └── index.ts
│   ├── app/
│   │   ├── api/
│   │   │   └── business-hours/
│   │   │       └── route.ts
│   │   └── dashboard/
│   │       └── configuracoes/
│   │           └── page.tsx
│   └── types/
│       └── database.types.ts (adicionar os tipos)
```

### Passo 3: Adicionar Rota no Menu

Adicione a rota de configurações no seu menu/sidebar:

```tsx
{
  title: "Configurações",
  url: "/dashboard/configuracoes",
  icon: Settings,
}
```

### Passo 4: Integrar com N8N

Use o endpoint da API para consultar horários disponíveis:

```
GET /api/business-hours?date=2024-01-27&duration=30
```

**Resposta:**

```json
{
  "date": "2024-01-27",
  "is_open": true,
  "business_hours": {
    "open": "09:00",
    "close": "18:00"
  },
  "available_slots": [
    { "start": "09:00", "end": "09:30" },
    { "start": "09:30", "end": "10:00" },
    ...
  ],
  "duration_minutes": 30
}
```

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas

1. **business_hours** - Horários de funcionamento por dia da semana
2. **business_breaks** - Intervalos (almoço, pausas)
3. **business_holidays** - Feriados e fechamentos
4. **business_blocked_slots** - Bloqueios pontuais

## 🔧 Dependências Necessárias

Certifique-se de ter instalado:

```json
{
  "@tanstack/react-query": "^5.x",
  "@supabase/supabase-js": "^2.x",
  "lucide-react": "^0.x",
  "date-fns": "^3.x"
}
```

## 📝 Notas Importantes

- ✅ Todos os componentes usam shadcn/ui
- ✅ Sistema completo com validações
- ✅ Suporte a feriados recorrentes
- ✅ API pronta para integração com N8N
- ✅ RLS (Row Level Security) configurado
- ✅ TypeScript com tipos completos

## 🎯 Funcionalidades

- ✅ Configurar horários de abertura/fechamento por dia
- ✅ Definir intervalos (almoço, pausas)
- ✅ Cadastrar feriados (únicos ou recorrentes)
- ✅ Bloquear horários específicos
- ✅ API para consultar slots disponíveis
- ✅ Validação automática de disponibilidade

## 📞 Suporte

Este pacote foi extraído do sistema AgendeAI e está pronto para uso em qualquer CRM baseado em Next.js + Supabase.
