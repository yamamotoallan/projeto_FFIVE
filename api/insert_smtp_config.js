import { query } from './db.js';

const insertSmtpConfig = async () => {
    try {
        console.log('Inserindo configurações SMTP...');

        const config = {
            smtp_host: 'smtp.gmail.com',
            smtp_port: '587',
            smtp_user: 'yamamotoallan@gmail.com',
            smtp_pass: 'hrmejtloepblyclh', // Nova App Password
            smtp_secure: 'TLS',
            from_name: 'FFIVE Ambientes Planejados',
            from_email: 'yamamotoallan@gmail.com'
        };

        await query(`
            INSERT INTO settings (key, value, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (key) 
            DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
        `, ['smtp_config', JSON.stringify(config)]);

        console.log('✅ Configurações SMTP inseridas com sucesso!');
        console.log('Config:', config);

        process.exit(0);

    } catch (error) {
        console.error('❌ Erro ao inserir configurações:', error);
        process.exit(1);
    }
};

insertSmtpConfig();
