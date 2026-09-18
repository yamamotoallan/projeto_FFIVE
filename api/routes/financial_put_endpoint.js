// PUT /api/financial/transactions/:id
// Updates an existing transaction
// ==============================================
router.put('/transactions/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { type, category_id, bank_account_id, amount, date, description, payment_method, document_number, status } = req.body;

        // Normalize type: accept both 'revenue'/'income' and 'expense'
        const normalizedType = type === 'revenue' ? 'income' : type;
        const transactionStatus = status || 'pending';

        const result = await pool.query(
            `UPDATE transactions 
             SET type = $1, category_id = $2, bank_account_id = $3, amount = $4, 
                 date = $5, description = $6, payment_method = $7, document_number = $8, status = $9,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $10
             RETURNING *`,
            [normalizedType, category_id, bank_account_id, amount, date, description, payment_method, document_number, transactionStatus, id]
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

