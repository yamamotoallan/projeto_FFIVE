import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkTables() {
    const tablesToCheck = ['installments', 'bills', 'suppliers', 'transactions', 'financial_categories', 'bank_accounts'];
    const client = await pool.connect();
    try {
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        const existingTables = res.rows.map(r => r.table_name);
        console.log("Existing Tables:", existingTables.join(', '));

        const missing = tablesToCheck.filter(t => !existingTables.includes(t));
        if (missing.length > 0) {
            console.log("MISSING TABLES:", missing.join(', '));
        } else {
            console.log("All required tables exist.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

checkTables();
