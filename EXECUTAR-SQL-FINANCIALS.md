# ⚠️ AÇÃO NECESSÁRIA: Criar Tabela no Banco

Antes de testar o modal financeiro, você precisa executar o SQL no Google Cloud SQL:

## 📍 Passo a Passo:

1. Acesse: https://console.cloud.google.com/sql
2. Clique na instância **marcenariapro**
3. Vá em **"Query"** ou **"Studio"** (menu lateral)
4. Cole o SQL abaixo:

``sql
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

CREATE INDEX IF NOT EXISTS idx_quote_financials_quote_id ON quote_financials(quote_id);
```

5. Clique **"RUN"**
6. ✅ Pronto!

## 📁 Arquivo Completo:
`backend/migrations/add-quote-financials.sql`

**Aguardarei você executar antes de continuar com o frontend!**
