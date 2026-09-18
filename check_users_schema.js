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
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);
        console.log("--- USERS COLUMNS ---");
        res.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));
        console.log("--- END ---");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
