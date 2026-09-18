import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface CashFlowChartProps {
    data: Array<{
        date: string;
        income: number;
        expense: number;
        balance: number;
    }>;
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
    // Transform data for chart
    const chartData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        Receitas: typeof item.income === 'string' ? parseFloat(item.income) : item.income,
        Despesas: typeof item.expense === 'string' ? parseFloat(item.expense) : item.expense,
        Saldo: typeof item.balance === 'string' ? parseFloat(item.balance) : item.balance
    }));

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
                <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-neutral-700" />
                <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    className="dark:stroke-neutral-400"
                    style={{ fontSize: '12px' }}
                />
                <YAxis
                    stroke="#6b7280"
                    className="dark:stroke-neutral-400"
                    style={{ fontSize: '12px' }}
                    tickFormatter={formatCurrency}
                />
                <Tooltip
                    formatter={formatCurrency}
                    contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e7dbcf',
                        borderRadius: '8px',
                        padding: '8px'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Legend
                    wrapperStyle={{ paddingTop: '16px' }}
                    iconType="line"
                />
                <Area
                    type="monotone"
                    dataKey="Receitas"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorIncome)"
                />
                <Area
                    type="monotone"
                    dataKey="Despesas"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#colorExpense)"
                />
                <Line
                    type="monotone"
                    dataKey="Saldo"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default CashFlowChart;
