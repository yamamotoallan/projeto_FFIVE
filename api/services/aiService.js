import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuração dos Provedores
const PROVIDERS = {
    GOOGLE: 'google',
    HUGGINGFACE: 'huggingface',
    GROQ: 'groq',
    MOCK: 'mock'
};

const getProvider = () => {
    if (process.env.GEMINI_API_KEY) return PROVIDERS.GOOGLE;
    if (process.env.HF_API_KEY) return PROVIDERS.HUGGINGFACE;
    if (process.env.GROQ_API_KEY) return PROVIDERS.GROQ;
    return PROVIDERS.MOCK;
};

// --- Google Gemini Implementation ---
let genAI = null;
let googleModel = null;

const initGoogle = () => {
    if (!googleModel && process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        googleModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    }
    return googleModel;
};

const callGoogle = async (prompt) => {
    const model = initGoogle();
    if (!model) throw new Error("Google Gemini não configurado.");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

// --- Hugging Face Implementation ---
const callHuggingFace = async (prompt) => {
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) throw new Error("Hugging Face API Key faltando.");

    // Modelo sugerido: Mistral-7B (bom equilíbrio entre velocidade e qualidade gratuita)
    const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2";

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_ID}`, {
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            inputs: `<s>[INST] ${prompt} [/INST]`, // Formato Instruct do Mistral
            options: { wait_for_model: true },
            parameters: {
                max_new_tokens: 500,
                return_full_text: false
            }
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`HF Error: ${response.status} - ${err}`);
    }

    const result = await response.json();
    // HF retorna array de objetos [{ generated_text: "..." }]
    return Array.isArray(result) ? result[0].generated_text : result.generated_text;
};

// --- Groq Implementation (Llama 3 / Mixtral) ---
const callGroq = async (prompt) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Groq API Key faltando.");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile", // Modelo estável e versátil
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq Error: ${response.status} - ${err}`);
    }

    const json = await response.json();
    return json.choices[0]?.message?.content || "";
};

// --- Main Interface ---

export const generateSuggestion = async (currentText, type, config = {}) => {
    const provider = getProvider();

    const toneInstruction = config.tone ? `Use um tom de voz: ${config.tone} (Formal/Amigável/Informativo).` : '';

    // Prompts Base
    const prompts = {
        'Orçamento': `Atue como um especialista em vendas. ${toneInstruction} Melhore o seguinte texto de orçamento de marcenaria para ser mais persuasivo e profissional. Retorne APENAS o texto melhorado, sem explicações.\n\nTexto original: "${currentText}"`,

        'Pós-venda': `Atue como Customer Success. Melhore esta mensagem de pós-venda para garantir satisfação e pedir indicações. Retorne APENAS o texto melhorado.\n\nTexto original: "${currentText}"`,

        'Dúvidas Frequentes': `Melhore esta resposta técnica para um cliente. Seja claro e direto. Retorne APENAS o texto melhorado.\n\nTexto original: "${currentText}"`
    };

    const prompt = prompts[type] || `Melhore este texto: "${currentText}"`;

    console.log(`[AI Service] Using provider: ${provider}`);

    try {
        switch (provider) {
            case PROVIDERS.GOOGLE:
                return await callGoogle(prompt);
            case PROVIDERS.HUGGINGFACE:
                return await callHuggingFace(prompt);
            case PROVIDERS.GROQ:
                return await callGroq(prompt);
            case PROVIDERS.MOCK:
            default:
                throw new Error("Nenhum provedor de IA configurado (GEMINI_API_KEY, HF_API_KEY ou GROQ_API_KEY).");
        }
    } catch (error) {
        console.error(`Erro no provedor ${provider}:`, error);
        throw error; // Re-throw para o index.js capturar e usar o fallback local se necessário
    }
};

export const chatWithAI = async (message, context) => {
    const provider = getProvider();

    // System Prompt para "Personificação Agente"
    const systemPrompt = `Você é um assistente virtual experiente da marcenaria 'FIVE Ambientes Planejados'.
    Seu objetivo é ajudar a equipe de vendas e atendimento.
    Contexto da conversa: ${JSON.stringify(context || {})}
    
    Responda de forma profissional mas acessível.`;

    // Combine prompt + message
    const prompt = `${systemPrompt}\n\nUsuário: "${message}"\nAssistente:`;

    console.log(`[AI Chat] Using provider: ${provider}`);

    try {
        switch (provider) {
            case PROVIDERS.GOOGLE:
                return await callGoogle(prompt);
            case PROVIDERS.HUGGINGFACE:
                return await callHuggingFace(prompt);
            case PROVIDERS.GROQ:
                return await callGroq(prompt);
            case PROVIDERS.MOCK:
                return "Mock Chat Response: Configure uma API Key para chat real.";
            default:
                throw new Error("Provider Error");
        }
    } catch (error) {
        console.error(`Chat Error (${provider}):`, error);
        throw error;
    }
};
