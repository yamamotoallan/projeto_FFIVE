import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL;
console.log('DEBUG: DATABASE_URL exists?', !!dbUrl);
if (dbUrl) {
    console.log('DEBUG: DATABASE_URL starts with:', dbUrl.substring(0, 15) + '...');
} else {
    console.log('DEBUG: DATABASE_URL NOT FOUND. Checking .env file...');
    try {
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            console.log('DEBUG: .env file found at', envPath);
            const envContent = fs.readFileSync(envPath, 'utf8');
            console.log('DEBUG: .env content (first 50 chars):', envContent.substring(0, 50));
        } else {
            console.log('DEBUG: .env file NOT found at', envPath);
        }
    } catch (e) {
        console.log('DEBUG: Error reading .env:', e.message);
    }
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function applyIndexes() {
    console.log('🔌 Connecting to database...');

    try {
        const client = await pool.connect();
        console.log('✅ Connected successfully.');

        const sqlPath = path.join(__dirname, 'api', 'add_indexes_safe.sql');
        console.log(`📖 Reading SQL from: ${sqlPath}`);

        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found at ${sqlPath}`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing SQL script...');
        await client.query(sql);

        console.log('✅ Indexes applied successfully!');
        client.release();
    } catch (err) {
        console.error('❌ Error applying indexes:', err);
    } finally {
        await pool.end();
    }
}

applyIndexes();
