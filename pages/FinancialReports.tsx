import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, PieChart, BarChart3, Wallet } from 'lucide-react';
import { useToast } from '../src/contexts/ToastContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart as RePieChart, Pie, Cell, LineChart, Line } from 'recharts';
import API_URL from '../src/config/api';
import FinancialNav from '../components/FinancialNav';

const FinancialReports = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('marcenaria_user') || 'null');
    const { error: showError } = useToast();

    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    const [dre, setDre] = useState<any>(null);
    const [monthlyData, setMonthlyData] = useState([]);
    const [cashPosition, setCashPosition] = useState<any>(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadReports();
    }, [dateRange]); // Removed user from dependencies

    const loadReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [dreRes, monthlyRes, cashRes] = await Promise.all([
                fetch(`${API_URL}/api/financial/reports/dre?date_from=${dateRange.from}&date_to=${dateRange.to}`, { headers }),
                fetch(`${API_URL}/api/financial/reports/monthly-comparison?months=6`, { headers }),
                fetch(`${API_URL}/api/financial/reports/cash-position`, { headers })
            ]);

            const dreData = await dreRes.json();
            const monthlyData = await monthlyRes.json();
            const cashData = await cashRes.json();

            setDre(dreData);
            setMonthlyData(monthlyData);
            setCashPosition(cashData);
        } catch (err) {
            console.error('Erro ao carregar relatórios:', err);
            showError('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    // Prepare Monthly Chart Data
    const monthlyChartData = monthlyData.map((m: any) => ({
        month: m.month,
        Receitas: parseFloat(m.revenue || 0),
        Despesas: parseFloat(m.expenses || 0),
        Lucro: parseFloat(m.profit || 0)
    })).reverse();

    // Prepare Revenue Pie Data
    const revenuePieData = dre?.revenue_details?.map((item: any, index: number) => ({
        name: item.category,
        value: parseFloat(item.total),
        color: COLORS[index % COLORS.length]
    })) || [];

    // Prepare Expense Pie Data
    const expensePieData = dre?.expense_details?.map((item: any, index: number) => ({
        name: item.category,
        value: parseFloat(item.total),
        color: COLORS[index % COLORS.length]
    })) || [];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
            <FinancialNav />
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-black text-text-main dark:text-white mb-2">
                    Relatórios Financeiros
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Análises avançadas, DRE e projeções de caixa
                </p>
            </div>

            {/* Date Filter */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-4 mb-6">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Data Inicial
                        </label>
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Data Final
                        </label>
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Cash Position */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Wallet className="text-blue-600" size={24} />
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase">Caixa Atual</h3>
                    </div>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {formatCurrency(cashPosition?.total_cash)}
                    </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-green-600" size={24} />
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase">A Receber</h3>
                    </div>
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">
                        {formatCurrency(cashPosition?.receivables?.total)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {cashPosition?.receivables?.count} parcela(s)
                    </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="text-red-600" size={24} />
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase">A Pagar</h3>
                    </div>
                    <p className="text-2xl font-black text-red-600 dark:text-red-400">
                        {formatCurrency(cashPosition?.payables?.total)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {cashPosition?.payables?.count} conta(s)
                    </p>
                </div>

                <div className={`rounded-xl border p-6 ${(cashPosition?.projected_balance || 0) >= 0
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                        <PieChart className={
                            (cashPosition?.projected_balance || 0) >= 0 ? 'text-purple-600' : 'text-orange-600'
                        } size={24} />
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase">Projetado</h3>
                    </div>
                    <p className={`text-2xl font-black ${(cashPosition?.projected_balance || 0) >= 0
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-orange-600 dark:text-orange-400'
                        }`}>
                        {formatCurrency(cashPosition?.projected_balance)}
                    </p>
                </div>
            </div>

            {/* DRE Summary */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-6 mb-6">
                <h2 className="text-xl font-black text-text-main dark:text-white mb-4">
                    DRE - Demonstração do Resultado do Exercício
                </h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-neutral-700">
                        <span className="font-bold text-gray-700 dark:text-gray-300">Receitas Totais</span>
                        <span className="text-lg font-black text-green-600 dark:text-green-400">
                            {formatCurrency(dre?.summary?.total_revenue)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-neutral-700">
                        <span className="font-bold text-gray-700 dark:text-gray-300">(-) Despesas Totais</span>
                        <span className="text-lg font-black text-red-600 dark:text-red-400">
                            {formatCurrency(dre?.summary?.total_expenses)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg px-4">
                        <span className="font-black text-gray-900 dark:text-white">= Lucro Líquido</span>
                        <span className={`text-2xl font-black ${(dre?.summary?.net_profit || 0) >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                            }`}>
                            {formatCurrency(dre?.summary?.net_profit)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Monthly Comparison Chart */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-6 mb-6">
                <h2 className="text-xl font-black text-text-main dark:text-white mb-4">
                    Evolução Mensal (Últimos 6 Meses)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyChartData}>
                        <XAxis dataKey="month" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="Receitas" fill="#10b981" />
                        <Bar dataKey="Despesas" fill="#ef4444" />
                        <Bar dataKey="Lucro" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Breakdown */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-6">
                    <h2 className="text-xl font-black text-text-main dark:text-white mb-4">
                        Receitas por Categoria
                    </h2>
                    {revenuePieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={250}>
                                <RePieChart>
                                    <Pie
                                        data={revenuePieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {revenuePieData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                </RePieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-2">
                                {dre?.revenue_details?.map((item: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-700 dark:text-gray-300">{item.category}</span>
                                        <span className="font-bold text-green-600">{formatCurrency(item.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Nenhuma receita no período</p>
                    )}
                </div>

                {/* Expense Breakdown */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-6">
                    <h2 className="text-xl font-black text-text-main dark:text-white mb-4">
                        Despesas por Categoria
                    </h2>
                    {expensePieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={250}>
                                <RePieChart>
                                    <Pie
                                        data={expensePieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {expensePieData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                </RePieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-2">
                                {dre?.expense_details?.map((item: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-700 dark:text-gray-300">{item.category}</span>
                                        <span className="font-bold text-red-600">{formatCurrency(item.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Nenhuma despesa no período</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialReports;
