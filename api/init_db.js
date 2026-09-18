import { query } from './db.js';
import bcrypt from 'bcryptjs';

const initDB = async () => {
    try {
        console.log('Criando tabelas no banco de dados...');

        // Tabela Users
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Verifica se existe admin
        const res = await query("SELECT * FROM users WHERE email = 'admin@marcenaria.pro'");
        if (res.rows.length === 0) {
            console.log('Criando usuário Admin padrão...');
            const hash = await bcrypt.hash('123', 10);
            await query(
                "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
                ['Administrador', 'admin@marcenaria.pro', hash, 'admin']
            );
        }

        console.log('✅ Banco de dados inicializado com sucesso!');
        process.exit(0);

    } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        process.exit(1);
    }
};

initDB();
