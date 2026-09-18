// Financial Module API Routes
// Endpoints for financial management - transactions, categories, accounts, reports

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import pg from 'pg';
const { Pool } = pg;

const router = express.Router();

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ==============================================
// GET /api/financial/categories
// Returns all financial categories (revenue & expense)
// ==============================================
router.get('/categories', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, type, description, icon, color, is_active 
             FROM financial_categories 
             WHERE is_active = true 
             ORDER BY type, name`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to load categories' });
    }
});

// ==============================================
// GET /api/financial/bank-accounts
// Returns all active bank accounts
// ==============================================
router.get('/bank-accounts', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, bank, account_type, current_balance, is_active 
             FROM bank_accounts 
             WHERE is_active = true 
             ORDER BY name`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        res.status(500).json({ error: 'Failed to load bank accounts' });
    }
});

// ==============================================
// GET /api/financial/summary
// Returns financial summary for a date range
// ==============================================
router.get('/summary', authenticateToken, async (req, res) => {
    try {
        const { date_from, date_to } = req.query;

        const result = await pool.query(
            `SELECT 
                SUM(CASE WHEN type IN ('income', 'revenue') AND status = 'completed' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' AND status = 'completed' THEN amount ELSE 0 END) as total_expense,
                COUNT(CASE WHEN type IN ('income', 'revenue') AND status = 'completed' THEN 1 END) as income_count,
                COUNT(CASE WHEN type = 'expense' AND status = 'completed' THEN 1 END) as expense_count
             FROM transactions
             WHERE date >= $1 AND date <= $2`,
            [date_from, date_to]
        );

        const summary = result.rows[0];
        const balance = (parseFloat(summary.total_income) || 0) - (parseFloat(summary.total_expense) || 0);

        res.json({
            summary: {
                total_income: parseFloat(summary.total_income) || 0,
                total_expense: parseFloat(summary.total_expense) || 0,
                balance: balance
            },
            counts: {
                income: parseInt(summary.income_count) || 0,
                expense: parseInt(summary.expense_count) || 0
            }
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Failed to load summary' });
    }
});

// ==============================================
// GET /api/financial/transactions
// Returns transactions for a date range
// ==============================================
// ==============================================
// GET /api/financial/transactions
// Returns transactions for a date range
// ==============================================
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const { date_from, date_to, supplier_id } = req.query;

        let query = `
            SELECT 
                t.id, t.type, t.amount, t.date, t.description, t.payment_method,
                t.document_number, t.status, t.transaction_number, t.quote_id, t.supplier_id,
                fc.name as category_name, fc.icon as category_icon, fc.color as category_color,
                ba.name as bank_account_name,
                q.project as quote_project, q.client as quote_client, q.id as quote_number,
                s.name as supplier_name
             FROM transactions t
             LEFT JOIN financial_categories fc ON t.category_id = fc.id
             LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.id
             LEFT JOIN quotes q ON t.quote_id = q.id
             LEFT JOIN suppliers s ON t.supplier_id = s.id
             WHERE t.date >= $1 AND t.date <= $2`;

        const params = [date_from, date_to];

        if (supplier_id) {
            params.push(supplier_id);
            query += ` AND t.supplier_id = $${params.length}`;
        }

        query += ` ORDER BY t.date DESC, t.created_at DESC`;

        const result = await pool.query(query, params);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to load transactions' });
    }
});

