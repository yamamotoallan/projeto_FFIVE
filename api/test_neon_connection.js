import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Client } = pg;
async function testConnection() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        console.log('✅ Conectado ao Neon.tech com sucesso!');
        const result = await client.query('SELECT NOW()');
        console.log('⏰ Horário do servidor:', result.rows[0].now);
        const tables = await client.query(`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        `);
        console.log('\n📊 Tabelas encontradas:');
        tables.rows.forEach(row => console.log('  -', row.tablename));
        await client.end();
    } catch (error) {
        console.error('❌ Erro ao conectar:', error.message);
        process.exit(1);
    }
}
testConnection();