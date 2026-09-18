import React from 'react';
import { Users, FileText, CheckCircle, FolderKanban } from 'lucide-react';

interface FunnelData {
    leads: number;
    quotes: number;
    approved: number;
    projects: number;
}

interface ConversionFunnelProps {
    data: FunnelData;
}

const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data }) => {
    const stages = [
        { name: 'Leads', value: data.leads, icon: Users, color: 'from-blue-500 to-blue-600' },
        { name: 'Orçamentos', value: data.quotes, icon: FileText, color: 'from-indigo-500 to-indigo-600' },
        { name: 'Aprovados', value: data.approved, icon: CheckCircle, color: 'from-green-500 to-green-600' },
        { name: 'Projetos', value: data.projects, icon: FolderKanban, color: 'from-amber-500 to-amber-600' }
    ];

    // Calcular porcentagens de conversão
    const getConversionRate = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current / previous) * 100).toFixed(1);
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">
                🎯 Funil de Vendas
            </h3>

            <div className="space-y-3 overflow-y-auto max-h-[280px]">
                {stages.map((stage, index) => {
                    const Icon = stage.icon;
                    const prevValue = index > 0 ? stages[index - 1].value : stage.value;
                    const conversionRate = getConversionRate(stage.value, prevValue);
                    const widthPercent = index === 0 ? 100 : ((stage.value / stages[0].value) * 100);

                    return (
                        <div key={stage.name} className="relative">
                            {/* Barra do funil */}
                            <div
                                className={`bg-gradient-to-r ${stage.color} rounded-lg p-3 transition-all duration-500 hover:scale-[1.02]`}
                                style={{ width: `${widthPercent}%` }}
                            >
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-2">
                                        <Icon size={20} />
                                        <div>
                                            <div className="font-semibold text-sm">{stage.name}</div>
                                            <div className="text-xs opacity-90">
                                                {index > 0 && `${conversionRate}% de conversão`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold">
                                        {stage.value}
                                    </div>
                                </div>
                            </div>

                            {/* Linha de conexão */}
                            {index < stages.length - 1 && (
                                <div className="absolute left-1/2 -translate-x-1/2 h-4 w-0.5 bg-gray-300 dark:bg-gray-600" />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Taxa de conversão geral: <span className="font-bold text-primary">
                        {getConversionRate(data.projects, data.leads)}%
                    </span> (Lead → Projeto)
                </div>
            </div>
        </div>
    );
};

export default ConversionFunnel;
