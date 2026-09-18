import React, { useState, useEffect } from 'react';
import { api } from '../src/services/api';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TrainingExample {
    question: string;
    answer: string;
}

interface AIConfig {
    tone: 'formal' | 'amigavel' | 'informativo';
    priority_topics: string[];
    training_examples: TrainingExample[];
}

const SettingsAI: React.FC = () => {
    const queryClient = useQueryClient();
    const [simulatorInput, setSimulatorInput] = useState('');
    const [simulatorHistory, setSimulatorHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: 'Olá! Sou seu assistente virtual. Como posso ajudar com os orçamentos hoje?' }
    ]);
    const [loadingSim, setLoadingSim] = useState(false);

    // Fetch Settings
    const { data: config, isLoading } = useQuery<AIConfig>({
        queryKey: ['aiSettings'],
        queryFn: async () => {
            // Using typed service method
            return await api.ai.getSettings();
        },
        initialData: {
            tone: 'amigavel',
            priority_topics: [],
            training_examples: []
        }
    });

    // Save Settings Mutation
    const updateSettings = useMutation({
        mutationFn: async (newConfig: AIConfig) => {
            await api.ai.saveSettings(newConfig);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aiSettings'] });
            toast.success('Configurações salvas!');
        },
        onError: () => toast.error('Erro ao salvar configurações.')
    });

    // Simulator Mutation
    const sendMessage = async () => {
        if (!simulatorInput.trim()) return;

        const userMsg = simulatorInput;
        setSimulatorHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setSimulatorInput('');
        setLoadingSim(true);

        try {
            const data = await api.ai.chat(userMsg, { source: 'simulator' });
            setSimulatorHistory(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch (error) {
            toast.error('Erro na resposta da IA');
            setSimulatorHistory(prev => [...prev, { role: 'ai', content: 'Erro ao conectar com o cérebro da IA.' }]);
        } finally {
            setLoadingSim(false);
        }
    };

    const handleToneChange = (tone: AIConfig['tone']) => {
        updateSettings.mutate({ ...config, tone });
    };

    const toggleTopic = (topic: string) => {
        const current = config.priority_topics || [];
        const newTopics = current.includes(topic)
            ? current.filter(t => t !== topic)
            : [...current, topic];
        updateSettings.mutate({ ...config, priority_topics: newTopics });
    };

    const addExample = (q: string, a: string) => {
        if (!q || !a) return;
        const newEx = [...(config.training_examples || []), { question: q, answer: a }];
        updateSettings.mutate({ ...config, training_examples: newEx });
    };

    const removeExample = (index: number) => {
        const newEx = [...(config.training_examples || [])];
        newEx.splice(index, 1);
        updateSettings.mutate({ ...config, training_examples: newEx });
    };

    const [newQ, setNewQ] = useState('');
    const [newA, setNewA] = useState('');

    if (isLoading) return <div className="p-8">Carregando configurações...</div>;

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background-light dark:bg-background-dark">
            <header className="shrink-0 px-6 py-5 border-b border-[#e7dbcf] dark:border-neutral-800 flex justify-between items-center bg-background-light dark:bg-background-dark z-10">
                <div>
                    <h1 className="text-2xl font-black leading-tight">Configuração da IA</h1>
                    <p className="text-text-muted text-sm mt-1">Personalize o comportamento, treine o modelo e monitore resultados.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-surface-dark px-3 py-1.5 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-bold">IA Ativada (Groq/Llama3)</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 pb-10">
                        {/* General Preferences */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary">tune</span>
                                <h2 className="text-lg font-bold">Preferências Gerais</h2>
                            </div>
                            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-[#e7dbcf] dark:border-neutral-800 flex flex-col gap-6">
                                <div>
                                    <label className="block text-sm font-bold mb-3">Tom de Voz</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => handleToneChange('formal')}
                                            className={`flex flex-col items-center justify-center gap-2 px-2 py-3 rounded-lg text-xs font-bold transition-all border ${config.tone === 'formal' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-neutral-800 border-[#e7dbcf] dark:border-neutral-700'}`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">business_center</span> Formal
                                        </button>
                                        <button
                                            onClick={() => handleToneChange('amigavel')}
                                            className={`flex flex-col items-center justify-center gap-2 px-2 py-3 rounded-lg text-xs font-bold transition-all border ${config.tone === 'amigavel' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-neutral-800 border-[#e7dbcf] dark:border-neutral-700'}`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span> Amigável
                                        </button>
                                        <button
                                            onClick={() => handleToneChange('informativo')}
                                            className={`flex flex-col items-center justify-center gap-2 px-2 py-3 rounded-lg text-xs font-bold transition-all border ${config.tone === 'informativo' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-neutral-800 border-[#e7dbcf] dark:border-neutral-700'}`}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">info</span> Informativo
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-3">Priorizar Perguntas Sobre (Contexto)</label>
                                    <div className="space-y-2">
                                        {['Orçamentos e Preços', 'Agendamento de Visitas'].map(opt => (
                                            <label key={opt} className="flex items-center p-2 rounded-lg border border-[#e7dbcf] dark:border-neutral-800 bg-white dark:bg-neutral-900 cursor-pointer hover:border-primary/50">
                                                <input
                                                    type="checkbox"
                                                    checked={config.priority_topics?.includes(opt)}
                                                    onChange={() => toggleTopic(opt)}
                                                    className="rounded text-primary focus:ring-primary border-gray-300 dark:border-neutral-600"
                                                />
                                                <span className="ml-3 text-sm">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Training */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary">model_training</span>
                                <h2 className="text-lg font-bold">Treinamento da IA</h2>
                            </div>
                            <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-[#e7dbcf] dark:border-neutral-800 flex flex-col gap-4">
                                <div>
                                    <h3 className="text-sm font-bold mb-2">Adicionar Exemplo</h3>
                                    <div className="space-y-3">
                                        <input
                                            value={newQ}
                                            onChange={e => setNewQ(e.target.value)}
                                            type="text"
                                            className="w-full text-sm rounded-lg border-[#e7dbcf] dark:border-neutral-700 dark:bg-neutral-900 focus:ring-primary focus:border-primary"
                                            placeholder="Ex: Qual o prazo de entrega?"
                                        />
                                        <textarea
                                            value={newA}
                                            onChange={e => setNewA(e.target.value)}
                                            className="w-full text-sm rounded-lg border-[#e7dbcf] dark:border-neutral-700 dark:bg-neutral-900 focus:ring-primary focus:border-primary"
                                            placeholder="Ex: Em média 25 dias úteis..."
                                            rows={2}
                                        ></textarea>
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => { addExample(newQ, newA); setNewQ(''); setNewA(''); }}
                                                className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                                            >
                                                Adicionar Treinamento
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 space-y-2">
                                    <h3 className="text-sm font-bold text-text-muted">Exemplos Ativos</h3>
                                    {config.training_examples?.map((ex, i) => (
                                        <div key={i} className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-[#e7dbcf] dark:border-neutral-800 text-xs relative group">
                                            <button onClick={() => removeExample(i)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-[16px]">close</span></button>
                                            <p className="font-bold mb-1">P: {ex.question}</p>
                                            <p className="text-text-muted">R: {ex.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full gap-6">
                        {/* Stats */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary">monitoring</span>
                                <h2 className="text-lg font-bold">Monitoramento (Mock)</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { title: 'Sugestões Aceitas', val: '87%', icon: 'check_circle', color: 'green' },
                                    { title: 'Tempo Economizado', val: '14h', icon: 'schedule', color: 'blue' },
                                    { title: 'Satisfação', val: '4.8/5', icon: 'thumb_up', color: 'purple' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center text-${stat.color}-600`}>
                                            <span className="material-symbols-outlined">{stat.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{stat.title}</p>
                                            <p className="text-2xl font-black">{stat.val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Simulator */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">science</span>
                                    <h2 className="text-lg font-bold">Ambiente de Teste (Live)</h2>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 overflow-hidden shadow-sm h-[500px]">
                                <div className="px-4 py-3 border-b border-[#e7dbcf] dark:border-neutral-700 bg-surface-light dark:bg-surface-dark flex items-center gap-3">
                                    <div className="bg-primary/10 p-1.5 rounded-full"><span className="material-symbols-outlined text-primary text-lg">smart_toy</span></div>
                                    <div><p className="text-sm font-bold">Simulador com suas Configurações</p><p className="text-xs text-text-muted">Teste o tom de voz e treinamento agora</p></div>
                                </div>
                                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">

                                    {simulatorHistory.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                                            {msg.role === 'ai' && (
                                                <div className="w-8 h-8 rounded-full bg-primary/20 shrink-0 flex items-center justify-center border border-primary/30">
                                                    <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                                                </div>
                                            )}
                                            <div className={`${msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-700'} p-4 rounded-2xl ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'} shadow-sm max-w-[80%]`}>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {loadingSim && (
                                        <div className="flex justify-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 shrink-0 flex items-center justify-center">
                                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                            <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl rounded-tl-sm border border-[#e7dbcf] dark:border-neutral-700">
                                                <p className="text-sm italic text-text-muted">Digitando...</p>
                                            </div>
                                        </div>
                                    )}

                                </div>
                                <div className="p-4 bg-surface-light dark:bg-surface-dark border-t border-[#e7dbcf] dark:border-neutral-700">
                                    <div className="relative flex items-end gap-2">
                                        <input
                                            value={simulatorInput}
                                            onChange={e => setSimulatorInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                            type="text"
                                            className="flex-1 bg-background-light dark:bg-background-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-700 py-3 px-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                                            placeholder="Digite para simular..."
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={loadingSim}
                                            className="h-[46px] w-[46px] bg-primary hover:bg-primary-hover text-white rounded-xl flex items-center justify-center shadow-md disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined">send</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsAI;


