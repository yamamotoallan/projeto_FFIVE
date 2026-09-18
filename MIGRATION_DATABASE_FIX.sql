-- ==================================================================
-- MIGRAÇÃO COMPLETA - CORREÇÃO DE TABELAS PARA UPLOAD DE ARQUIVOS
-- Execute TODO este arquivo no Neon.tech SQL Editor
-- ==================================================================

BEGIN;

-- 1. Adicionar colunas faltantes na tabela QUOTES
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS project_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS service_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Adicionar colunas faltantes na tabela QUOTE_FILES
ALTER TABLE quote_files 
ADD COLUMN IF NOT EXISTS mimetype VARCHAR(100),
ADD COLUMN IF NOT EXISTS size INTEGER,
ADD COLUMN IF NOT EXISTS gcs_path TEXT,
ADD COLUMN IF NOT EXISTS uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS uploaded_by_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

COMMIT;

-- ==================================================================
-- VERIFICAÇÃO - Deve mostrar todas as colunas criadas
-- ==================================================================

SELECT 'QUOTES TABLE:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
ORDER BY ordinal_position;

SELECT 'QUOTE_FILES TABLE:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quote_files' 
ORDER BY ordinal_position;
