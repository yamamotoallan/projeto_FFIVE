import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkAndSeed() {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM audit_logs');
        const count = parseInt(res.rows[0].count);
        console.log(`Current log count: ${count}`);

        if (count === 0) {
            console.log("Seeding test log...");
            // Need a user ID first, let's try 1 or find any
            const userRes = await pool.query('SELECT id, name FROM users LIMIT 1');
            if (userRes.rows.length === 0) {
                console.log("No users found to link log to.");
                return;
            }
            const user = userRes.rows[0];

            await pool.query(`
                INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, details)
                VALUES ($1, $2, 'TEST', 'system', '0', 'Teste de log manual')
            `, [user.id, user.name]);

            console.log("Test log inserted.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkAndSeed();
