import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function createChecklistTable() {
    const client = await pool.connect();
    try {
        console.log('Criando tabela project_checklists...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS project_checklists (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
        stage VARCHAR(50) NOT NULL,
        item_label TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        completed_by_user_id INTEGER,
        completed_by_user_name VARCHAR(255),
        completed_at TIMESTAMP,
        UNIQUE(project_id, stage, item_label)
      );
    `);
        console.log('Tabela project_checklists criada com sucesso!');
    } catch (err) {
        console.error('Erro ao criar tabela:', err);
    } finally {
        client.release();
        process.exit();
    }
}

createChecklistTable();
