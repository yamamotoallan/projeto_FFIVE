// Financial Module API - Phase 1
// Handles transactions, cash flow, categories, and bank accounts

import { query } from './db.js';

// ============================================
// CATEGORIES
// ============================================

export async function getCategories(type = null) {
    try {
        let queryStr = 'SELECT * FROM financial_categories WHERE is_active = true';
        const params = [];

        if (type) {
            params.push(type);
            queryStr += ` AND type = $1`;
        }

        queryStr += ' ORDER BY name ASC';

        const result = await query(queryStr, params);
        return result.rows;
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
    }
}

// ============================================
// BANK ACCOUNTS
// ============================================

export async function getBankAccounts() {
    try {
        const result = await query(`
            SELECT * FROM bank_accounts 
            WHERE is_active = true 
            ORDER BY name ASC
        `);
        return result.rows;
    } catch (error) {
        console.error('Erro ao buscar contas bancárias:', error);
        throw error;
    }
}

export async function createBankAccount(data) {
    try {
        const result = await query(`
            INSERT INTO bank_accounts (name, bank, account_type, account_number, agency, initial_balance, current_balance, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
            RETURNING *
        `, [data.name, data.bank, data.account_type, data.account_number, data.agency, data.initial_balance || 0, data.notes]);

        return result.rows[0];
    } catch (error) {
        console.error('Erro ao criar conta bancária:', error);
        throw error;
    }
}

// ============================================
// TRANSACTIONS
// ============================================

export async function createTransaction(data, userId) {
    try {
        const result = await query(`
            INSERT INTO transactions (
                type, category_id, bank_account_id, amount, date, description,
                reference_type, reference_id, payment_method, document_number,
                status, destination_account_id, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `, [
            data.type, data.category_id, data.bank_account_id, data.amount,
            data.date || new Date().toISOString().split('T')[0], data.description,
            data.reference_type, data.reference_id, data.payment_method, data.document_number,
            data.status || 'completed', data.destination_account_id, userId
        ]);

        return result.rows[0];
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        throw error;
    }
}

export async function getTransactions(filters = {}) {
    try {
        let queryStr = `
            SELECT 
                t.*,
                c.name as category_name,
                c.type as category_type,
                c.icon as category_icon,
                c.color as category_color,
                b.name as bank_account_name,
                db.name as destination_account_name,
                u.name as created_by_name
            FROM transactions t
            LEFT JOIN financial_categories c ON t.category_id = c.id
            LEFT JOIN bank_accounts b ON t.bank_account_id = b.id
            LEFT JOIN bank_accounts db ON t.destination_account_id = db.id
            LEFT JOIN users u ON t.created_by = u.id
            WHERE 1=1
        `;

        const params = [];
        let paramCount = 1;

        if (filters.type) {
            params.push(filters.type);
            queryStr += ` AND t.type = $${paramCount++}`;
        }

        if (filters.category_id) {
            params.push(filters.category_id);
            queryStr += ` AND t.category_id = $${paramCount++}`;
        }

        if (filters.bank_account_id) {
            params.push(filters.bank_account_id);
            queryStr += ` AND t.bank_account_id = $${paramCount++}`;
        }

        if (filters.date_from) {
            params.push(filters.date_from);
            queryStr += ` AND t.date >= $${paramCount++}`;
        }

        if (filters.date_to) {
            params.push(filters.date_to);
            queryStr += ` AND t.date <= $${paramCount++}`;
        }

        if (filters.status) {
            params.push(filters.status);
            queryStr += ` AND t.status = $${paramCount++}`;
        }

        queryStr += ' ORDER BY t.date DESC, t.created_at DESC LIMIT 500';

        const result = await query(queryStr, params);
        return result.rows;
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        throw error;
    }
}

export async function deleteTransaction(id) {
    try {
        await query('DELETE FROM transactions WHERE id = $1', [id]);
        return { success: true };
    } catch (error) {
        console.error('Erro ao deletar transação:', error);
        throw error;
    }
}

// ============================================
// CASH FLOW & ANALYTICS
// ============================================

