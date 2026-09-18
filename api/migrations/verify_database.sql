-- ================================================
-- VERIFICAR DADOS NO BANCO
-- ================================================
-- Execute no Neon.tech SQL Editor

-- 1. Contar categorias
SELECT 'CATEGORIAS' as tabela, COUNT(*) as total FROM financial_categories
UNION ALL
SELECT 'CONTAS BANCÁRIAS', COUNT(*) FROM bank_accounts
UNION ALL
SELECT 'TRANSAÇÕES', COUNT(*) FROM transactions
UNION ALL  
SELECT 'PARCELAS', COUNT(*) FROM installments
UNION ALL
SELECT 'FORNECEDORES', COUNT(*) FROM suppliers
UNION ALL
SELECT 'CONTAS A PAGAR', COUNT(*) FROM bills;

-- 2. Ver categorias cadastradas
SELECT id, name, type FROM financial_categories ORDER BY type, name;

-- 3. Ver contas bancárias
SELECT id, name, account_type, current_balance FROM bank_accounts;

-- 4. Ver tipos de categorias únicos
SELECT DISTINCT type FROM financial_categories;
