# 📋 GUIA DE CÓPIA - Passo a Passo

## 🎯 Como Copiar os Arquivos

### Opção 1: Copiar Manualmente (Recomendado)

Copie os arquivos da pasta `business-hours-package` para o seu novo projeto seguindo esta estrutura:

```
📁 business-hours-package/          →    📁 seu-novo-projeto/
│
├── 📁 SQL/                          →    (Execute no Supabase SQL Editor)
│   ├── 01-create-tables.sql        →    ⚡ Executar no Supabase
│   ├── 02-create-policies.sql      →    ⚡ Executar no Supabase
│   ├── 03-seed-data.sql            →    ⚡ Executar no Supabase
│   └── 04-debug-queries.sql        →    📝 Guardar para debug
│
├── 📁 Components/                   →    📁 src/components/
│   ├── business-hours-settings.tsx →    src/components/
│   ├── weekly-schedule-editor.tsx  →    src/components/
│   ├── breaks-manager.tsx          →    src/components/
│   ├── holidays-manager.tsx        →    src/components/
│   └── blocked-slots-manager.tsx   →    src/components/
│
├── 📁 Services/                     →    📁 src/services/business-hours/
│   ├── business-hours.service.ts   →    src/services/business-hours/
│   ├── use-business-hours.ts       →    src/services/business-hours/
│   └── index.ts                    →    src/services/business-hours/
│
├── 📁 API/                          →    📁 src/app/api/business-hours/
│   └── route.ts                    →    src/app/api/business-hours/route.ts
│
├── 📁 Types/                        →    📁 src/types/
│   └── database.types.ts           →    ⚠️ ADICIONAR ao seu database.types.ts
│
└── 📁 Page/                         →    📁 src/app/dashboard/configuracoes/
    └── page.tsx                    →    src/app/dashboard/configuracoes/page.tsx
```

---

## ✅ Passo a Passo Detalhado

### 1️⃣ Executar SQL no Supabase (PRIMEIRO!)

1. Abra o Supabase Dashboard do seu novo projeto
2. Vá em **SQL Editor**
3. Execute os scripts **NA ORDEM**:
   - ✅ `01-create-tables.sql`
   - ✅ `02-create-policies.sql`
   - ✅ `03-seed-data.sql` (opcional, mas recomendado)

### 2️⃣ Copiar Componentes

```bash
# Copie TODOS os 5 arquivos .tsx da pasta Components/
# Para: seu-novo-projeto/src/components/
```

**Arquivos:**

- `business-hours-settings.tsx`
- `weekly-schedule-editor.tsx`
- `breaks-manager.tsx`
- `holidays-manager.tsx`
- `blocked-slots-manager.tsx`

### 3️⃣ Copiar Services

```bash
# Crie a pasta: src/services/business-hours/
# Copie os 3 arquivos da pasta Services/
```

**Arquivos:**

- `business-hours.service.ts`
- `use-business-hours.ts`
- `index.ts`

### 4️⃣ Copiar API

```bash
# Crie a pasta: src/app/api/business-hours/
# Copie o arquivo route.ts
```

### 5️⃣ Copiar Page

```bash
# Crie a pasta: src/app/dashboard/configuracoes/
# Copie o arquivo page.tsx
```

### 6️⃣ Adicionar Types

⚠️ **IMPORTANTE:** Não substitua seu arquivo `database.types.ts`!

**Abra** o arquivo `Types/database.types.ts` do pacote e **COPIE** apenas as definições das 4 tabelas:

- `business_hours`
- `business_breaks`
- `business_holidays`
- `business_blocked_slots`

**Cole** dentro do seu `src/types/database.types.ts` existente.

---

## 🔧 Opção 2: Script PowerShell (Automático)

Salve este script como `copiar-business-hours.ps1`:

```powershell
# Defina o caminho do seu novo projeto
$destino = "C:\caminho\do\seu\novo-projeto"

# Copiar Components
Copy-Item ".\Components\*.tsx" "$destino\src\components\" -Force

# Copiar Services
New-Item -ItemType Directory -Path "$destino\src\services\business-hours" -Force
Copy-Item ".\Services\*" "$destino\src\services\business-hours\" -Force

# Copiar API
New-Item -ItemType Directory -Path "$destino\src\app\api\business-hours" -Force
Copy-Item ".\API\route.ts" "$destino\src\app\api\business-hours\" -Force

# Copiar Page
New-Item -ItemType Directory -Path "$destino\src\app\dashboard\configuracoes" -Force
Copy-Item ".\Page\page.tsx" "$destino\src\app\dashboard\configuracoes\" -Force

Write-Host "✅ Arquivos copiados com sucesso!"
Write-Host "⚠️ Não esqueça de:"
Write-Host "  1. Executar os SQL scripts no Supabase"
Write-Host "  2. Adicionar os types ao database.types.ts"
Write-Host "  3. Adicionar a rota no menu"
```

Execute:

```bash
cd c:\Users\iraquian\agendeai\business-hours-package
.\copiar-business-hours.ps1
```

---

## ⚠️ IMPORTANTE - Não Esqueça!

Após copiar os arquivos:

1. ✅ **Adicionar a rota no menu/sidebar:**

   ```tsx
   {
     title: "Configurações",
     url: "/dashboard/configuracoes",
     icon: Settings,
   }
   ```

2. ✅ **Verificar dependências no package.json:**

   ```json
   {
     "@tanstack/react-query": "^5.x",
     "@supabase/supabase-js": "^2.x",
     "lucide-react": "^0.x",
     "date-fns": "^3.x"
   }
   ```

3. ✅ **Testar a página:**
   ```
   http://localhost:3000/dashboard/configuracoes
   ```

---

## 📝 Resumo

**SIM**, você copia os arquivos da pasta `business-hours-package`, mas:

- ❌ **NÃO** copie a pasta inteira
- ✅ **SIM** copie cada arquivo para o local correto do seu projeto
- ⚡ **PRIMEIRO** execute os SQL scripts no Supabase
- ⚠️ **CUIDADO** com o database.types.ts (adicione, não substitua)

---

**Dúvidas?** Consulte o `README.md` ou `INSTALACAO-RAPIDA.md` no pacote!