export async function getCashFlow(dateFrom, dateTo) {
    try {
        const result = await query(`
            SELECT 
                date,
                SUM(CASE WHEN type = 'income' AND status = 'completed' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' AND status = 'completed' THEN amount ELSE 0 END) as expense,
                SUM(CASE 
                    WHEN type = 'income' AND status = 'completed' THEN amount 
                    WHEN type = 'expense' AND status = 'completed' THEN -amount 
                    ELSE 0 
                END) as balance
            FROM transactions
            WHERE date >= $1 AND date <= $2
            GROUP BY date
            ORDER BY date ASC
        `, [dateFrom, dateTo]);

        return result.rows;
    } catch (error) {
        console.error('Erro ao calcular fluxo de caixa:', error);
        throw error;
    }
}

export async function getFinancialSummary(dateFrom, dateTo) {
    try {
        // Overall summary
        const summaryResult = await query(`
            SELECT 
                SUM(CASE WHEN type = 'income' AND status = 'completed' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' AND status = 'completed' THEN amount ELSE 0 END) as total_expense,
                SUM(CASE 
                    WHEN type = 'income' AND status = 'completed' THEN amount 
                    WHEN type = 'expense' AND status = 'completed' THEN -amount 
                    ELSE 0 
                END) as net_balance
            FROM transactions
            WHERE date >= $1 AND date <= $2
        `, [dateFrom, dateTo]);

        // Category breakdown
        const categoryResult = await query(`
            SELECT 
                c.name,
                c.type,
                c.icon,
                c.color,
                SUM(t.amount) as total,
                COUNT(*) as count
            FROM transactions t
            JOIN financial_categories c ON t.category_id = c.id
            WHERE t.date >= $1 AND t.date <= $2 AND t.status = 'completed'
            GROUP BY c.id, c.name, c.type, c.icon, c.color
            ORDER BY total DESC
        `, [dateFrom, dateTo]);

        // Bank balances
        const banksResult = await query(`
            SELECT id, name, current_balance, account_type
            FROM bank_accounts
            WHERE is_active = true
            ORDER BY name ASC
        `);

        return {
            summary: summaryResult.rows[0],
            by_category: categoryResult.rows,
            bank_balances: banksResult.rows
        };
    } catch (error) {
        console.error('Erro ao gerar resumo financeiro:', error);
        throw error;
    }
}

// ============================================
// INSTALLMENTS (Receivables)
// ============================================

