-- ================================================
-- VERIFICAR ESTRUTURA DAS TABELAS
-- ================================================
-- Execute este SQL primeiro para ver a estrutura

-- Ver estrutura de financial_categories
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'financial_categories'
ORDER BY ordinal_position;

-- Ver constraints
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'financial_categories'::regclass;
