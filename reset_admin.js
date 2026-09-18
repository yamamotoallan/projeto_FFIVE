import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function resetAdmin() {
    const client = await pool.connect();
    try {
        console.log("Connected.");

        // 1. Delete existing
        console.log("Deleting...");
        await client.query("DELETE FROM users WHERE email = 'admin@admin.com'");

        // 2. Insert
        console.log("Inserting...");
        const insertQuery = `
      INSERT INTO users (email, name, password_hash, role, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, email;
    `;
        const values = [
            'admin@admin.com',
            'Administrador',
            '$2a$10$N9qo8uLOickgx2ZrVzY6jeerQrIRv7A48YHy.H9P.wUW3Zq2MZHPu', // '123'
            'admin'
        ];

        const res = await client.query(insertQuery, values);
        console.log("Inserted:", res.rows[0]);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        client.release();
        pool.end();
    }
}

resetAdmin();
