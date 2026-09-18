import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function createAdminUser() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Conectado ao Neon.tech!');

        // Hash da senha '123'
        const passwordHash = await bcrypt.hash('123', 10);
        console.log('🔐 Password hash gerado:', passwordHash);

        // Inserir ou atualizar usuário admin
        const result = await client.query(`
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO UPDATE 
            SET password_hash = $3, role = $4
            RETURNING id, name, email, role, created_at
        `, ['Administrador', 'admin@marcenaria.pro', passwordHash, 'admin']);

        console.log('\n✅ Usuário admin criado/atualizado:');
        console.log(result.rows[0]);

        // Verificar todos os usuários
        const users = await client.query('SELECT id, name, email, role FROM users');
        console.log('\n📋 Usuários no banco:');
        console.table(users.rows);

        await client.end();
        console.log('\n✅ Concluído com sucesso!');
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

createAdminUser();
