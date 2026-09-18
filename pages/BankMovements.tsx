import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, TrendingUp, TrendingDown, Plus, Calendar, Filter, ArrowRight } from 'lucide-react';
import API_URL from '../src/config/api';
import BankMovementModal from '../components/BankMovementModal';
import FinancialNav from '../components/FinancialNav';

const BankMovements = () => {
    const [loading, setLoading] = useState(true);
    const [movements, setMovements] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Filters
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [selectedAccount, setSelectedAccount] = useState('');

    useEffect(() => {
        loadData();
    }, [dateRange, selectedAccount]);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [movementsRes, accountsRes] = await Promise.all([
                fetch(`${API_URL}/api/financial/movements?date_from=${dateRange.from}&date_to=${dateRange.to}&account_id=${selectedAccount}`, { headers }),
                fetch(`${API_URL}/api/financial/bank-accounts`, { headers })
            ]);

            const movementsData = await movementsRes.json();
            const accountsData = await accountsRes.json();

            setMovements(movementsData);
            setBankAccounts(accountsData);
        } catch (error) {
            console.error('Error loading movements:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark min-h-screen">
            <FinancialNav />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ArrowLeftRight className="text-primary" />
                            Movimentações Bancárias
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Transferências entre contas e ajustes de saldo
                        </p>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-wrap items-center gap-4 mb-6 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-800 p-2 rounded-lg border border-gray-200 dark:border-neutral-700">
                        <Calendar size={18} className="text-gray-500" />
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 dark:text-gray-300"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 dark:text-gray-300"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-800 p-2 rounded-lg border border-gray-200 dark:border-neutral-700 min-w-[200px]">
                        <Filter size={18} className="text-gray-500" />
                        <select
                            value={selectedAccount}
                            onChange={e => setSelectedAccount(e.target.value)}
                            className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 dark:text-gray-300 w-full"
                        >
                            <option value="">Todas as Contas</option>
                            {bankAccounts.map((acc: any) => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="ml-auto bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/25"
                    >
                        <Plus size={20} />
                        Nova Movimentação
                    </button>
                </div>

                {/* Movements Table */}
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Origem</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Destino</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            Carregando movimentações...
                                        </td>
                                    </tr>
                                ) : movements.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            Nenhuma movimentação encontrada no período.
                                        </td>
                                    </tr>
                                ) : (
                                    movements.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {new Date(item.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {item.type === 'transfer' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                                                        <ArrowLeftRight size={12} />
                                                        Transferência
                                                    </span>
                                                )}
                                                {item.type === 'adjustment_in' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-900/50">
                                                        <TrendingUp size={12} />
                                                        Entrada (Ajuste)
                                                    </span>
                                                )}
                                                {item.type === 'adjustment_out' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                                                        <TrendingDown size={12} />
                                                        Saída (Ajuste)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {item.origin_account_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {item.destination_account_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                                {item.description || 'Sem descrição'}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(item.amount)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <BankMovementModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={loadData}
                bankAccounts={bankAccounts}
            />
        </div>
    );
};

export default BankMovements;