export async function createInstallments(quoteId, installmentData) {
    try {
        const { installments, down_payment, first_installment_date } = installmentData;

        // Get quote value
        const quoteResult = await query('SELECT value FROM quotes WHERE id = $1', [quoteId]);
        if (quoteResult.rows.length === 0) throw new Error('Quote not found');

        const totalValue = parseFloat(quoteResult.rows[0].value);
        const remainingValue = totalValue - (down_payment || 0);
        const installmentValue = remainingValue / installments;

        // Create installments
        const installmentRecords = [];
        const firstDate = new Date(first_installment_date || Date.now());

        for (let i = 1; i <= installments; i++) {
            const dueDate = new Date(firstDate);
            dueDate.setMonth(dueDate.getMonth() + (i - 1));

            const result = await query(`
                INSERT INTO installments (quote_id, installment_number, due_date, amount, status)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [quoteId, i, dueDate.toISOString().split('T')[0], installmentValue, 'pending']);

            installmentRecords.push(result.rows[0]);
        }

        return installmentRecords;
    } catch (error) {
        console.error('Erro ao criar parcelas:', error);
        throw error;
    }
}

export async function getInstallments(quoteId) {
    try {
        const result = await query(`
            SELECT i.*, t.date as paid_date, t.amount as paid_amount
            FROM installments i
            LEFT JOIN transactions t ON i.transaction_id = t.id
            WHERE i.quote_id = $1
            ORDER BY i.installment_number ASC
        `, [quoteId]);

        return result.rows;
    } catch (error) {
        console.error('Erro ao buscar parcelas:', error);
        throw error;
    }
}

export async function markInstallmentAsPaid(installmentId, transactionData, userId) {
    try {
        // Create transaction
        const transaction = await createTransaction({
            ...transactionData,
            type: 'income',
            reference_type: 'installment',
            reference_id: installmentId
        }, userId);

        // Update installment
        await query(`
            UPDATE installments 
            SET status = 'paid', transaction_id = $1, paid_date = $2, paid_amount = $3
            WHERE id = $4
        `, [transaction.id, transaction.date, transaction.amount, installmentId]);

        return transaction;
    } catch (error) {
        console.error('Erro ao marcar parcela como paga:', error);
        throw error;
    }
}

// ============================================
// RECEIVABLES (Phase 2)
// ============================================

export async function getReceivables() {
    try {
        // Update overdue statuses first
        await query(`
            UPDATE installments
            SET status = 'overdue'
            WHERE status = 'pending'
            AND due_date < CURRENT_DATE
        `);

        // Get all installments with quote and client details
        const installmentsResult = await query(`
            SELECT 
                i.*,
                q.client as client_name,
                q.description as quote_description
            FROM installments i
            JOIN quotes q ON i.quote_id = q.id
            ORDER BY 
                CASE i.status
                    WHEN 'overdue' THEN 1
                    WHEN 'pending' THEN 2
                    WHEN 'paid' THEN 3
                    ELSE 4
                END,
                i.due_date ASC
        `);

        // Calculate summary
        const summaryResult = await query(`
            SELECT 
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
                SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as total_overdue,
                SUM(CASE WHEN status = 'paid' THEN paid_amount ELSE 0 END) as total_paid,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as count_pending,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as count_overdue,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as count_paid
            FROM installments
        `);

        return {
            installments: installmentsResult.rows,
            summary: summaryResult.rows[0]
        };
    } catch (error) {
        console.error('Erro ao buscar recebíveis:', error);
        throw error;
    }
}

// ============================================
// PAYABLES - SUPPLIERS (Phase 3)
// ============================================

export async function getSuppliers(includeInactive = false) {
    try {
        let queryStr = 'SELECT * FROM suppliers';
        if (!includeInactive) {
            queryStr += ' WHERE is_active = true';
        }
        queryStr += ' ORDER BY name ASC';

        const result = await query(queryStr);
        return result.rows;
    } catch (error) {
        console.error('Erro ao buscar fornecedores:', error);
        throw error;
    }
}

export async function createSupplier(data) {
    try {
        const result = await query(`
            INSERT INTO suppliers (
                name, trade_name, document_number, contact_name, email, phone,
                address, city, state, zip_code, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            data.name, data.trade_name, data.document_number, data.contact_name,
            data.email, data.phone, data.address, data.city, data.state,
            data.zip_code, data.notes
        ]);

        return result.rows[0];
    } catch (error) {
        console.error('Erro ao criar fornecedor:', error);
        throw error;
    }
}

export async function updateSupplier(id, data) {
    try {
        const result = await query(`
            UPDATE suppliers SET
                name = $1, trade_name = $2, document_number = $3, contact_name = $4,
                email = $5, phone = $6, address = $7, city = $8, state = $9,
                zip_code = $10, notes = $11, is_active = $12
            WHERE id = $13
            RETURNING *
        `, [
            data.name, data.trade_name, data.document_number, data.contact_name,
            data.email, data.phone, data.address, data.city, data.state,
            data.zip_code, data.notes, data.is_active, id
        ]);

        return result.rows[0];
    } catch (error) {
        console.error('Erro ao atualizar fornecedor:', error);
        throw error;
    }
}

// ============================================
// PAYABLES - BILLS (Phase 3)
// ============================================

export async function getPayables() {
    try {
        // Update overdue statuses first
        await query(`
            UPDATE bills
            SET status = 'overdue'
            WHERE status = 'pending'
            AND due_date < CURRENT_DATE
        `);

        // Get all bills with supplier and category details
        const billsResult = await query(`
            SELECT 
                b.*,
                s.name as supplier_name,
                s.trade_name as supplier_trade_name,
                c.name as category_name,
                c.icon as category_icon,
                c.color as category_color
            FROM bills b
            JOIN suppliers s ON b.supplier_id = s.id
            LEFT JOIN financial_categories c ON b.category_id = c.id
            ORDER BY 
                CASE b.status
                    WHEN 'overdue' THEN 1
                    WHEN 'pending' THEN 2
                    WHEN 'paid' THEN 3
                    WHEN 'cancelled' THEN 4
                    ELSE 5
                END,
                b.due_date ASC
        `);

        // Calculate summary
        const summaryResult = await query(`
            SELECT 
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
                SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as total_overdue,
                SUM(CASE WHEN status = 'paid' THEN paid_amount ELSE 0 END) as total_paid,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as count_pending,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as count_overdue,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as count_paid
            FROM bills
        `);

        return {
            bills: billsResult.rows,
            summary: summaryResult.rows[0]
        };
    } catch (error) {
        console.error('Erro ao buscar contas a pagar:', error);
        throw error;
    }
}

export async function createBill(data, userId) {
    try {
        const result = await query(`
            INSERT INTO bills (
                supplier_id, category_id, bill_number, description, amount, due_date,
                issue_date, payment_method, document_type, tags, notes, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [
            data.supplier_id, data.category_id, data.bill_number, data.description,
            data.amount, data.due_date, data.issue_date, data.payment_method,
            data.document_type, data.tags, data.notes, userId
        ]);

        return result.rows[0];
    } catch (error) {
        console.error('Erro ao criar conta a pagar:', error);
        throw error;
    }
}

export async function markBillAsPaid(billId, transactionData, userId) {
    try {
        // Create expense transaction
        const transaction = await createTransaction({
            ...transactionData,
            type: 'expense',
            reference_type: 'bill',
            reference_id: billId
        }, userId);

        // Update bill
        await query(`
            UPDATE bills 
            SET status = 'paid', transaction_id = $1, paid_date = $2, paid_amount = $3
            WHERE id = $4
        `, [transaction.id, transaction.date, transaction.amount, billId]);

        return transaction;
    } catch (error) {
        console.error('Erro ao marcar conta como paga:', error);
        throw error;
    }
}

export async function cancelBill(billId) {
    try {
        await query(`UPDATE bills SET status = 'cancelled' WHERE id = $1`, [billId]);
        return { success: true };
    } catch (error) {
        console.error('Erro ao cancelar conta:', error);
        throw error;
    }
}

// ============================================
// REPORTS & ANALYTICS (Phase 4)
// ============================================

export async function getDRE(dateFrom, dateTo) {
    try {
        // DRE = Demonstração do Resultado do Exercício (Income Statement)
        const result = await query(`
            SELECT 
                -- Revenue
                SUM(CASE WHEN t.type = 'income' AND t.status = 'completed' THEN t.amount ELSE 0 END) as total_revenue,
                
                -- Revenue by Category
                jsonb_object_agg(
                    CASE WHEN t.type = 'income' AND c.name IS NOT NULL THEN c.name ELSE NULL END,
                    CASE WHEN t.type = 'income' AND c.name IS NOT NULL THEN t.amount ELSE NULL END
                ) FILTER (WHERE t.type = 'income') as revenue_by_category,
                
                -- Expenses
                SUM(CASE WHEN t.type = 'expense' AND t.status = 'completed' THEN t.amount ELSE 0 END) as total_expenses,
                
                -- Expenses by Category
                jsonb_object_agg(
                    CASE WHEN t.type = 'expense' AND c.name IS NOT NULL THEN c.name ELSE NULL END,
                    CASE WHEN t.type = 'expense' AND c.name IS NOT NULL THEN t.amount ELSE NULL END
                ) FILTER (WHERE t.type = 'expense') as expenses_by_category,
                
                -- Net Profit
                SUM(CASE 
                    WHEN t.type = 'income' AND t.status = 'completed' THEN t.amount 
                    WHEN t.type = 'expense' AND t.status = 'completed' THEN -t.amount 
                    ELSE 0 
                END) as net_profit
                
            FROM transactions t
            LEFT JOIN financial_categories c ON t.category_id = c.id
            WHERE t.date >= $1 AND t.date <= $2
        `, [dateFrom, dateTo]);

        // Get detailed breakdown
        const revenueDetails = await query(`
            SELECT 
                c.name as category,
                c.icon,
                c.color,
                SUM(t.amount) as total,
                COUNT(*) as count,
                ROUND(SUM(t.amount) * 100.0 / NULLIF((SELECT SUM(amount) FROM transactions WHERE type = 'income' AND status = 'completed' AND date >= $1 AND date <= $2), 0), 2) as percentage
            FROM transactions t
            JOIN financial_categories c ON t.category_id = c.id
            WHERE t.type = 'income' AND t.status = 'completed'
            AND t.date >= $1 AND t.date <= $2
            GROUP BY c.id, c.name, c.icon, c.color
            ORDER BY total DESC
        `, [dateFrom, dateTo]);

        const expenseDetails = await query(`
            SELECT 
                c.name as category,
                c.icon,
                c.color,
                SUM(t.amount) as total,
                COUNT(*) as count,
                ROUND(SUM(t.amount) * 100.0 / NULLIF((SELECT SUM(amount) FROM transactions WHERE type = 'expense' AND status = 'completed' AND date >= $1 AND date <= $2), 0), 2) as percentage
            FROM transactions t
            JOIN financial_categories c ON t.category_id = c.id
            WHERE t.type = 'expense' AND t.status = 'completed'
            AND t.date >= $1 AND t.date <= $2
            GROUP BY c.id, c.name, c.icon, c.color
            ORDER BY total DESC
        `, [dateFrom, dateTo]);

        return {
            summary: result.rows[0],
            revenue_details: revenueDetails.rows,
            expense_details: expenseDetails.rows
        };
    } catch (error) {
        console.error('Erro ao gerar DRE:', error);
        throw error;
    }
}

export async function getCategoryAnalytics(dateFrom, dateTo) {
    try {
        const result = await query(`
            SELECT 
                c.name,
                c.type,
                c.icon,
                c.color,
                COUNT(*) as transaction_count,
                SUM(t.amount) as total_amount,
                AVG(t.amount) as avg_amount,
                MIN(t.amount) as min_amount,
                MAX(t.amount) as max_amount
            FROM transactions t
            JOIN financial_categories c ON t.category_id = c.id
            WHERE t.date >= $1 AND t.date <= $2 AND t.status = 'completed'
            GROUP BY c.id, c.name, c.type, c.icon, c.color
            ORDER BY total_amount DESC
        `, [dateFrom, dateTo]);

        return result.rows;
    } catch (error) {
        console.error('Erro ao gerar análise de categorias:', error);
        throw error;
    }
}

export async function getMonthlyComparison(months = 6) {
    try {
        const result = await query(`
            SELECT 
                TO_CHAR(date, 'YYYY-MM') as month,
                SUM(CASE WHEN type = 'income' AND status = 'completed' THEN amount ELSE 0 END) as revenue,
                SUM(CASE WHEN type = 'expense' AND status = 'completed' THEN amount ELSE 0 END) as expenses,
                SUM(CASE 
                    WHEN type = 'income' AND status = 'completed' THEN amount 
                    WHEN type = 'expense' AND status = 'completed' THEN -amount 
                    ELSE 0 
                END) as profit,
                COUNT(DISTINCT CASE WHEN type = 'income' THEN id END) as income_count,
                COUNT(DISTINCT CASE WHEN type = 'expense' THEN id END) as expense_count
            FROM transactions
            WHERE date >= CURRENT_DATE - INTERVAL '${months} months'
            GROUP BY TO_CHAR(date, 'YYYY-MM')
            ORDER BY month DESC
        `);

        return result.rows;
    } catch (error) {
        console.error('Erro ao gerar comparação mensal:', error);
        throw error;
    }
}

export async function getCashPosition() {
    try {
        // Get all bank accounts with current balances
        const accounts = await query(`
            SELECT 
                id,
                name,
                bank,
                account_type,
                current_balance,
                initial_balance
            FROM bank_accounts
            WHERE is_active = true
            ORDER BY current_balance DESC
        `);

        // Get pending receivables
        const receivables = await query(`
            SELECT 
                COUNT(*) as count,
                SUM(amount) as total
            FROM installments
            WHERE status IN ('pending', 'overdue')
        `);

        // Get pending payables
        const payables = await query(`
            SELECT 
                COUNT(*) as count,
                SUM(amount) as total
            FROM bills
            WHERE status IN ('pending', 'overdue')
        `);

        const totalCash = accounts.rows.reduce((sum, acc) => sum + parseFloat(acc.current_balance || 0), 0);
        const totalReceivables = parseFloat(receivables.rows[0]?.total || 0);
        const totalPayables = parseFloat(payables.rows[0]?.total || 0);

        return {
            accounts: accounts.rows,
            total_cash: totalCash,
            receivables: {
                count: receivables.rows[0]?.count || 0,
                total: totalReceivables
            },
            payables: {
                count: payables.rows[0]?.count || 0,
                total: totalPayables
            },
            projected_balance: totalCash + totalReceivables - totalPayables
        };
    } catch (error) {
        console.error('Erro ao calcular posição de caixa:', error);
        throw error;
    }
}
// ============================================
// BANK MOVEMENTS (Phase 3)
// ============================================

export async function getBankMovements(filters = {}) {
    try {
        let queryStr = `
            SELECT 
                bm.*,
                ba_origin.name as origin_account_name,
                ba_dest.name as destination_account_name,
                u.name as created_by_name
            FROM bank_movements bm
            LEFT JOIN bank_accounts ba_origin ON bm.origin_account_id = ba_origin.id
            LEFT JOIN bank_accounts ba_dest ON bm.destination_account_id = ba_dest.id
            LEFT JOIN users u ON bm.created_by = u.id
            WHERE 1=1
        `;

        const params = [];
        let paramCount = 1;

        if (filters.date_from) {
            params.push(filters.date_from);
            queryStr += ` AND bm.date >= $${paramCount++}`;
        }

        if (filters.date_to) {
            params.push(filters.date_to);
            queryStr += ` AND bm.date <= $${paramCount++}`;
        }

        if (filters.account_id) {
            params.push(filters.account_id);
            queryStr += ` AND (bm.origin_account_id = $${paramCount} OR bm.destination_account_id = $${paramCount++})`;
        }

        queryStr += ' ORDER BY bm.date DESC, bm.created_at DESC LIMIT 500';

        const result = await query(queryStr, params);
        return result.rows;
    } catch (error) {
        console.error('Erro ao buscar movimentações bancárias:', error);
        throw error;
    }
}

import pool from './db.js';

export async function createBankMovement(data, userId) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { type, amount, date, description, origin_account_id, destination_account_id } = data;

        // 1. Insert Movement Record
        const insertRes = await client.query(`
            INSERT INTO bank_movements (
                type, amount, date, description, 
                origin_account_id, destination_account_id, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            type, amount, date || new Date(), description,
            origin_account_id || null, destination_account_id || null, userId
        ]);

        const movement = insertRes.rows[0];

        // 2. Update Account Balances
        if (type === 'transfer') {
            if (!origin_account_id || !destination_account_id) {
                throw new Error('Transferência requer conta de origem e destino');
            }
            // Debit Origin
            await client.query(`
                UPDATE bank_accounts SET current_balance = current_balance - $1 WHERE id = $2
            `, [amount, origin_account_id]);

            // Credit Destination
            await client.query(`
                UPDATE bank_accounts SET current_balance = current_balance + $1 WHERE id = $2
            `, [amount, destination_account_id]);

        } else if (type === 'adjustment_in' || type === 'adjustment_out') {
            const isIncome = type === 'adjustment_in';
            const accountId = isIncome ? destination_account_id : origin_account_id;

            if (!accountId) {
                throw new Error(`Ajuste de ${isIncome ? 'entrada' : 'saída'} requer conta ${isIncome ? 'de destino' : 'de origem'}`);
            }

            // Update Balance
            await client.query(`
                UPDATE bank_accounts SET current_balance = current_balance ${isIncome ? '+' : '-'} $1 WHERE id = $2
            `, [amount, accountId]);

            // Create Transaction for Report Integration
            const categoryType = isIncome ? 'income' : 'expense';

            // Find or Create Category
            let catRes = await client.query(
                'SELECT id FROM financial_categories WHERE name = $1 AND type = $2',
                ['Ajuste de Saldo', categoryType]
            );

            let categoryId;
            if (catRes.rows.length > 0) {
                categoryId = catRes.rows[0].id;
            } else {
                const newCat = await client.query(`
                    INSERT INTO financial_categories (name, type, description, icon, color, is_active)
                    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
                `, [
                    'Ajuste de Saldo',
                    categoryType,
                    'Ajuste manual de saldo bancário',
                    isIncome ? 'trending-up' : 'trending-down',
                    isIncome ? '#10B981' : '#EF4444',
                    true
                ]);
                categoryId = newCat.rows[0].id;
            }

            // Insert Transaction
            await client.query(`
                INSERT INTO transactions (
                    type, category_id, bank_account_id, amount, date, description,
                    reference_type, reference_id, status, created_by
                ) VALUES ($1, $2, $3, $4, $5, $6, 'bank_movement', $7, 'completed', $8)
            `, [
                categoryType, categoryId, accountId, amount, date || new Date(),
                description || (isIncome ? 'Ajuste de Entrada' : 'Ajuste de Saída'),
                movement.id, userId
            ]);
        }

        await client.query('COMMIT');
        return movement;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao criar movimentação bancária:', error);
        throw error;
    } finally {
        client.release();
    }
}
