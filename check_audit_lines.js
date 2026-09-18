import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function check() {
    try {
        const res = await pool.query(`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'audit_logs'
            ORDER BY ordinal_position
        `);
        console.log("--- START COLUMNS ---");
        res.rows.forEach(r => console.log(r.column_name));
        console.log("--- END COLUMNS ---");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