// ==============================================
// POST /api/financial/transactions
// Creates a new transaction
// ==============================================
router.post('/transactions', authenticateToken, async (req, res) => {
    try {
        const { type, category_id, bank_account_id, amount, date, description, payment_method, document_number, status, quote_id, supplier_id } = req.body;
        const user_id = req.user.id;

        // Normalize type: accept both 'revenue'/'income' and 'expense'
        const normalizedType = type === 'revenue' ? 'income' : type;
        const transactionStatus = status || 'completed'; // Default to completed if not provided

        const result = await pool.query(
            `INSERT INTO transactions 
             (type, category_id, bank_account_id, amount, date, description, payment_method, document_number, created_by, status, quote_id, supplier_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [normalizedType, category_id, bank_account_id, amount, date, description, payment_method, document_number, user_id, transactionStatus, quote_id || null, supplier_id || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction', details: error.message });
    }
});

// PUT /api/financial/transactions/:id
// Updates an existing transaction
// ==============================================
router.put('/transactions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { type, category_id, bank_account_id, amount, date, description, payment_method, document_number, status, supplier_id } = req.body;

        // Normalize type: accept both 'revenue'/'income' and 'expense'
        const normalizedType = type === 'revenue' ? 'income' : type;
        const transactionStatus = status || 'pending';

        const result = await pool.query(
            `UPDATE transactions 
             SET type = $1, category_id = $2, bank_account_id = $3, amount = $4, 
                 date = $5, description = $6, payment_method = $7, document_number = $8, status = $9, supplier_id = $10,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $11
             RETURNING *`,
            [normalizedType, category_id, bank_account_id, amount, date, description, payment_method, document_number, transactionStatus, supplier_id || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update transaction', details: error.message });
    }
});



// ==============================================
// GET /api/financial/cash-flow
// Returns cash flow data for charts
// ==============================================
router.get('/cash-flow', authenticateToken, async (req, res) => {
    try {
        const { date_from, date_to } = req.query;

        const result = await pool.query(
            `SELECT 
                date,
                SUM(CASE WHEN type IN ('income', 'revenue') THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
             FROM transactions
             WHERE date >= $1 AND date <= $2 AND status = 'completed'
             GROUP BY date
             ORDER BY date ASC`,
            [date_from, date_to]
        );

        // Calculate cumulative balance
        let cumulative = 0;
        const data = result.rows.map(row => {
            const income = parseFloat(row.income) || 0;
            const expense = parseFloat(row.expense) || 0;
            cumulative += (income - expense);
            return {
                date: row.date,
                income,
                expense,
                balance: cumulative
            };
        });

        res.json(data);
    } catch (error) {
        console.error('Error fetching cash flow:', error);
        res.status(500).json({ error: 'Failed to load cash flow' });
    }
});

// ==============================================
// GET /api/financial/receivables
// Returns installments (contas a receber) + revenue transactions
// ==============================================
router.get('/receivables', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                i.id, 
                'installment' as source_type,
                i.quote_id, 
                i.installment_number, 
                i.due_date, 
                i.amount, 
                i.status, 
                i.paid_date, 
                i.paid_amount, 
                i.notes,
                q.id as quote_number, 
                q.project as quote_description,
                q.client as client_name
             FROM installments i
             LEFT JOIN quotes q ON i.quote_id = q.id
             
             UNION ALL
             
             SELECT 
                t.id,
                'transaction' as source_type,
                NULL as quote_id,
                NULL as installment_number,
                t.date as due_date,
                t.amount,
                CASE 
                    WHEN t.status = 'completed' THEN 'paid'
                    WHEN t.status = 'pending' THEN 'pending'
                    ELSE 'pending'
                END as status,
                CASE WHEN t.status = 'completed' THEN t.date ELSE NULL END as paid_date,
                CASE WHEN t.status = 'completed' THEN t.amount ELSE NULL END as paid_amount,
                t.description as notes,
                NULL as quote_number,
                'Transação Manual' as quote_description,
                t.description as client_name
             FROM transactions t
             WHERE t.type IN ('income', 'revenue')
             AND (t.reference_type IS NULL OR t.reference_type != 'installment')
             
             ORDER BY due_date ASC`
        );

        res.json({ installments: result.rows });
    } catch (error) {
        console.error('Error fetching receivables:', error);
        res.status(500).json({ error: 'Failed to load receivables', details: error.message });
    }
});

// ==============================================
// GET /api/financial/payables
// Returns bills (contas a pagar) + expense transactions
// ==============================================
router.get('/payables', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                b.id, 
                'bill' as source_type,
                b.supplier_id, 
                b.category_id, 
                b.description, 
                b.amount, 
                b.due_date, 
                b.issue_date, 
                b.status,
                b.paid_date, 
                b.paid_amount, 
                b.payment_method, 
                b.bill_number, 
                b.notes,
                s.name as supplier_name,
                fc.name as category_name, 
                fc.color as category_color
             FROM bills b
             LEFT JOIN suppliers s ON b.supplier_id = s.id
             LEFT JOIN financial_categories fc ON b.category_id = fc.id
             
             UNION ALL
             
             SELECT 
                t.id,
                'transaction' as source_type,
                NULL as supplier_id,
                t.category_id,
                t.description,
                t.amount,
                t.date as due_date,
                t.date as issue_date,
                CASE 
                    WHEN t.status = 'completed' THEN 'paid'
                    WHEN t.status = 'pending' THEN 'pending'
                    ELSE 'pending'
                END as status,
                CASE WHEN t.status = 'completed' THEN t.date ELSE NULL END as paid_date,
                CASE WHEN t.status = 'completed' THEN t.amount ELSE NULL END as paid_amount,
                t.payment_method,
                t.document_number as bill_number,
                t.description as notes,
                'Transação Manual' as supplier_name,
                fc.name as category_name,
                fc.color as category_color
             FROM transactions t
             LEFT JOIN financial_categories fc ON t.category_id = fc.id
             WHERE t.type = 'expense'
             AND (t.reference_type IS NULL OR t.reference_type != 'bill')
             
             ORDER BY due_date ASC`
        );

        res.json({ bills: result.rows });
    } catch (error) {
        console.error('Error fetching payables:', error);
        res.status(500).json({ error: 'Failed to load payables', details: error.message });
    }
});

// ==============================================
// GET /api/financial/suppliers
// Returns all suppliers
// ==============================================
router.get('/suppliers', authenticateToken, async (req, res) => {
    try {
        // Query simplified to avoid column errors if schema changed
        const result = await pool.query(
            `SELECT * FROM suppliers ORDER BY name`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ error: 'Failed to load suppliers', details: error.message });
    }
});

// ==============================================
// POST /api/financial/bills
// Create a new bill
// ==============================================
router.post('/bills', authenticateToken, async (req, res) => {
    try {
        const { supplier_id, category_id, description, amount, due_date, issue_date, bill_number, notes } = req.body;

        const result = await pool.query(
            `INSERT INTO bills 
             (supplier_id, category_id, description, amount, due_date, issue_date, bill_number, notes, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
             RETURNING *`,
            [supplier_id, category_id, description, amount, due_date, issue_date, bill_number, notes]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({ error: 'Failed to create bill' });
    }
});

// ==============================================
// PATCH /api/financial/bills/:id/pay
// Mark bill as paid
// ==============================================
// ==============================================
// POST /api/financial/bills/:id/pay
// Mark bill as paid
// ==============================================
router.post('/bills/:id/pay', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { paid_amount, payment_method, bank_account_id, date } = req.body; // Added date
        const user_id = req.user.id;

        // Start transaction
        await pool.query('BEGIN');

        // Update bill
        const billResult = await pool.query(
            `UPDATE bills 
             SET status = 'paid', paid_date = $1, paid_amount = $2, payment_method = $3
             WHERE id = $4
             RETURNING *`,
            [date || new Date(), paid_amount, payment_method, id]
        );

        if (billResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'Bill not found' });
        }

        // Create transaction
        const bill = billResult.rows[0];
        const docNum = bill.bill_number || '';

        await pool.query(
            `INSERT INTO transactions 
             (type, category_id, bank_account_id, amount, date, description, payment_method, document_number, created_by, status, reference_type, reference_id)
             VALUES ('expense', $1, $2, $3, $4, $5, $6, $7, $8, 'completed', 'bill', $9)`,
            [bill.category_id, bank_account_id, paid_amount, date || new Date(), bill.description, payment_method, docNum, user_id, id]
        );

        // Update Bank Account Balance
        await pool.query(
            `UPDATE bank_accounts SET current_balance = current_balance - $1 WHERE id = $2`,
            [paid_amount, bank_account_id]
        );

        await pool.query('COMMIT');
        res.json(bill);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error paying bill:', error);
        res.status(500).json({ error: 'Failed to pay bill' });
    }
});

// ==============================================
// POST /api/financial/installments/:id/pay
// Mark installment as paid
// ==============================================
router.post('/installments/:id/pay', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, payment_method, bank_account_id, date, description } = req.body;
        const user_id = req.user.id;

        // Start transaction
        await pool.query('BEGIN');

        // Update installment
        const instResult = await pool.query(
            `UPDATE installments 
             SET status = 'paid', paid_date = $1, paid_amount = $2, notes = COALESCE(notes, '') || ' - Pago em ' || $1
             WHERE id = $3
             RETURNING *`,
            [date || new Date(), amount, id]
        );

        if (instResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'Installment not found' });
        }

        const installment = instResult.rows[0];

        // Fetch Quote info for description
        const quoteRes = await pool.query(`SELECT project, client FROM quotes WHERE id = $1`, [installment.quote_id]);
        const quote = quoteRes.rows[0] || {};
        const transDesc = description || `Pagamento Parcela #${installment.installment_number} - ${quote.client || ''}`;

        // Create transaction
        await pool.query(
            `INSERT INTO transactions 
             (type, category_id, bank_account_id, amount, date, description, payment_method, created_by, status, reference_type, reference_id)
             VALUES ('revenue', NULL, $1, $2, $3, $4, $5, $6, 'completed', 'installment', $7)`,
            [bank_account_id, amount, date || new Date(), transDesc, payment_method, user_id, id]
        );

        // Update Bank Account Balance
        await pool.query(
            `UPDATE bank_accounts SET current_balance = current_balance + $1 WHERE id = $2`,
            [amount, bank_account_id]
        );

        await pool.query('COMMIT');
        res.json(installment);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error paying installment:', error);
        res.status(500).json({ error: 'Failed to pay installment' });
    }
});

