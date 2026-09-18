// Script to run the bank movements migration (ES Module version)
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
    try {
        console.log('🚀 Starting migration: create_bank_movements...\n');

        const sqlPath = path.join(__dirname, 'migrations', 'create_bank_movements.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Executing SQL migration...');
        await pool.query(sql);

        console.log('✅ Migration completed successfully!\n');

        // Verify the changes
        console.log('🔍 Verifying table creation...');
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'bank_movements'
            ORDER BY ordinal_position
        `);

        console.log('\nTable Structure: bank_movements');
        console.table(result.rows);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
