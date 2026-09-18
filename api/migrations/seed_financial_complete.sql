-- ================================================
-- FINANCIAL MODULE - COMPLETE DATABASE SETUP
-- ================================================
-- Este arquivo cria TODAS as tabelas e popula com dados iniciais
-- Execute este arquivo COMPLETO no Neon.tech SQL Editor

-- ================================================
-- 1. CATEGORIAS FINANCEIRAS
-- ================================================
CREATE TABLE IF NOT EXISTS financial_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO financial_categories (name, type, description, icon, color) VALUES
-- RECEITAS
('Vendas de Projetos', 'income', 'Receita de projetos de marcenaria', 'payments', 'green'),
('Serviços Extras', 'income', 'Serviços adicionais cobrados', 'build', 'emerald'),
('Entradas de Sinal', 'income', 'Sinais recebidos de clientes', 'attach_money', 'teal'),

-- DESPESAS
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

-- ================================================
-- 2. CONTAS BANCÁRIAS
-- ================================================
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

-- Inserir conta padrão
INSERT INTO bank_accounts (name, account_type, initial_balance, current_balance, notes) VALUES
('Caixa Principal', 'cash', 0, 0, 'Dinheiro físico disponível'),
('Conta Corrente Empresa', 'checking', 0, 0, 'Conta bancária principal')
ON CONFLICT DO NOTHING;

-- ================================================
-- 3. TRANSAÇÕES
-- ================================================
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    category_id INT REFERENCES financial_categories(id) ON DELETE SET NULL,
    bank_account_id INT NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    
    -- Referência a entidades origem
    reference_type VARCHAR(50),
    reference_id INT,
    
    -- Detalhes de pagamento
    payment_method VARCHAR(50),
    document_number VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    
    -- Transferências
    destination_account_id INT REFERENCES bank_accounts(id) ON DELETE SET NULL,
    
    -- Auditoria
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_transfer CHECK (
        (type = 'transfer' AND destination_account_id IS NOT NULL) OR
        (type != 'transfer' AND destination_account_id IS NULL)
    )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bank_account ON transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- ================================================
-- 4. PARCELAS (INSTALLMENTS)
-- ================================================
CREATE TABLE IF NOT EXISTS installments (
    id SERIAL PRIMARY KEY,
    quote_id INT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    
    -- Link para transação quando pago
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

-- ================================================
-- 5. FORNECEDORES (SUPPLIERS)
-- ================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    business_name VARCHAR(200),
    cnpj_cpf VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- 6. CONTAS A PAGAR (BILLS)
-- ================================================
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    category_id INT REFERENCES financial_categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    issue_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    
    -- Link para transação quando pago
    transaction_id INT REFERENCES transactions(id) ON DELETE SET NULL,
    paid_date DATE,
    paid_amount DECIMAL(12,2),
    payment_method VARCHAR(50),
    
    document_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_supplier ON bills(supplier_id);

-- ================================================
-- 7. TRIGGERS - ATUALIZAÇÃO DE SALDO
-- ================================================
CREATE OR REPLACE FUNCTION update_bank_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- INSERT ou UPDATE para completed
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
    
    -- DELETE de transação completed (reverter)
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trigger_update_bank_balance ON transactions;
CREATE TRIGGER trigger_update_bank_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_bank_balance();

-- ================================================
-- SUCESSO!
-- ================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Módulo Financeiro configurado com sucesso!';
    RAISE NOTICE '📊 Categorias: 14 (3 receitas + 11 despesas)';
    RAISE NOTICE '🏦 Contas: 2 (Caixa + Conta Corrente)';
    RAISE NOTICE '📋 Tabelas: 6 (categories, accounts, transactions, installments, suppliers, bills)';
END $$;
