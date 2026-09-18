-- Migration: Create bank_movements table
-- Description: Adds table for tracking bank transfers and adjustments

CREATE TABLE IF NOT EXISTS bank_movements (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(20) NOT NULL CHECK (type IN ('transfer', 'adjustment_in', 'adjustment_out', 'initial_balance')),
    amount DECIMAL(15, 2) NOT NULL,
    origin_account_id INTEGER REFERENCES bank_accounts(id),
    destination_account_id INTEGER REFERENCES bank_accounts(id),
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Validação: Transferências exigem origem e destino
    CONSTRAINT check_transfer_accounts CHECK (
        (type = 'transfer' AND origin_account_id IS NOT NULL AND destination_account_id IS NOT NULL) OR
        (type <> 'transfer')
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bank_movements_date ON bank_movements(date);
CREATE INDEX IF NOT EXISTS idx_bank_movements_origin ON bank_movements(origin_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_movements_destination ON bank_movements(destination_account_id);
