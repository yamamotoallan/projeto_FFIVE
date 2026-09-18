import { query } from './db.js';

const createSettingsTable = async () => {
    try {
        console.log('Criando tabela settings...');

        await query(`
            CREATE TABLE IF NOT EXISTS settings (
                key VARCHAR(100) PRIMARY KEY,
                value TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ Tabela settings criada com sucesso!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erro ao criar tabela:', error);
        process.exit(1);
    }
};

createSettingsTable();
