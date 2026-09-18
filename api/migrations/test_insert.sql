-- ================================================
-- INSERÇÃO TESTE - 1 CATEGORIA POR VEZ
-- ================================================
-- Testa diferentes valores de 'type' para descobrir qual funciona

-- TESTE 1: Tenta com 'revenue' (receita em inglês)
INSERT INTO financial_categories (name, type, description, is_active) 
VALUES ('TESTE Receita', 'revenue', 'Teste', true);

-- Se TESTE 1 funcionou, execute os DELETE abaixo e tente TESTE 2
-- DELETE FROM financial_categories WHERE name = 'TESTE Receita';

-- TESTE 2: Tenta com 'income'
-- INSERT INTO financial_categories (name, type, description, is_active) 
-- VALUES ('TESTE Despesa', 'income', 'Teste', true);
