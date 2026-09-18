import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface RevenueData {
    month: string;
    total: number;
    count: number;
}

interface RevenueChartProps {
    data: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    // Formatar mês para exibição
    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${months[parseInt(month) - 1]}/${year.substr(2)}`;
    };

    const chartData = data.map(item => ({
        month: formatMonth(item.month),
        faturamento: item.total,
        projetos: item.count
    }));

    // Formatar valor em R$
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">
                📊 Faturamento Mensal
            </h3>

            <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: '#666', fontSize: 12 }}
                        />
                        <YAxis
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            formatter={(value: number, name: string) => {
                                if (name === 'faturamento') {
                                    return [formatCurrency(value), 'Faturamento'];
                                }
                                return [value, 'Projetos'];
                            }}
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '10px'
                            }}
                        />
                        <Bar
                            dataKey="faturamento"
                            fill="#d4af37"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                Últimos 6 meses de faturamento
            </div>
        </div>
    );
};

export default RevenueChart;
