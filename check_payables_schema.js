import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSchemas() {
    const tables = ['bills', 'suppliers', 'quotes'];
    const client = await pool.connect();
    try {
        for (const t of tables) {
            console.log(`\n=== TABLE: ${t} ===`);
            const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = '${t}'
        `);
            res.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

checkSchemas();
