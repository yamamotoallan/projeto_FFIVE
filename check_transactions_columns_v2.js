
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://default:ji4S0NlKwLme@ep-plain-glade-a42l9168-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'transactions';
        `);
        console.log('Columns in transactions table:', result.rows);
    } catch (error) {
        console.error('Error checking columns:', error);
    } finally {
        await pool.end();
    }
}

checkColumns();
