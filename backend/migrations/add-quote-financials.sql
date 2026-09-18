-- Criar tabela para dados financeiros de orçamentos
-- Execute este SQL no Google Cloud SQL Query Editor

CREATE TABLE IF NOT EXISTS quote_financials (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL,
  installments INTEGER DEFAULT 1,
  down_payment DECIMAL(10,2) DEFAULT 0,
  first_installment_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para buscar por quote_id rapidamente
CREATE INDEX IF NOT EXISTS idx_quote_financials_quote_id ON quote_financials(quote_id);

-- Comentários para documentação
COMMENT ON TABLE quote_financials IS 'Dados financeiros vinculados a orçamentos aprovados';
COMMENT ON COLUMN quote_financials.payment_method IS 'Forma de pagamento: PIX, Boleto, Cartão, Transferência';
COMMENT ON COLUMN quote_financials.installments IS 'Número de parcelas (1-12)';
COMMENT ON COLUMN quote_financials.down_payment IS 'Valor da entrada';
COMMENT ON COLUMN quote_financials.first_installment_date IS 'Data da primeira parcela';
