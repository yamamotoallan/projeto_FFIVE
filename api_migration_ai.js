import pool, { query } from './api/db.js';

async function migrate() {
    console.log('🔄 Iniciando migração de configurações de IA...');

    const defaultConfig = {
        tone: 'friendly',
        priority_topics: ['Orçamentos', 'Agendamento'],
        training_examples: [
            { question: "Quanto custa o metro da cozinha?", answer: "Nossos projetos são sob medida, mas para te dar uma ideia, cozinhas em MDF padrão costumam partir de R$ 1.200 o metro linear. Gostaria de agendar uma visita?" }
        ]
    };

    try {
        // Verifica se já existe
        const check = await query("SELECT * FROM settings WHERE key = 'ai_config'");

        if (check.rows.length === 0) {
            await query("INSERT INTO settings (key, value) VALUES ($1, $2)", ['ai_config', JSON.stringify(defaultConfig)]);
            console.log('✅ Configuração padrão de IA inserida.');
        } else {
            console.log('ℹ️ Configuração de IA já existe.');
        }

        console.log('🎉 Migração concluída.');
    } catch (error) {
        console.error('❌ Erro na migração:', error);
    } finally {
        await pool.end();
    }
}

migrate();
