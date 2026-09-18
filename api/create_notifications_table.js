import { query } from './db.js';

const createNotificationsTable = async () => {
    try {
        console.log('Criando tabela notifications...');

        await query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(200) NOT NULL,
                message TEXT,
                link VARCHAR(500),
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
            CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
            CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
        `);

        console.log('✅ Tabela notifications criada com sucesso!');
        console.log('✅ Índices criados para melhor performance!');

        // Criar algumas notificações de exemplo
        console.log('\nCriando notificações de exemplo...');

        await query(`
            INSERT INTO notifications (user_id, type, title, message, link)
            VALUES 
                (1, 'welcome', '🎉 Bem-vindo ao Sistema!', 'Sistema de notificações ativado com sucesso.', '/'),
                (1, 'system', '✅ Deploy Concluído', 'O sistema está funcionando perfeitamente em produção!', '/dashboard')
            ON CONFLICT DO NOTHING;
        `);

        console.log('✅ Notificações de exemplo criadas!');

        process.exit(0);

    } catch (error) {
        console.error('❌ Erro ao criar tabela:', error);
        process.exit(1);
    }
};

createNotificationsTable();
