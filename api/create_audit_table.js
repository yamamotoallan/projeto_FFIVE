import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function createAuditTable() {
    const client = await pool.connect();
    try {
        console.log('Criando tabela audit_logs...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        user_name VARCHAR(255),
        entity_type VARCHAR(50), 
        entity_id VARCHAR(50),
        action VARCHAR(50), 
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Tabela audit_logs criada com sucesso!');
    } catch (err) {
        console.error('Erro ao criar tabela:', err);
    } finally {
        client.release();
        process.exit();
    }
}

createAuditTable();
