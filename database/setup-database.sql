-- ============================================
-- SETUP COMPLETO DO BANCO DE DADOS - AgendeAI
-- ============================================
-- Execute este script completo no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query > Cole e Execute
-- ============================================

-- ============================================
-- FASE 1: TABELAS BASE
-- ============================================

-- 1.1 Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'recepcionista' CHECK (role IN ('admin', 'recepcionista', 'dentista')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 1.2 Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  trava BOOLEAN DEFAULT false NOT NULL,
  notes TEXT,
  endereco TEXT,
  cidade TEXT,
  bairro TEXT,
  data_nascimento DATE
);

CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);

-- 1.3 Criar tabela de profissionais
CREATE TABLE IF NOT EXISTS professionals (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  specialty TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_professionals_code ON professionals(code);
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);

-- 1.4 Criar tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  code TEXT NOT NULL UNIQUE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price DECIMAL(10, 2)
);

CREATE INDEX IF NOT EXISTS idx_services_code ON services(code);

-- 1.5 Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  service_code INTEGER NOT NULL,
  professional_code INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_completed_at ON appointments(completed_at) WHERE completed_at IS NOT NULL;

-- 1.6 Criar tabela de associação profissional-serviço
CREATE TABLE IF NOT EXISTS professional_services (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  custom_duration_minutes INTEGER NOT NULL CHECK (custom_duration_minutes > 0),
  is_active BOOLEAN DEFAULT true NOT NULL,
  CONSTRAINT unique_professional_service UNIQUE (professional_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_professional_services_professional_id ON professional_services(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_services_service_id ON professional_services(service_id);
CREATE INDEX IF NOT EXISTS idx_professional_services_active ON professional_services(is_active) WHERE is_active = true;

-- 1.7 Criar tabela de horários dos profissionais
CREATE TABLE IF NOT EXISTS professional_schedules (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  professional_id BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  is_active BOOLEAN DEFAULT true NOT NULL,
  CONSTRAINT unique_professional_day_period UNIQUE (professional_id, day_of_week, start_time)
);

CREATE INDEX IF NOT EXISTS idx_professional_schedules_professional_id ON professional_schedules(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_schedules_day_of_week ON professional_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_professional_schedules_active ON professional_schedules(is_active) WHERE is_active = true;

-- ============================================
-- FASE 2: MÓDULO FINANCEIRO
-- ============================================

-- 2.1 Criar ENUM types
DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('receita', 'despesa');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('pendente', 'pago', 'cancelado', 'atrasado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto', 'transferencia');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_plan_status AS ENUM ('ativo', 'concluido', 'cancelado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2.2 Criar tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  appointment_id BIGINT REFERENCES appointments(id) ON DELETE SET NULL,
  professional_id BIGINT REFERENCES professionals(id) ON DELETE SET NULL,
  type transaction_type NOT NULL DEFAULT 'receita',
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method,
  status transaction_status NOT NULL DEFAULT 'pendente',
  due_date DATE NOT NULL,
  paid_date DATE,
  notes TEXT,
  mercadopago_payment_id TEXT,
  mercadopago_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_appointment_id ON transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_professional_id ON transactions(professional_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON transactions(due_date);

-- 2.3 Criar tabela de planos de pagamento
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  installments INTEGER NOT NULL,
  paid_installments INTEGER DEFAULT 0,
  status payment_plan_status NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_plans_client_id ON payment_plans(client_id);

-- 2.4 Criar tabela de parcelas
CREATE TABLE IF NOT EXISTS installments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status transaction_status NOT NULL DEFAULT 'pendente',
  payment_method payment_method,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_installments_payment_plan_id ON installments(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);

-- 2.5 Criar tabela de despesas
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method,
  due_date DATE NOT NULL,
  paid_date DATE,
  status transaction_status NOT NULL DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

-- ============================================
-- FASE 3: AUDITORIA
-- ============================================

-- 3.1 Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- FASE 4: FUNCTIONS E TRIGGERS
-- ============================================

-- 4.1 Function para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'recepcionista')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.2 Trigger para criar perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.3 Function para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.4 Triggers para updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_plans_updated_at ON payment_plans;
CREATE TRIGGER update_payment_plans_updated_at
  BEFORE UPDATE ON payment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_installments_updated_at ON installments;
CREATE TRIGGER update_installments_updated_at
  BEFORE UPDATE ON installments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FASE 5: ROW LEVEL SECURITY (RLS)
-- ============================================

-- 5.1 Habilitar RLS em todas as tabelas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 5.2 Políticas para user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
CREATE POLICY "Enable insert for authenticated users"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5.3 Políticas para tabelas gerais (acesso autenticado)
-- Clientes
DROP POLICY IF EXISTS "Authenticated users can view clientes" ON clientes;
CREATE POLICY "Authenticated users can view clientes"
  ON clientes FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert clientes" ON clientes;
CREATE POLICY "Authenticated users can insert clientes"
  ON clientes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update clientes" ON clientes;
CREATE POLICY "Authenticated users can update clientes"
  ON clientes FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete clientes" ON clientes;
CREATE POLICY "Authenticated users can delete clientes"
  ON clientes FOR DELETE
  USING (auth.role() = 'authenticated');

-- Professionals
DROP POLICY IF EXISTS "Authenticated users can view professionals" ON professionals;
CREATE POLICY "Authenticated users can view professionals"
  ON professionals FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert professionals" ON professionals;
CREATE POLICY "Authenticated users can insert professionals"
  ON professionals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update professionals" ON professionals;
CREATE POLICY "Authenticated users can update professionals"
  ON professionals FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete professionals" ON professionals;
CREATE POLICY "Authenticated users can delete professionals"
  ON professionals FOR DELETE
  USING (auth.role() = 'authenticated');

-- Services
DROP POLICY IF EXISTS "Authenticated users can view services" ON services;
CREATE POLICY "Authenticated users can view services"
  ON services FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert services" ON services;
CREATE POLICY "Authenticated users can insert services"
  ON services FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update services" ON services;
CREATE POLICY "Authenticated users can update services"
  ON services FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete services" ON services;
CREATE POLICY "Authenticated users can delete services"
  ON services FOR DELETE
  USING (auth.role() = 'authenticated');

-- Appointments
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON appointments;
CREATE POLICY "Authenticated users can view appointments"
  ON appointments FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert appointments" ON appointments;
CREATE POLICY "Authenticated users can insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
CREATE POLICY "Authenticated users can update appointments"
  ON appointments FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON appointments;
CREATE POLICY "Authenticated users can delete appointments"
  ON appointments FOR DELETE
  USING (auth.role() = 'authenticated');

-- Professional Services
DROP POLICY IF EXISTS "Authenticated users can view professional_services" ON professional_services;
CREATE POLICY "Authenticated users can view professional_services"
  ON professional_services FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert professional_services" ON professional_services;
CREATE POLICY "Authenticated users can insert professional_services"
  ON professional_services FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update professional_services" ON professional_services;
CREATE POLICY "Authenticated users can update professional_services"
  ON professional_services FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete professional_services" ON professional_services;
CREATE POLICY "Authenticated users can delete professional_services"
  ON professional_services FOR DELETE
  USING (auth.role() = 'authenticated');

-- Professional Schedules
DROP POLICY IF EXISTS "Authenticated users can view professional_schedules" ON professional_schedules;
CREATE POLICY "Authenticated users can view professional_schedules"
  ON professional_schedules FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert professional_schedules" ON professional_schedules;
CREATE POLICY "Authenticated users can insert professional_schedules"
  ON professional_schedules FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update professional_schedules" ON professional_schedules;
CREATE POLICY "Authenticated users can update professional_schedules"
  ON professional_schedules FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete professional_schedules" ON professional_schedules;
CREATE POLICY "Authenticated users can delete professional_schedules"
  ON professional_schedules FOR DELETE
  USING (auth.role() = 'authenticated');

-- Transactions
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON transactions;
CREATE POLICY "Authenticated users can view transactions"
  ON transactions FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON transactions;
CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update transactions" ON transactions;
CREATE POLICY "Authenticated users can update transactions"
  ON transactions FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete transactions" ON transactions;
CREATE POLICY "Authenticated users can delete transactions"
  ON transactions FOR DELETE
  USING (auth.role() = 'authenticated');

-- Payment Plans
DROP POLICY IF EXISTS "Authenticated users can view payment_plans" ON payment_plans;
CREATE POLICY "Authenticated users can view payment_plans"
  ON payment_plans FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert payment_plans" ON payment_plans;
CREATE POLICY "Authenticated users can insert payment_plans"
  ON payment_plans FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update payment_plans" ON payment_plans;
CREATE POLICY "Authenticated users can update payment_plans"
  ON payment_plans FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete payment_plans" ON payment_plans;
CREATE POLICY "Authenticated users can delete payment_plans"
  ON payment_plans FOR DELETE
  USING (auth.role() = 'authenticated');

-- Installments
DROP POLICY IF EXISTS "Authenticated users can view installments" ON installments;
CREATE POLICY "Authenticated users can view installments"
  ON installments FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert installments" ON installments;
CREATE POLICY "Authenticated users can insert installments"
  ON installments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update installments" ON installments;
CREATE POLICY "Authenticated users can update installments"
  ON installments FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete installments" ON installments;
CREATE POLICY "Authenticated users can delete installments"
  ON installments FOR DELETE
  USING (auth.role() = 'authenticated');

-- Expenses
DROP POLICY IF EXISTS "Authenticated users can view expenses" ON expenses;
CREATE POLICY "Authenticated users can view expenses"
  ON expenses FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert expenses" ON expenses;
CREATE POLICY "Authenticated users can insert expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update expenses" ON expenses;
CREATE POLICY "Authenticated users can update expenses"
  ON expenses FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete expenses" ON expenses;
CREATE POLICY "Authenticated users can delete expenses"
  ON expenses FOR DELETE
  USING (auth.role() = 'authenticated');

-- Audit Logs
DROP POLICY IF EXISTS "Authenticated users can view audit_logs" ON audit_logs;
CREATE POLICY "Authenticated users can view audit_logs"
  ON audit_logs FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert audit_logs" ON audit_logs;
CREATE POLICY "Authenticated users can insert audit_logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- FASE 6: CRIAR PERFIL PARA USUÁRIOS EXISTENTES
-- ============================================

INSERT INTO user_profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  'admin'
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Verificar se tudo foi criado corretamente:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;
-- ============================================
