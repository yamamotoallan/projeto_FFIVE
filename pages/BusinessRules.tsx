import React, { useState } from 'react';
import { BusinessRule } from '../types';

const INITIAL_RULES: BusinessRule[] = [
    { stage: 'Refinamento', deadlineDays: 3, alertBeforeDays: 1 },
    { stage: 'Recorte', deadlineDays: 2, alertBeforeDays: 1 },
    { stage: 'Montagem', deadlineDays: 5, alertBeforeDays: 2 },
    { stage: 'Logística', deadlineDays: 2, alertBeforeDays: 1 },
    { stage: 'Instalação', deadlineDays: 3, alertBeforeDays: 1 },
    { stage: 'Entregue', deadlineDays: 1, alertBeforeDays: 0 },
    { stage: 'Pós-vendas', deadlineDays: 30, alertBeforeDays: 5 },
];

const BusinessRules: React.FC = () => {
    const [rules, setRules] = useState<BusinessRule[]>(INITIAL_RULES);

    const handleUpdateRule = (stage: string, field: keyof BusinessRule, value: number) => {
        setRules(prev => prev.map(r =>
            r.stage === stage ? { ...r, [field]: value } : r
        ));
    };

    const handleSave = () => {
        // Implement save logic (API call or localStorage)
        alert('Regras de negócio salvas com sucesso!');
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
            <header className="shrink-0 px-8 py-5 border-b border-border-light dark:border-border-dark bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black leading-tight">Prazos e Regras de Negócio</h1>
                    <p className="text-text-muted text-sm mt-1">Configure os prazos padrão para cada etapa do projeto e alertas automáticos.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-primary-hover flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">save</span> Salvar Configurações
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-background-light dark:bg-neutral-800 border-b border-border-light dark:border-border-dark">
                                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider w-1/3">Etapa do Projeto</th>
                                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider w-1/4">Prazo Padrão (Dias)</th>
                                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider w-1/4">Alertar Antes de (Dias)</th>
                                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                {rules.map((rule) => (
                                    <tr key={rule.stage} className="hover:bg-background-light dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-sm">{rule.stage}</div>
                                            <div className="text-xs text-text-muted">
                                                {rule.stage === 'Refinamento' && 'Detalhamento técnico com projetista'}
                                                {rule.stage === 'Recorte' && 'Corte de chapas na fábrica'}
                                                {rule.stage === 'Pós-vendas' && 'Contato de satisfação após entrega'}
                                                {/* Add other descriptions as needed */}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={rule.deadlineDays}
                                                    onChange={(e) => handleUpdateRule(rule.stage, 'deadlineDays', parseInt(e.target.value))}
                                                    className="w-20 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary text-center"
                                                />
                                                <span className="text-xs text-text-muted font-medium">dias</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={rule.deadlineDays}
                                                    value={rule.alertBeforeDays}
                                                    onChange={(e) => handleUpdateRule(rule.stage, 'alertBeforeDays', parseInt(e.target.value))}
                                                    className="w-20 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary text-center"
                                                />
                                                <span className="text-xs text-text-muted font-medium">dias antes</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Ativo
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-primary text-2xl">notifications_active</span>
                            <h3 className="font-bold text-lg">Canais de Notificação</h3>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-3 rounded-lg border border-border-light dark:border-border-dark cursor-pointer hover:bg-background-light dark:hover:bg-neutral-800">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-600">chat</span>
                                    <span className="text-sm font-bold">WhatsApp</span>
                                </div>
                                <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-lg border border-border-light dark:border-border-dark cursor-pointer hover:bg-background-light dark:hover:bg-neutral-800">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-blue-600">mail</span>
                                    <span className="text-sm font-bold">E-mail</span>
                                </div>
                                <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-lg border border-border-light dark:border-border-dark cursor-pointer hover:bg-background-light dark:hover:bg-neutral-800">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-orange-600">notifications</span>
                                    <span className="text-sm font-bold">Sistema (Dashboard)</span>
                                </div>
                                <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary" />
                            </label>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/30">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">info</span>
                            <h3 className="font-bold text-lg text-blue-800 dark:text-blue-200">Como Funciona</h3>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed mb-4">
                            Ao definir os prazos aqui, o sistema calculará automaticamente a data de entrega prevista para cada etapa do projeto assim que ele for movido no Kanban.
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                            Os alertas serão enviados para o responsável pelo projeto nos canais selecionados quando o prazo estiver próximo do vencimento, ajudando a evitar atrasos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessRules;
