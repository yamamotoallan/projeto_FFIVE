-- Fix quotes table to match API expectations
-- Execute this in Neon.tech SQL Editor

BEGIN;

-- Add missing columns to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS project_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS service_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS notes TEXT;

COMMIT;

-- Verify the changes
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'quotes' 
ORDER BY ordinal_position;
