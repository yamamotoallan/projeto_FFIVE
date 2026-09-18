-- Adicionar colunas faltantes na tabela quotes
-- Execute no Google Cloud SQL Query Editor

-- 1. Adicionar coluna project_type
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS project_type VARCHAR(100);

-- 2. Adicionar coluna service_type  
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS service_type VARCHAR(100);

-- 3. Adicionar coluna phone
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- 4. Adicionar coluna notes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. Verificar colunas criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
ORDER BY ordinal_position;
