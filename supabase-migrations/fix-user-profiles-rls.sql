-- ============================================
-- FIX: Corrigir Recursão Infinita nas Políticas RLS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Remover políticas antigas que causam recursão
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;

-- 2. Criar políticas simples e seguras
-- Todos os usuários autenticados podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Todos os usuários autenticados podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Permitir INSERT para novos usuários (trigger cria automaticamente)
CREATE POLICY "Enable insert for authenticated users"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Testar se consegue buscar seu perfil:
SELECT * FROM user_profiles WHERE id = auth.uid();
