import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSchemas() {
    const tables = ['installments', 'bills', 'suppliers', 'quotes', 'customers'];
    const client = await pool.connect();
    try {
        for (const t of tables) {
            console.log(`\n--- TABLE: ${t} ---`);
            const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = '${t}'
        `);
            if (res.rows.length === 0) {
                console.log("(Table not found)");
            } else {
                console.log(res.rows.map(r => r.column_name).join(', '));
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

checkSchemas();
