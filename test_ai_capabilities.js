import 'dotenv/config';
import { generateSuggestion, chatWithAI } from './api/services/aiService.js';

async function runDemo() {
    console.log('🤖 === TESTE DE CAPACIDADES IA (Groq/Llama3) ===\n');

    // 1. TAREFA: ASSISTENTE (Melhoria pontual)
    console.log('📝 TESTE 1: ASSISTENTE (Melhoria de Texto)');
    console.log('Input: "O orçamento tá meio caro mas vale a pena."');
    try {
        const suggestion = await generateSuggestion(
            "O orçamento tá meio caro mas vale a pena.",
            "Orçamento"
        );
        console.log('✅ Sugestão IA:', suggestion);
    } catch (e) {
        console.error('❌ Falha Assistente:', e.message);
    }

    console.log('\n-----------------------------------\n');

    // 2. TAREFA: AGENTE (Conversa com Personalidade)
    console.log('💬 TESTE 2: AGENTE (Chat / Persona)');
    console.log('Cenário: Cliente perguntando a diferença entre MDF e MDP.');
    try {
        const response = await chatWithAI(
            "Qual a diferença entre MDF e MDP? O MDP é ruim?",
            { role: "Vendedor Técnico", tone: "Educating" }
        );
        console.log('✅ Resposta Agente:', response);
    } catch (e) {
        console.error('❌ Falha Agente:', e.message);
    }
}

runDemo();
