-- Financial Module - Phase 1 Database Schema
-- Created: 2026-01-30
-- Description: Tables for cash flow management, transactions, and basic financial tracking

-- ============================================
-- FINANCIAL CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS financial_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('revenue', 'expense')),
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Default categories
INSERT INTO financial_categories (name, type, description, icon, color) VALUES
-- Revenue categories
('Vendas de Projetos', 'revenue', 'Receita de projetos de marcenaria', 'payments', 'green'),
('Serviços Extras', 'revenue', 'Serviços adicionais cobrados', 'build', 'emerald'),
('Entradas de Sinal', 'revenue', 'Sinais recebidos de clientes', 'attach_money', 'teal'),

-- Expense categories
('Materiais (MDF/Madeira)', 'expense', 'Compra de chapas e madeiras', 'inventory_2', 'orange'),
('Ferragens', 'expense', 'Dobradiças, corrediças, puxadores', 'construction', 'amber'),
('Mão de Obra', 'expense', 'Pagamento de colaboradores', 'group', 'red'),
('Aluguel', 'expense', 'Aluguel da marcenaria/oficina', 'home', 'purple'),
('Energia Elétrica', 'expense', 'Conta de luz', 'bolt', 'yellow'),
('Água', 'expense', 'Conta de água', 'water_drop', 'blue'),
('Internet/Telefone', 'expense', 'Telecomunicações', 'phone', 'indigo'),
('Manutenção de Máquinas', 'expense', 'Reparos e manutenção', 'handyman', 'rose'),
('Combustível/Frete', 'expense', 'Transporte e entregas', 'local_shipping', 'slate'),
('Impostos', 'expense', 'Tributos e taxas', 'receipt_long', 'gray'),
('Outros', 'expense', 'Despesas diversas', 'more_horiz', 'neutral')
ON CONFLICT DO NOTHING;

-- ============================================
-- BANK ACCOUNTS
-- ============================================
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bank VARCHAR(100),
    account_type VARCHAR(50) CHECK (account_type IN ('checking', 'savings', 'cash', 'other')),
    account_number VARCHAR(50),
    agency VARCHAR(20),
    initial_balance DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Default cash account
INSERT INTO bank_accounts (name, account_type, initial_balance, current_balance, notes) VALUES
('Caixa Principal', 'cash', 0, 0, 'Dinheiro físico disponível')
ON CONFLICT DO NOTHING;

-- ============================================
-- TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    category_id INT REFERENCES financial_categories(id) ON DELETE SET NULL,
    bank_account_id INT NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    
    -- Reference to source entity (quote, project, manual)
    reference_type VARCHAR(50),
    reference_id INT,
    
    -- Payment details
    payment_method VARCHAR(50),
    document_number VARCHAR(100), -- Invoice number, receipt, etc.
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    
    -- Transfer fields (only for type='transfer')
    destination_account_id INT REFERENCES bank_accounts(id) ON DELETE SET NULL,
    
    -- Audit
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT valid_transfer CHECK (
        (type = 'transfer' AND destination_account_id IS NOT NULL) OR
        (type != 'transfer' AND destination_account_id IS NULL)
    )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bank_account ON transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- ============================================
-- INSTALLMENTS (for receivables tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS installments (
    id SERIAL PRIMARY KEY,
    quote_id INT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    
    -- Link to transaction when paid
    transaction_id INT REFERENCES transactions(id) ON DELETE SET NULL,
    paid_date DATE,
    paid_amount DECIMAL(12,2),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(quote_id, installment_number)
);

CREATE INDEX IF NOT EXISTS idx_installments_quote ON installments(quote_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);

-- ============================================
-- TRIGGERS for balance updates
-- ============================================

-- Function to update bank account balance
CREATE OR REPLACE FUNCTION update_bank_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- On INSERT or UPDATE of completed transaction
    IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed')) THEN
        IF NEW.type = 'income' THEN
            UPDATE bank_accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.bank_account_id;
        ELSIF NEW.type = 'expense' THEN
            UPDATE bank_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.bank_account_id;
        ELSIF NEW.type = 'transfer' THEN
            UPDATE bank_accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.bank_account_id;
            UPDATE bank_accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.destination_account_id;
        END IF;
    END IF;
    
    -- On DELETE of completed transaction (reverse)
    IF TG_OP = 'DELETE' AND OLD.status = 'completed' THEN
        IF OLD.type = 'income' THEN
            UPDATE bank_accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.bank_account_id;
        ELSIF OLD.type = 'expense' THEN
            UPDATE bank_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.bank_account_id;
        ELSIF OLD.type = 'transfer' THEN
            UPDATE bank_accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.bank_account_id;
            UPDATE bank_accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.destination_account_id;
        END IF;
    END IF;
    
    -- Update timestamp
    IF TG_OP != 'DELETE' THEN
        UPDATE bank_accounts SET updated_at = NOW() WHERE id = NEW.bank_account_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bank_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_bank_balance();

-- Function to update installment status (overdue check)
CREATE OR REPLACE FUNCTION check_overdue_installments()
RETURNS void AS $$
BEGIN
    UPDATE installments
    SET status = 'overdue'
    WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Financial Module Phase 1 schema created successfully!';
END $$;
