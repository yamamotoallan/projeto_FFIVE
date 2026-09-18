import pg from 'pg';
import bcrypt from 'bcryptjs';
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

        // Generate hash
        console.log("Hashing password '123'...");
        const hash = await bcrypt.hash('123', 10);
        console.log("Generated hash:", hash);

        // Update
        console.log("Updating admin user...");
        const updateQuery = `
      UPDATE users 
      SET password_hash = $1 
      WHERE email = 'admin@admin.com'
      RETURNING id, email;
    `;

        const res = await client.query(updateQuery, [hash]);

        if (res.rowCount === 0) {
            // If update failed (user might rely on previous insert which might have worked partly?), try upsert logic or just insert if missing
            console.log("User not found, inserting...");
            const insertQuery = `
            INSERT INTO users (email, name, password_hash, role, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id, email;
        `;
            const resInsert = await client.query(insertQuery, ['admin@admin.com', 'Administrador', hash, 'admin']);
            console.log("Inserted:", resInsert.rows[0]);
        } else {
            console.log("Updated:", res.rows[0]);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        client.release();
        pool.end();
    }
}

resetAdmin();
