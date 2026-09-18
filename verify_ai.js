import 'dotenv/config';
import { generateSuggestion } from './api/services/aiService.js';

async function testAI() {
    console.log('🔄 Iniciando teste com Groq AI...');
    console.log('🔑 Key:', process.env.GROQ_API_KEY ? 'Encontrada' : 'Faltando');

    try {
        const result = await generateSuggestion(
            "Gostaria de um orçamento para um armário de cozinha.",
            "Orçamento"
        );
        console.log('\n✅ Sucesso! Resposta da IA:\n');
        console.log(result);
    } catch (error) {
        console.error('\n❌ Erro no teste:');
        console.error(error.message);
        if (error.cause) console.error('Causa:', error.cause);
        console.error(error.stack);
    }
}

testAI();
