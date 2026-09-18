// Script to check recent transactions in the database
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkTransactions() {
    try {
        console.log('Checking recent transactions...\n');

        const result = await pool.query(
            `SELECT 
                id, type, amount, date, description, status, 
                category_id, bank_account_id, 
                created_at
             FROM transactions 
             ORDER BY created_at DESC 
             LIMIT 10`
        );

        console.log(`Found ${result.rows.length} recent transactions:\n`);

        result.rows.forEach((tx, idx) => {
            console.log(`${idx + 1}. ID: ${tx.id}`);
            console.log(`   Type: ${tx.type}`);
            console.log(`   Amount: R$ ${parseFloat(tx.amount).toFixed(2)}`);
            console.log(`   Date: ${tx.date}`);
            console.log(`   Status: ${tx.status}`);
            console.log(`   Description: ${tx.description}`);
            console.log(`   Created: ${tx.created_at}`);
            console.log('');
        });

        // Check specifically for income transactions
        const incomeResult = await pool.query(
            `SELECT COUNT(*) as count 
             FROM transactions 
             WHERE type IN ('income', 'revenue')`
        );

        console.log(`\nTotal income/revenue transactions: ${incomeResult.rows[0].count}`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkTransactions();
