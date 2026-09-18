-- ================================================
-- INSERÇÃO DE DADOS FINANCEIROS - SEM VERIFICAÇÕES
-- ================================================
-- Este SQL insere dados diretamente
-- Se der erro "duplicate key", os dados já existem (pode ignorar)

-- CATEGORIAS FINANCEIRAS (14 itens)
INSERT INTO financial_categories (name, type, description, icon, color, is_active) VALUES
('Vendas de Projetos', 'income', 'Receita de projetos de marcenaria', 'payments', 'green', true),
('Serviços Extras', 'income', 'Serviços adicionais cobrados', 'build', 'emerald', true),
('Entradas de Sinal', 'income', 'Sinais recebidos de clientes', 'attach_money', 'teal', true),
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
('Outros', 'expense', 'Despesas diversas', 'more_horiz', 'neutral', true);

-- CONTAS BANCÁRIAS (2 itens)
INSERT INTO bank_accounts (name, bank, account_type, current_balance, is_active) VALUES
('Caixa', 'Dinheiro em Espécie', 'cash', 0.00, true),
('Conta Corrente', 'Banco Principal', 'checking', 0.00, true);
