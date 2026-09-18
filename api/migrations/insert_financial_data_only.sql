-- ================================================
-- FINANCIAL MODULE - DATA INSERTION ONLY
-- ================================================
-- Este arquivo APENAS insere dados nas tabelas existentes
-- Use este se as tabelas já foram criadas

-- ================================================
-- LIMPAR DADOS EXISTENTES (opcional)
-- ================================================
-- Descomente as linhas abaixo se quiser limpar dados antigos primeiro
-- TRUNCATE TABLE installments CASCADE;
-- TRUNCATE TABLE transactions CASCADE;
-- TRUNCATE TABLE bills CASCADE;
-- TRUNCATE TABLE bank_accounts CASCADE;
-- TRUNCATE TABLE financial_categories CASCADE;
-- TRUNCATE TABLE suppliers CASCADE;

-- ================================================
-- 1. CATEGORIAS FINANCEIRAS
-- ================================================
INSERT INTO financial_categories (name, type, description, icon, color, is_active) 
VALUES
-- RECEITAS
('Vendas de Projetos', 'income', 'Receita de projetos de marcenaria', 'payments', 'green', true),
('Serviços Extras', 'income', 'Serviços adicionais cobrados', 'build', 'emerald', true),
('Entradas de Sinal', 'income', 'Sinais recebidos de clientes', 'attach_money', 'teal', true),

-- DESPESAS
('Materiais (MDF/Madeira)', 'expense', 'Compra de chapas e madeiras', 'inventory_2', 'orange', true),
('Ferragens', 'expense', 'Dobradiças, corrediças, puxadores', 'construction', 'amber', true),
('Mão de Obra', 'expense', 'Pagamento de colaboradores', 'group', 'red', true),
('Aluguel', 'expense', 'Aluguel da marcenaria/oficina', 'home', 'purple', true),
('Energia Elétrica', 'expense', 'Conta de luz', 'bolt', 'yellow', true),
('Água', 'expense', 'Conta de água', 'water_drop', 'blue', true),
('Internet/Telefone', 'expense', 'Telecomunicações', 'phone', 'indigo', true),
('Manutenção de Máquinas', 'expense', 'Reparos e manutenção', 'handyman', 'rose', true),
('Combustível/Frete', 'expense', 'Transporte e entregas', 'local_shipping', 'slate', true),
('Impostos', 'expense', 'Tributos e taxas', 'receipt_long', 'gray', true),
('Outros', 'expense', 'Despesas diversas', 'more_horiz', 'neutral', true)
ON CONFLICT (name, type) DO NOTHING;

RAISE NOTICE '✅ Categorias: 14 inseridas (3 receitas + 11 despesas)';

-- ================================================
-- 2. CONTAS BANCÁRIAS
-- ================================================
INSERT INTO bank_accounts (name, bank, account_type, current_balance, is_active)
VALUES
('Caixa', 'Dinheiro em Espécie', 'cash', 0.00, true),
('Conta Corrente', 'Banco Principal', 'checking', 0.00, true)
ON CONFLICT (name) DO NOTHING;

RAISE NOTICE '✅ Contas: 2 inseridas (Caixa + Conta Corrente)';

-- ================================================
-- FIM DA INSERÇÃO
-- ================================================
RAISE NOTICE '✅ Módulo Financeiro populado com sucesso!';
RAISE NOTICE '📊 Total inserido: 14 categorias + 2 contas bancárias';
