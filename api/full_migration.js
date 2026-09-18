import { query } from './db.js';

const fullMigration = async () => {
    try {
        console.log('--- INICIANDO MIGRAÇÃO COMPLETA DO BANCO DE DADOS ---');

        // 1. Tabela de Orçamentos
        console.log('Criando tabela de orçamentos (quotes)...');
        await query(`
            CREATE TABLE IF NOT EXISTS quotes (
                id SERIAL PRIMARY KEY,
                lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
                client VARCHAR(255) NOT NULL,
                project VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pendente',
                value DECIMAL(15, 2) DEFAULT 0.00,
                date DATE DEFAULT CURRENT_DATE,
                validity DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Tabela de Projetos (Kanban)
        console.log('Criando tabela de projetos (projects)...');
        await query(`
            CREATE TABLE IF NOT EXISTS projects (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                client VARCHAR(255) NOT NULL,
                value DECIMAL(15, 2) DEFAULT 0.00,
                status VARCHAR(50) DEFAULT 'Refinamento',
                deadline DATE,
                priority VARCHAR(20) DEFAULT 'Média',
                responsible VARCHAR(255),
                description TEXT,
                start_date DATE,
                lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
                quote_id INTEGER REFERENCES quotes(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Tabela de Agenda (Events)
        console.log('Criando tabela de agenda (events)...');
        await query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                subtitle VARCHAR(255),
                time_start TIMESTAMP NOT NULL,
                time_end TIMESTAMP,
                type VARCHAR(50) NOT NULL,
                confirmed BOOLEAN DEFAULT FALSE,
                description TEXT,
                lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Tabela de Comentários / Histórico
        console.log('Criando tabela de comentários (interactions)...');
        await query(`
            CREATE TABLE IF NOT EXISTS interactions (
                id SERIAL PRIMARY KEY,
                entity_type VARCHAR(50) NOT NULL, -- 'lead', 'quote', 'project'
                entity_id VARCHAR(50) NOT NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                content TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'note', -- 'note', 'call', 'email'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 5. Configurações do Sistema
        console.log('Criando tabela de configurações (settings)...');
        await query(`
            CREATE TABLE IF NOT EXISTS settings (
                key VARCHAR(100) PRIMARY KEY,
                value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
        process.exit(0);

    } catch (error) {
        console.error('❌ ERRO NA MIGRAÇÃO:', error);
        process.exit(1);
    }
};

fullMigration();
