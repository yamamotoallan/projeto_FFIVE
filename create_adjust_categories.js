import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function run() {
    try {
        // Income Adjustment
        await pool.query(`
            INSERT INTO financial_categories (name, type, description, icon, color, is_active)
            SELECT 'Ajuste de Saldo', 'income', 'Ajustes manuais de entrada no saldo bancário', 'trending-up', '#10B981', true
            WHERE NOT EXISTS (SELECT 1 FROM financial_categories WHERE name = 'Ajuste de Saldo' AND type = 'income');
        `);

        // Expense Adjustment
        await pool.query(`
            INSERT INTO financial_categories (name, type, description, icon, color, is_active)
            SELECT 'Ajuste de Saldo', 'expense', 'Ajustes manuais de saída no saldo bancário', 'trending-down', '#EF4444', true
            WHERE NOT EXISTS (SELECT 1 FROM financial_categories WHERE name = 'Ajuste de Saldo' AND type = 'expense');
        `);

        console.log("Categories created/verified.");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
