import React, { useState } from 'react';
import { api } from '../src/services/api';
import NewScriptModal from '../components/NewScriptModal';
import AIAssistantContent from '../components/AIAssistantContent';

const Scripts: React.FC = () => {
    const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'saved' | 'ai'>('saved');
    const [aiSuggestion, setAiSuggestion] = useState<string>('Analise seu script para receber sugestões de melhoria com IA.');
    const [loadingAI, setLoadingAI] = useState(false);
    const [scriptTitle, setScriptTitle] = useState('Confirmação de Visita Técnica');
    const [scriptCategory, setScriptCategory] = useState('Orçamento');
    const [scriptContent, setScriptContent] = useState(`Olá [Nome do Cliente], tudo bem?\nGostaria de confirmar nossa visita técnica agendada para amanhã, dia [Data da Visita], no período da manhã.\nPreciso apenas que me confirme se o endereço continua o mesmo e se haverá alguém no local para nos receber.\nFico no aguardo.\nAtenciosamente,\nMarcenaria Manager`);

    const getAISuggestion = async () => {
        setLoadingAI(true);
        try {
            const data = await api.ai.getSuggestion(JSON.stringify({ current_text: scriptContent, type: scriptCategory }));
            setAiSuggestion(data.suggestion || 'Nenhuma sugestão disponível.');
        } catch (error) {
            console.error('Erro de IA:', error);
            setAiSuggestion('Erro ao conectar com o servidor de IA.');
        } finally {
            setLoadingAI(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
            <NewScriptModal isOpen={isScriptModalOpen} onClose={() => setIsScriptModalOpen(false)} />

            {/* Header Tabs */}
            <div className="flex items-center gap-6 px-6 pt-6 border-b border-[#e7dbcf] dark:border-neutral-800 bg-surface-light dark:bg-surface-dark shrink-0">
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'saved'
                        ? 'border-primary dark:border-gold text-primary dark:text-gold'
                        : 'border-transparent text-text-muted hover:text-primary dark:hover:text-gold'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">description</span>
                    Meus Scripts
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ai'
                        ? 'border-primary dark:border-gold text-primary dark:text-gold'
                        : 'border-transparent text-text-muted hover:text-primary dark:hover:text-gold'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                    Assistente IA
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'saved' ? (
                <div className="flex-1 flex overflow-hidden">
                    {/* Scripts Sidebar */}
                    <aside className="w-full max-w-[320px] flex flex-col border-r border-[#e7dbcf] dark:border-neutral-800 bg-[#f8f6f4] dark:bg-[#1c1611]">
                        <div className="p-4 border-b border-[#e7dbcf] dark:border-neutral-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl font-bold">Scripts Salvos</h1>
                                <button
                                    onClick={() => setIsScriptModalOpen(true)}
                                    className="flex items-center justify-center rounded-lg size-8 hover:bg-primary/10 text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined">create_new_folder</span>
                                </button>
                            </div>
                            <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors material-symbols-outlined">search</span>
                                <input className="w-full bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" placeholder="Buscar scripts..." type="text" />
                            </div>
                            <button
                                onClick={() => setIsScriptModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-hover transition-all active:scale-[0.98]"
                            >
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                <span>Novo Script</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Orçamento</h3>
                                    <span className="bg-gray-200 dark:bg-neutral-800 text-[10px] font-bold px-1.5 py-0.5 rounded text-text-muted">2</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="group flex flex-col p-3 rounded-xl bg-white dark:bg-surface-dark border-l-4 border-primary shadow-sm cursor-pointer relative overflow-hidden transition-all hover:shadow-md">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-sm">Confirmação de Visita</h4>
                                            <span className="material-symbols-outlined text-[16px] text-primary">edit_square</span>
                                        </div>
                                        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">Olá [Nome do Cliente], tudo bem? Gostaria de confirmar nossa visita técnica para amanhã...</p>
                                    </div>
                                    <div className="group flex flex-col p-3 rounded-xl hover:bg-white dark:hover:bg-surface-dark border border-transparent hover:border-[#e7dbcf] dark:hover:border-neutral-800 cursor-pointer transition-all">
                                        <h4 className="font-medium text-sm">Orçamento Inicial</h4>
                                        <p className="text-xs text-text-muted line-clamp-2 opacity-70">Aqui está uma estimativa inicial...</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Pós-venda</h3>
                                    <span className="bg-gray-200 dark:bg-neutral-800 text-[10px] font-bold px-1.5 py-0.5 rounded text-text-muted">1</span>
                                </div>
                                <div className="group flex flex-col p-3 rounded-xl hover:bg-white dark:hover:bg-surface-dark border border-transparent hover:border-[#e7dbcf] dark:hover:border-neutral-800 cursor-pointer transition-all">
                                    <h4 className="font-medium text-sm">Follow-up 3 dias</h4>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Editor */}
                    <section className="flex-1 flex flex-col h-full overflow-hidden relative">
                        <div className="border-b border-[#e7dbcf] dark:border-neutral-800 bg-surface-light dark:bg-surface-dark p-6 pb-4 shrink-0">
                            <div className="max-w-4xl mx-auto w-full">
                                <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">Título do Script</label>
                                        <input
                                            className="w-full text-xl font-bold bg-transparent border-0 border-b-2 border-[#e7dbcf] dark:border-neutral-800 focus:border-primary focus:ring-0 px-0 py-2 transition-colors"
                                            type="text"
                                            value={scriptTitle}
                                            onChange={e => setScriptTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-64">
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wide mb-1.5">Categoria</label>
                                        <div className="relative">
                                            <select
                                                className="w-full appearance-none bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-800 rounded-lg py-2.5 px-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                                                value={scriptCategory}
                                                onChange={e => setScriptCategory(e.target.value)}
                                            >
                                                <option>Orçamento</option>
                                                <option>Pós-venda</option>
                                                <option>Dúvidas Frequentes</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-lg">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Suggestion Box */}
                                <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10 border border-purple-100 dark:border-indigo-800/30 rounded-xl p-4 relative overflow-hidden group">
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="bg-white/80 dark:bg-indigo-900/50 p-2.5 rounded-xl text-purple-600 dark:text-purple-400 shrink-0 shadow-sm">
                                            <span className="material-symbols-outlined">auto_awesome</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <h3 className="font-bold text-sm text-purple-900 dark:text-purple-100 flex items-center gap-2">
                                                    Assistente de Escrita IA
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded text-purple-700 dark:text-purple-300">Inteligente</span>
                                                </h3>
                                            </div>
                                            <p className="text-xs text-text-muted mb-3 leading-relaxed">
                                                {loadingAI ? 'Aguarde, gerando sugestão baseada no seu contexto...' : 'Use nossa IA para otimizar seu roteiro de conversa.'}
                                            </p>
                                            {aiSuggestion && (
                                                <div className="bg-white/60 dark:bg-black/20 border border-purple-100 dark:border-indigo-800/30 rounded-lg p-3 mb-3 text-sm italic animate-fade-in">
                                                    "{aiSuggestion}"
                                                </div>
                                            )}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={getAISuggestion}
                                                    disabled={loadingAI}
                                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">{loadingAI ? 'sync' : 'refresh'}</span>
                                                    {loadingAI ? 'Analisando...' : 'Gerar Nova Sugestão'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 pt-0">
                            <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
                                <textarea
                                    className="w-full flex-1 resize-none bg-white dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 border-t-0 rounded-b-xl p-6 text-base leading-relaxed focus:outline-none focus:ring-0 shadow-sm"
                                    placeholder="Digite seu script aqui..."
                                    value={scriptContent}
                                    onChange={e => setScriptContent(e.target.value)}
                                ></textarea>
                                <div className="py-6 flex justify-between items-center shrink-0">
                                    <button className="text-red-500 hover:text-red-600 font-bold text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <span className="material-symbols-outlined text-[20px]">delete</span> Excluir Script
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <button className="px-6 py-2.5 rounded-lg border border-[#e7dbcf] dark:border-neutral-800 font-bold text-sm hover:bg-gray-100 dark:hover:bg-neutral-800">Cancelar</button>
                                        <button className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-hover flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[20px]">save</span> Salvar Script
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden">
                    <AIAssistantContent />
                </div>
            )}
        </div>
    );
};

export default Scripts;