// ==============================================
// GET /api/financial/reports/dre
// DRE - Demonstração do Resultado do Exercício
// ==============================================
router.get('/reports/dre', authenticateToken, async (req, res) => {
    try {
        const { date_from, date_to } = req.query;

        // 1. Get Totals by Type
        const totalsResult = await pool.query(
            `SELECT 
                t.type,
                SUM(t.amount) as total
             FROM transactions t
             WHERE t.date >= $1 AND t.date <= $2 AND t.status = 'completed'
             GROUP BY t.type`,
            [date_from, date_to]
        );

        // 2. Get Revenue Breakdown by Category
        const revenueDetailsRes = await pool.query(
            `SELECT 
                fc.name as category,
                SUM(t.amount) as total
             FROM transactions t
             JOIN financial_categories fc ON t.category_id = fc.id
             WHERE t.date >= $1 AND t.date <= $2 
             AND t.status = 'completed' AND t.type = 'revenue'
             GROUP BY fc.name
             ORDER BY total DESC`,
            [date_from, date_to]
        );

        // 3. Get Expense Breakdown by Category
        const expenseDetailsRes = await pool.query(
            `SELECT 
                fc.name as category,
                SUM(t.amount) as total
             FROM transactions t
             JOIN financial_categories fc ON t.category_id = fc.id
             WHERE t.date >= $1 AND t.date <= $2 
             AND t.status = 'completed' AND t.type = 'expense'
             GROUP BY fc.name
             ORDER BY total DESC`,
            [date_from, date_to]
        );

        const total_revenue = parseFloat(totalsResult.rows.find(r => r.type === 'revenue')?.total || 0);
        const total_expenses = parseFloat(totalsResult.rows.find(r => r.type === 'expense')?.total || 0);

        res.json({
            summary: {
                total_revenue,
                total_expenses,
                net_profit: total_revenue - total_expenses
            },
            revenue_details: revenueDetailsRes.rows,
            expense_details: expenseDetailsRes.rows
        });
    } catch (error) {
        console.error('Error fetching DRE:', error);
        res.status(500).json({ error: 'Failed to load DRE' });
    }
});

