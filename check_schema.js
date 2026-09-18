import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log("--- START COLS ---");
        res.rows.forEach(r => console.log(r.column_name));
        console.log("--- END COLS ---");
        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkSchema();
