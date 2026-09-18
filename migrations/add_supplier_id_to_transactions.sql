-- Add supplier_id to transactions table
ALTER TABLE transactions 
ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id);

-- Create index for better performance
CREATE INDEX idx_transactions_supplier_id ON transactions(supplier_id);
