import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function fixAdminUser() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Conectado ao Neon.tech!');

        // Primeiro vamos ver se existe algum usuário
        const allUsers = await client.query('SELECT id, name, email, role FROM users');
        console.log('\n📋 Usuários existentes:', allUsers.rows);

        // Hash da senha '123'
        const passwordHash = await bcrypt.hash('123', 10);
        console.log('\n🔐 Novo password hash para "123":', passwordHash);

        // Testar se o hash funciona
        const testMatch = await bcrypt.compare('123', passwordHash);
        console.log('✅ Teste de hash funcionou:', testMatch);

        // Deletar e recriar o usuário admin
        await client.query('DELETE FROM users WHERE email = $1', ['admin@marcenaria.pro']);
        console.log('\n🗑️  Usuário admin antigo deletado (se existia)');

        const result = await client.query(`
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role, created_at
        `, ['Administrador', 'admin@marcenaria.pro', passwordHash, 'admin']);

        console.log('\n✅ Novo usuário admin criado:');
        console.log(result.rows[0]);

        // Verificar se conseguimos fazer login manualmente
        const loginTest = await client.query('SELECT * FROM users WHERE email = $1', ['admin@marcenaria.pro']);
        const user = loginTest.rows[0];

        if (user) {
            console.log('\n🔍 Usuário encontrado no banco:', user.email);
            const isMatch = await bcrypt.compare('123', user.password_hash);
            console.log('🔐 Senha "123" confere com hash?', isMatch);
        }

        await client.end();
        console.log('\n✅ Tudo pronto! Usuário admin configurado corretamente.');
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

fixAdminUser();
