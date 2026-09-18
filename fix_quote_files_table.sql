-- Fix quote_files table to match API expectations
-- Execute this in Neon.tech SQL Editor

BEGIN;

-- Add missing columns
ALTER TABLE quote_files 
ADD COLUMN IF NOT EXISTS mimetype VARCHAR(100),
ADD COLUMN IF NOT EXISTS size INTEGER,
ADD COLUMN IF NOT EXISTS gcs_path TEXT,
ADD COLUMN IF NOT EXISTS uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS uploaded_by_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

COMMIT;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quote_files' 
ORDER BY ordinal_position;
