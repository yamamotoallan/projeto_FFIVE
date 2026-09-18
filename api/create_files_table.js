import { query } from './db.js';

const createFilesTable = async () => {
    try {
        console.log('Criando tabela quote_files...');

        await query(`
            CREATE TABLE IF NOT EXISTS quote_files (
                id SERIAL PRIMARY KEY,
                quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
                filename VARCHAR(255) NOT NULL,
                original_name VARCHAR(255) NOT NULL,
                mimetype VARCHAR(100),
                size INTEGER,
                gcs_path VARCHAR(500) NOT NULL,
                uploaded_by INTEGER,
                uploaded_by_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ Tabela quote_files criada com sucesso!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erro ao criar tabela:', error);
        process.exit(1);
    }
};

createFilesTable();
