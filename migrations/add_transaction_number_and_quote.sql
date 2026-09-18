-- Migration: Add transaction_number and quote_id to transactions table
-- Description: Adds auto-generated transaction numbers and project references

-- Step 1: Add columns
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS transaction_number VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS quote_id INTEGER REFERENCES quotes(id) ON DELETE SET NULL;

-- Step 2: Create sequence for auto-incrementing transaction numbers
CREATE SEQUENCE IF NOT EXISTS transaction_number_seq START 1;

-- Step 3: Create function to auto-generate transaction number
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_number IS NULL THEN
        NEW.transaction_number := 'TRX-' || LPAD(nextval('transaction_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to call function on INSERT
DROP TRIGGER IF EXISTS set_transaction_number ON transactions;
CREATE TRIGGER set_transaction_number
BEFORE INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION generate_transaction_number();

-- Step 5: Generate numbers for existing transactions (optional, can skip if you want)
DO $$
DECLARE
    rec RECORD;
    counter INTEGER := 1;
BEGIN
    FOR rec IN SELECT id FROM transactions WHERE transaction_number IS NULL ORDER BY created_at, id LOOP
        UPDATE transactions 
        SET transaction_number = 'TRX-' || LPAD(counter::TEXT, 6, '0')
        WHERE id = rec.id;
        counter := counter + 1;
    END LOOP;
    
    -- Update sequence to start after existing records
    PERFORM setval('transaction_number_seq', counter);
END $$;

-- Step 6: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_quote_id ON transactions(quote_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_number ON transactions(transaction_number);

-- Verify changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND column_name IN ('transaction_number', 'quote_id')
ORDER BY column_name;
