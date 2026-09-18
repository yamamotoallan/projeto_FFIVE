import { query } from './db.js';

const testInsertion = async () => {
    try {
        console.log('--- TESTE DE INCLUSÃO DE DADOS ---');

        const testName = 'Cliente Teste Antigravity ' + new Date().toLocaleTimeString();
        const testProject = 'Cozinha Planejada Teste';

        console.log(`Tentando inserir lead: ${testName}...`);

        const result = await query(
            `INSERT INTO leads (name, project, phone, email, source, status, avatar_initials, avatar_color) 
             VALUES ($1, $2, $3, $4, $5, 'Novo', $6, $7) 
             RETURNING *`,
            [testName, testProject, '(11) 90000-0000', 'teste@antigravity.ai', 'Teste de Sistema', 'CT', 'purple']
        );

        if (result.rows[0]) {
            console.log('✅ SUCESSO! O dado foi persistido no Google Cloud SQL.');
            console.log('Dados inseridos:', JSON.stringify(result.rows[0], null, 2));

            console.log('\nVerificando contagem total de leads...');
            const count = await query('SELECT COUNT(*) FROM leads');
            console.log(`Total de leads no banco agora: ${count.rows[0].count}`);
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error);
        process.exit(1);
    }
};

testInsertion();
