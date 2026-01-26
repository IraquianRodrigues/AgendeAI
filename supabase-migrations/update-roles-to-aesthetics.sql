-- Migration: Update user roles from medical context to aesthetics context
-- This migration updates existing 'dentista' and 'medico' roles to 'profissional'

-- Update all dentista and medico roles to profissional
UPDATE user_profiles 
SET role = 'profissional' 
WHERE role IN ('dentista', 'medico');

-- Verify the update
-- SELECT role, COUNT(*) as count FROM user_profiles GROUP BY role;
