// Script to run the transaction migration (ES Module version)
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
        console.log('🚀 Starting migration: add_transaction_number_and_quote...\n');

        const sqlPath = path.join(__dirname, 'migrations', 'add_transaction_number_and_quote.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Executing SQL migration...');
        await pool.query(sql);

        console.log('✅ Migration completed successfully!\n');

        // Verify the changes
        console.log('🔍 Verifying changes...');
        const result = await pool.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'transactions' 
            AND column_name IN ('transaction_number', 'quote_id')
            ORDER BY column_name
        `);

        console.log('\nColumns added:');
        console.table(result.rows);

        // Check existing transactions
        const count = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(transaction_number) as with_number,
                COUNT(quote_id) as with_project
            FROM transactions
        `);

        console.log('\nTransaction statistics:');
        console.log(`Total transactions: ${count.rows[0].total}`);
        console.log(`With transaction number: ${count.rows[0].with_number}`);
        console.log(`Linked to projects: ${count.rows[0].with_project}`);

        // Show sample transaction numbers
        const sample = await pool.query(`
            SELECT id, transaction_number, description, date
            FROM transactions
            ORDER BY created_at DESC
            LIMIT 5
        `);

        console.log('\nSample transaction numbers:');
        console.table(sample.rows);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