// ==============================================
// GET /api/financial/reports/monthly-comparison
// Monthly comparison report
// ==============================================
router.get('/reports/monthly-comparison', authenticateToken, async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 6;

        const result = await pool.query(
            `SELECT 
                TO_CHAR(date, 'YYYY-MM') as month,
                COALESCE(SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END), 0) as revenue,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
             FROM transactions
             WHERE date >= CURRENT_DATE - INTERVAL '1 month' * $1 AND status = 'completed'
             GROUP BY TO_CHAR(date, 'YYYY-MM')
             ORDER BY month ASC`,
            [months]
        );

        const data = result.rows.map(row => ({
            month: row.month,
            revenue: parseFloat(row.revenue),
            expenses: parseFloat(row.expenses),
            profit: parseFloat(row.revenue) - parseFloat(row.expenses)
        }));

        res.json(data);
    } catch (error) {
        console.error('Error fetching monthly comparison:', error);
        res.status(500).json({ error: 'Failed to load monthly comparison' });
    }
});

// ==============================================
// GET /api/financial/reports/cash-position
// Current cash position across all accounts
// ==============================================
router.get('/reports/cash-position', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT name, account_type, current_balance
             FROM bank_accounts
             WHERE is_active = true
             ORDER BY current_balance DESC`
        );

        const total = result.rows.reduce((sum, acc) => sum + parseFloat(acc.current_balance || 0), 0);

        // Get Pending Receivables (Transactions + Installments)
        // 1. Pending Revenue Transactions (next 30 days)
        const transReceivablesRes = await pool.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE type IN ('revenue', 'income') AND status = 'pending'
            AND date <= CURRENT_DATE + INTERVAL '30 days'
        `);

        // 2. Pending Installments (next 30 days)
        const instReceivablesRes = await pool.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
            FROM installments
            WHERE status = 'pending'
            AND due_date <= CURRENT_DATE + INTERVAL '30 days'
        `);

        // Get Pending Payables (Transactions + Bills)
        // 1. Pending Expense Transactions (next 30 days)
        const transPayablesRes = await pool.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE type = 'expense' AND status = 'pending'
            AND date <= CURRENT_DATE + INTERVAL '30 days'
        `);

        // 2. Pending Bills (next 30 days)
        const billsRes = await pool.query(`
            SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
            FROM bills
            WHERE status = 'pending'
            AND due_date <= CURRENT_DATE + INTERVAL '30 days'
        `);

        const receivables = {
            count: parseInt(transReceivablesRes.rows[0].count) + parseInt(instReceivablesRes.rows[0].count),
            total: parseFloat(transReceivablesRes.rows[0].total) + parseFloat(instReceivablesRes.rows[0].total)
        };

        const payables = {
            count: parseInt(transPayablesRes.rows[0].count) + parseInt(billsRes.rows[0].count),
            total: parseFloat(transPayablesRes.rows[0].total) + parseFloat(billsRes.rows[0].total)
        };

        const projected_balance = total + receivables.total - payables.total;

        res.json({
            accounts: result.rows,
            total_cash: total,
            receivables,
            payables,
            projected_balance
        });
    } catch (error) {
        console.error('Error fetching cash position:', error);
        res.status(500).json({ error: 'Failed to load cash position' });
    }
});

