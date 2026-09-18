-- ============================================
-- FINANCIAL MODULE - PHASE 3: ACCOUNTS PAYABLE
-- ============================================
-- Creates suppliers table and bills/payables tracking system

-- Suppliers/Vendors Table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    trade_name VARCHAR(200),
    document_number VARCHAR(20), -- CPF/CNPJ
    contact_name VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bills/Payables Table
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    supplier_id INT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    category_id INT REFERENCES financial_categories(id) ON DELETE SET NULL,
    
    -- Bill Details
    bill_number VARCHAR(50),
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    
    -- Payment Details
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'overdue', 'paid', 'cancelled')),
    paid_date DATE,
    paid_amount DECIMAL(12,2),
    transaction_id INT REFERENCES transactions(id) ON DELETE SET NULL,
    
    -- Additional Info
    payment_method VARCHAR(50),
    document_type VARCHAR(20), -- 'nota_fiscal', 'recibo', 'boleto', etc
    attachments JSONB, -- Array of file URLs
    tags TEXT[], -- For categorization
    notes TEXT,
    
    -- Audit
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_paid_details CHECK (
        (status = 'paid' AND paid_date IS NOT NULL AND paid_amount IS NOT NULL AND transaction_id IS NOT NULL)
        OR (status != 'paid')
    )
);

-- Recurring Bills Template (for automatic bill generation)
CREATE TABLE IF NOT EXISTS recurring_bills (
    id SERIAL PRIMARY KEY,
    supplier_id INT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    category_id INT REFERENCES financial_categories(id) ON DELETE SET NULL,
    
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    
    -- Recurrence Settings
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE, -- NULL = indefinite
    day_of_month INT CHECK (day_of_month BETWEEN 1 AND 31),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_generated_date DATE,
    
    -- Audit
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_document ON suppliers(document_number);
CREATE INDEX IF NOT EXISTS idx_bills_supplier ON bills(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_category ON bills(category_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_active ON recurring_bills(is_active);

-- Trigger: Update timestamp on update
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_suppliers_timestamp
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_bills_timestamp
    BEFORE UPDATE ON bills
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_recurring_bills_timestamp
    BEFORE UPDATE ON recurring_bills
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Function: Auto-update overdue bills status
CREATE OR REPLACE FUNCTION update_overdue_bills()
RETURNS void AS $$
BEGIN
    UPDATE bills
    SET status = 'overdue'
    WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Seed Data: Sample Suppliers
INSERT INTO suppliers (name, trade_name, document_number, contact_name, email, phone, city, state) VALUES
('Madeireira São Paulo Ltda', 'Madeireira SP', '12.345.678/0001-90', 'João Silva', 'contato@madeirasp.com.br', '(11) 98765-4321', 'São Paulo', 'SP'),
('Ferragens e Ferramentas Total', 'Ferragens Total', '98.765.432/0001-10', 'Maria Santos', 'vendas@ferragenstotal.com.br', '(11) 97654-3210', 'Guarulhos', 'SP'),
('Tintas e Vernizes Premium', 'Tintas Premium', '11.222.333/0001-44', 'Carlos Costa', 'comercial@tintaspremium.com.br', '(11) 96543-2109', 'São Paulo', 'SP'),
('Distribuidora de MDF Nacional', 'MDF Nacional', '22.333.444/0001-55', 'Ana Oliveira', 'pedidos@mdfnacional.com.br', '(11) 95432-1098', 'Osasco', 'SP'),
('Parafusos e Acessórios Fixação', 'Fixação Ltda', '33.444.555/0001-66', 'Pedro Almeida', 'atendimento@fixacao.com.br', '(11) 94321-0987', 'Barueri', 'SP')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE suppliers IS 'Cadastro de fornecedores e prestadores de serviço';
COMMENT ON TABLE bills IS 'Contas a pagar (fornecedores)';
COMMENT ON TABLE recurring_bills IS 'Templates para geração automática de contas recorrentes';
