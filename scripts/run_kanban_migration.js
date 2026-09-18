import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Starting Kanban migration (ESM)...');

        // Adjusted path to go up one level from scripts folder
        const sqlPath = path.join(__dirname, '../migrations/create_kanban_tables.sql');

        if (!fs.existsSync(sqlPath)) {
            throw new Error(`Migration file not found at: ${sqlPath}`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await client.query(sql);

        console.log('Migration completed successfully!');

        // Verify results
        const stages = await client.query('SELECT * FROM kanban_stages ORDER BY order_position');
        console.log('Stages created:', stages.rows.length);
        console.table(stages.rows);

        const templates = await client.query('SELECT * FROM kanban_checklist_templates');
        console.log('Checklist templates created:', templates.rows.length);

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
