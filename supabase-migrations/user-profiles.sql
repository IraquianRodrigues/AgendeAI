-- ============================================
-- USER PROFILES - Sistema de Roles Multi-Usuário
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'recepcionista' CHECK (role IN ('admin', 'recepcionista', 'dentista')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índice
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 3. Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acesso (SIMPLIFICADAS - SEM RECURSÃO)
-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Permitir INSERT para novos usuários (trigger cria automaticamente)
CREATE POLICY "Enable insert for authenticated users"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Trigger para criar perfil automaticamente quando novo usuário se registra
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

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- ============================================
-- CRIAR PERFIL PARA USUÁRIOS EXISTENTES
-- ============================================
-- Se você já tem usuários no sistema, execute isso para criar perfis para eles:

INSERT INTO user_profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  'admin' -- Primeiro usuário será admin, ajuste depois se necessário
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ATUALIZAR ROLE DE UM USUÁRIO ESPECÍFICO
-- ============================================
-- Para tornar seu usuário atual admin, execute:
-- (Substitua 'seu-email@exemplo.com' pelo seu email)

-- UPDATE user_profiles
-- SET role = 'admin'
-- WHERE email = 'seu-email@exemplo.com';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Ver todos os perfis:
SELECT * FROM user_profiles;

-- Ver apenas admins:
SELECT * FROM user_profiles WHERE role = 'admin';
