import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const AIAssistantContent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Olá! Sou o assistente de IA da Marcenaria Pro. Como posso ajudá-lo hoje? Posso auxiliar com scripts de vendas, análise de orçamentos, sugestões de follow-up e muito mais.',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const predefinedCommands = [
        { id: '1', icon: 'psychology', title: 'Sugerir Follow-up', description: 'Gere mensagens de follow-up para leads' },
        { id: '2', icon: 'analytics', title: 'Analisar Orçamento', description: 'Analise viabilidade e margem de lucro' },
        { id: '3', icon: 'script', title: 'Script de Vendas', description: 'Crie scripts personalizados para abordagem' },
        { id: '4', icon: 'lightbulb', title: 'Ideias de Projeto', description: 'Sugestões criativas para projetos' },
    ];

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simular resposta da IA
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: generateMockResponse(input),
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const generateMockResponse = (userInput: string): string => {
        const lowerInput = userInput.toLowerCase();

        if (lowerInput.includes('follow') || lowerInput.includes('mensagem')) {
            return `Aqui está uma sugestão de follow-up:\n\n"Olá [Nome do Cliente],\n\nEspero que esteja bem! Gostaria de retomar nossa conversa sobre o projeto de [tipo de projeto].\n\nJá tive a oportunidade de desenvolver algumas ideias que acredito que vão te interessar. Que tal agendarmos uma conversa rápida esta semana?\n\nFico à disposição!\n\nAtenciosamente,\n[Seu Nome]"`;
        }

        if (lowerInput.includes('orçamento') || lowerInput.includes('preço')) {
            return `Análise de Orçamento:\n\n✓ Margem de lucro: Saudável (entre 30-40%)\n✓ Preço competitivo: Está 15% abaixo da média do mercado\n✓ Tempo de execução: Realista para o escopo\n\n⚠️ Atenção: Considere adicionar uma cláusula de reajuste para projetos com prazo superior a 60 dias.`;
        }

        if (lowerInput.includes('script') || lowerInput.includes('venda')) {
            return `Script de Vendas Sugerido:\n\n1. Abertura: "Olá! Sei que você está buscando [solução]. Já ajudei dezenas de clientes com projetos similares."\n\n2. Descoberta: "Me conta mais sobre o que você tem em mente? Qual o objetivo principal deste projeto?"\n\n3. Apresentação: "Baseado no que você me contou, tenho algumas ideias que vão transformar o espaço..."\n\n4. Fechamento: "Vou preparar um orçamento personalizado. Quando podemos nos reunir para apresentá-lo?"`;
        }

        return `Entendi sua solicitação sobre "${userInput}". Posso ajudá-lo com:\n\n• Análise detalhada\n• Sugestões personalizadas\n• Scripts e templates\n• Insights baseados em dados\n\nPoderia me dar mais detalhes sobre o que você precisa especificamente?`;
    };

    const handleCommandClick = (command: typeof predefinedCommands[0]) => {
        let commandText = '';
        switch (command.id) {
            case '1':
                commandText = 'Gere uma mensagem de follow-up profissional para um lead que visitou nossa loja há 3 dias interessado em cozinha planejada';
                break;
            case '2':
                commandText = 'Analise um orçamento de R$ 25.000 para armários planejados de quarto, considerando 15 dias de trabalho e R$ 12.000 de material';
                break;
            case '3':
                commandText = 'Crie um script de vendas para abordar um cliente interessado em home office planejado';
                break;
            case '4':
                commandText = 'Sugira ideias criativas para otimizar espaço em apartamento pequeno usando marcenaria';
                break;
        }
        setInput(commandText);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full w-full p-6 gap-6 overflow-hidden">
            {/* Quick Commands */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {predefinedCommands.map((command) => (
                    <button
                        key={command.id}
                        onClick={() => handleCommandClick(command)}
                        className="p-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl hover:border-primary dark:hover:border-gold transition-all text-left group"
                    >
                        <span className="material-symbols-outlined text-primary dark:text-gold text-3xl mb-2 group-hover:scale-110 transition-transform inline-block">
                            {command.icon}
                        </span>
                        <h3 className="font-bold text-sm mb-1">{command.title}</h3>
                        <p className="text-xs text-text-muted dark:text-text-dark-muted">{command.description}</p>
                    </button>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden flex flex-col min-h-0 shadow-sm transition-all">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div
                                className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${message.role === 'user'
                                    ? 'bg-primary dark:bg-gold'
                                    : 'bg-gradient-to-br from-primary to-primary-hover dark:from-gold dark:to-gold-light'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-white text-[20px]">
                                    {message.role === 'user' ? 'person' : 'smart_toy'}
                                </span>
                            </div>
                            <div className={`flex-1 max-w-[70%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                <div
                                    className={`px-4 py-3 rounded-2xl ${message.role === 'user'
                                        ? 'bg-primary dark:bg-gold text-white rounded-br-sm'
                                        : 'bg-background-light dark:bg-background-dark rounded-bl-sm'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                                <span className="text-[10px] text-text-muted dark:text-text-dark-muted px-2">
                                    {formatTime(message.timestamp)}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover dark:from-gold dark:to-gold-light flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-white text-[20px]">smart_toy</span>
                            </div>
                            <div className="bg-background-light dark:bg-background-dark px-4 py-3 rounded-2xl rounded-bl-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-text-muted dark:bg-text-dark-muted rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-text-muted dark:bg-text-dark-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-2 h-2 bg-text-muted dark:bg-text-dark-muted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-primary dark:focus:border-gold outline-none transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="px-6 py-3 bg-primary dark:bg-gold text-white rounded-xl hover:bg-primary-hover dark:hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">send</span>
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistantContent;
