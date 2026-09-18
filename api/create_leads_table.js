import { query } from './db.js';

const createLeadsTable = async () => {
    try {
        console.log('Criando tabela de leads...');

        await query(`
            CREATE TABLE IF NOT EXISTS leads (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                project VARCHAR(255),
                phone VARCHAR(50),
                email VARCHAR(255),
                source VARCHAR(50) DEFAULT 'Indicação',
                status VARCHAR(50) DEFAULT 'Novo',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                avatar_initials VARCHAR(5),
                avatar_color VARCHAR(20)
            );
        `);

        console.log('✅ Tabela de leads criada com sucesso!');
        process.exit(0);

    } catch (error) {
        console.error('Erro ao criar tabela de leads:', error);
        process.exit(1);
    }
};

createLeadsTable();