// ==============================================
// GET /api/financial/movements
// Returns bank movements (transfers, adjustments)
// ==============================================
router.get('/movements', authenticateToken, async (req, res) => {
    try {
        const { date_from, date_to, account_id } = req.query;

        let query = `
            SELECT 
                bm.id, bm.date, bm.type, bm.amount, bm.description,
                ba_origin.name as origin_account_name,
                ba_dest.name as destination_account_name
            FROM bank_movements bm
            LEFT JOIN bank_accounts ba_origin ON bm.origin_account_id = ba_origin.id
            LEFT JOIN bank_accounts ba_dest ON bm.destination_account_id = ba_dest.id
            WHERE 1=1
        `;
        const params = [];

        if (date_from && date_to) {
            params.push(date_from, date_to);
            query += ` AND bm.date >= $${params.length - 1} AND bm.date <= $${params.length}`;
        }

        if (account_id) {
            params.push(account_id);
            query += ` AND (bm.origin_account_id = $${params.length} OR bm.destination_account_id = $${params.length})`;
        }

        query += ` ORDER BY bm.date DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching movements:', error);
        res.status(500).json({ error: 'Failed to load movements' });
    }
});

// ==============================================
// POST /api/financial/movements
// Creates a new movement (Transfer, Adjustment)
// ==============================================
router.post('/movements', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { type, amount, date, origin_account_id, destination_account_id, description } = req.body;
        const user_id = req.user.id;

        // Create movement record
        const insertRes = await client.query(
            `INSERT INTO bank_movements 
             (type, amount, date, origin_account_id, destination_account_id, description, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [type, amount, date, origin_account_id || null, destination_account_id || null, description, user_id]
        );

        const movement = insertRes.rows[0];

        // Update balances
        if (type === 'transfer') {
            // Debit origin, Credit destination
            await client.query('UPDATE bank_accounts SET current_balance = current_balance - $1 WHERE id = $2', [amount, origin_account_id]);
            await client.query('UPDATE bank_accounts SET current_balance = current_balance + $1 WHERE id = $2', [amount, destination_account_id]);
        } else if (type === 'adjustment_in' || type === 'initial_balance') {
            // Credit destination
            await client.query('UPDATE bank_accounts SET current_balance = current_balance + $1 WHERE id = $2', [amount, destination_account_id]);
        } else if (type === 'adjustment_out') {
            // Debit origin
            await client.query('UPDATE bank_accounts SET current_balance = current_balance - $1 WHERE id = $2', [amount, origin_account_id]);
        }

        await client.query('COMMIT');
        res.status(201).json(movement);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating movement:', error);
        res.status(500).json({ error: 'Failed to create movement' });
    } finally {
        client.release();
    }
});

// TEMPORARY MIGRATION ENDPOINT
router.get('/migrate-supplier', async (req, res) => {
    try {
        await pool.query(`
            ALTER TABLE transactions 
            ADD COLUMN IF NOT EXISTS supplier_id INTEGER REFERENCES suppliers(id);
            
            CREATE INDEX IF NOT EXISTS idx_transactions_supplier_id ON transactions(supplier_id);
        `);
        res.send('Migration executed successfully');
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).send('Migration failed: ' + error.message);
    }
});

export default router;
