-- ================================================
-- TESTE COM DIFERENTES VALORES DE 'TYPE'
-- ================================================
-- Execute linha por linha até descobrir qual funciona

-- TESTE 1: revenue/expense (inglês alternativo)
INSERT INTO financial_categories (name, type, description, is_active) 
VALUES ('TESTE 1', 'revenue', 'Teste revenue', true);

-- Se TESTE 1 deu erro, comente-o e tente TESTE 2:
-- INSERT INTO financial_categories (name, type, description, is_active) 
-- VALUES ('TESTE 2', 'receita', 'Teste receita', true);

-- Se TESTE 2 deu erro, tente TESTE 3:
-- INSERT INTO financial_categories (name, type, description, is_active) 
-- VALUES ('TESTE 3', 'INCOME', 'Teste INCOME maiúsculo', true);

-- Depois de encontrar qual funciona, delete os testes:
-- DELETE FROM financial_categories WHERE name LIKE 'TESTE%';
