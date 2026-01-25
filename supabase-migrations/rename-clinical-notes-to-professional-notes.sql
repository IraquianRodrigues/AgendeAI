-- Migration: Rename clinical_notes to professional_notes
-- Created: 2026-01-25
-- Description: Updates terminology from clinical to professional/business context

-- IMPORTANTE: Execute este script SOMENTE se a tabela medical_records já existir
-- Se você ainda não criou a tabela, execute primeiro: medical-records.sql

-- Verificar se a tabela existe e se a coluna clinical_notes existe
DO $$ 
BEGIN
    -- Verificar se a tabela existe
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'medical_records'
    ) THEN
        -- Verificar se a coluna clinical_notes existe
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'medical_records' 
            AND column_name = 'clinical_notes'
        ) THEN
            -- Renomear a coluna
            ALTER TABLE medical_records 
            RENAME COLUMN clinical_notes TO professional_notes;
            
            -- Atualizar comentário
            COMMENT ON COLUMN medical_records.professional_notes IS 'Notas profissionais sobre o atendimento';
            
            RAISE NOTICE 'Coluna clinical_notes renomeada para professional_notes com sucesso!';
        ELSE
            RAISE NOTICE 'A coluna clinical_notes não existe. Possivelmente já foi renomeada ou a tabela foi criada com o novo nome.';
        END IF;
    ELSE
        RAISE WARNING 'A tabela medical_records não existe! Execute primeiro a migração medical-records.sql';
    END IF;
END $$;
