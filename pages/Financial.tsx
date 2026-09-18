import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar, Plus, Filter, ArrowLeftRight } from 'lucide-react';
import { useToast } from '../src/contexts/ToastContext';
import TransactionModal from '../components/TransactionModal';
import TransactionDetailsModal from '../components/TransactionDetailsModal';
import CashFlowChart from '../components/CashFlowChart';
import API_URL from '../src/config/api';
import FinancialNav from '../components/FinancialNav';

const Financial = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('marcenaria_user') || 'null');
    const { success, error } = useToast();

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [categories, setCategories] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [cashFlow, setCashFlow] = useState([]);
    const [quotes, setQuotes] = useState([]); // List of projects/quotes
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState(''); // Filter state

    // Filters & Modal states
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [editTransaction, setEditTransaction] = useState(null); // Transaction to edit
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadFinancialData();
    }, [dateRange, selectedSupplierId]); // Added selectedSupplierId

    const loadFinancialData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const supplierQuery = selectedSupplierId ? `&supplier_id=${selectedSupplierId}` : '';

            // Fetch all data in parallel
            const [summaryRes, transactionsRes, categoriesRes, accountsRes, cashFlowRes, quotesRes, suppliersRes] = await Promise.all([
                fetch(`${API_URL}/api/financial/summary?date_from=${dateRange.from}&date_to=${dateRange.to}`, { headers }),
                fetch(`${API_URL}/api/financial/transactions?date_from=${dateRange.from}&date_to=${dateRange.to}${supplierQuery}`, { headers }),
                fetch(`${API_URL}/api/financial/categories`, { headers }),
                fetch(`${API_URL}/api/financial/bank-accounts`, { headers }),
                fetch(`${API_URL}/api/financial/cash-flow?date_from=${dateRange.from}&date_to=${dateRange.to}`, { headers }),
                fetch(`${API_URL}/api/quotes`, { headers }),
                fetch(`${API_URL}/api/financial/suppliers`, { headers })
            ]);

            const summaryData = await summaryRes.json();
            const transactionsData = await transactionsRes.json();
            const categoriesData = await categoriesRes.json();
            const accountsData = await accountsRes.json();
            const cashFlowData = await cashFlowRes.json();
            const quotesData = await quotesRes.json();
            const suppliersData = await suppliersRes.json();

            setSummary(summaryData);
            setTransactions(transactionsData);
            setCategories(categoriesData);
            setBankAccounts(accountsData);
            setCashFlow(cashFlowData);
            setQuotes(quotesData);
            setSuppliers(suppliersData);
        } catch (err) {
            console.error('Erro ao carregar dados financeiros:', err);
            error('Erro ao carregar dados financeiros');
        } finally {
            setLoading(false);
        }
    };


    const handleTransactionSaved = () => {
        setShowTransactionModal(false);
        setEditTransaction(null); // Clear edit state
        loadFinancialData();
        success(editTransaction ? 'Transação atualizada com sucesso!' : 'Transação salva com sucesso!');
    };

    const handleEdit = (transaction: any) => {
        setEditTransaction(transaction);
        setShowTransactionModal(true);
    };

    const handleDeleteTransaction = async (id: any) => {
        if (!confirm('Deseja realmente excluir esta transação?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/financial/transactions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                success('Transação excluída com sucesso!');
                loadFinancialData();
            } else {
                error('Erro ao excluir transação');
            }
        } catch (err) {
            console.error('Erro ao excluir:', err);
            error('Erro ao excluir transação');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const totalIncome = summary?.summary?.total_income || 0;
    const totalExpense = summary?.summary?.total_expense || 0;
    const netBalance = summary?.summary?.net_balance || 0;

    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Fixed Header */}
            <div className="flex-none w-full bg-background-light dark:bg-background-dark z-10 shadow-sm border-b dark:border-neutral-800">
                <div className="max-w-7xl mx-auto p-6 pb-0 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row justify-between items-center pb-4 gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-text-main dark:text-white mb-2">
                                Financeiro
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Controle completo do fluxo de caixa e finanças da marcenaria
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-end">
                            <button
                                onClick={() => navigate('/financeiro')}
                                className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${location.pathname === '/financeiro'
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                    }`}
                            >
                                <Wallet size={20} />
                                Cadastro Financeiro
                            </button>
                            <button
                                onClick={() => navigate('/financeiro/movimentacoes')}
                                className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${location.pathname === '/financeiro/movimentacoes'
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700'
                                    }`}
                            >
                                <ArrowLeftRight size={20} />
                                Movimentações
                            </button>

                            <div className="w-px h-8 bg-gray-300 dark:bg-neutral-700 mx-1 hidden md:block"></div>

                            <a
                                href="#/financeiro/recebiveis"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                                <span className="hidden lg:inline">A Receber</span>
                                <span className="lg:hidden">Receber</span>
                            </a>
                            <a
                                href="#/financeiro/pagar"
                                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                <span className="hidden lg:inline">A Pagar</span>
                                <span className="lg:hidden">Pagar</span>
                            </a>
                            <a
                                href="#/financeiro/relatorios"
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">analytics</span>
                                <span className="hidden lg:inline">Relatórios</span>
                                <span className="lg:hidden">Relat.</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 w-full">
                <div className="max-w-7xl mx-auto pb-20 animate-fade-in">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Income Card */}
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-green-600 p-3 rounded-lg">
                                    <TrendingUp className="text-white" size={24} />
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                                Receitas
                            </h3>
                            <p className="text-3xl font-black text-green-600 dark:text-green-400">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
                            </p>
                        </div>

                        {/* Expense Card */}
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-red-600 p-3 rounded-lg">
                                    <TrendingDown className="text-white" size={24} />
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                                Despesas
                            </h3>
                            <p className="text-3xl font-black text-red-600 dark:text-red-400">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
                            </p>
                        </div>

                        {/* Balance Card */}
                        <div className={`${netBalance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'} rounded-xl border ${netBalance >= 0 ? 'border-blue-200 dark:border-blue-800' : 'border-orange-200 dark:border-orange-800'} p-6`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${netBalance >= 0 ? 'bg-blue-600' : 'bg-orange-600'} p-3 rounded-lg`}>
                                    <Wallet className="text-white" size={24} />
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                                Saldo Líquido
                            </h3>
                            <p className={`text-3xl font-black ${netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netBalance)}
                            </p>
                        </div>
                    </div>

                    {/* Cash Flow Chart */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-6 shadow-sm mb-6">
                        <h2 className="text-lg font-black text-text-main dark:text-white mb-4">
                            Fluxo de Caixa (Últimos 30 dias)
                        </h2>
                        <CashFlowChart data={cashFlow} />
                    </div>

                    {/* Transactions List */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-black text-text-main dark:text-white">

                                Transações Recentes
                            </h2>
                            <div className="flex items-center gap-3">
                                {/* Supplier Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select
                                        value={selectedSupplierId}
                                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                                        className="pl-9 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="">Todos Fornecedores</option>
                                        {suppliers.map((sup: any) => (
                                            <option key={sup.id} value={sup.id}>{sup.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => setShowTransactionModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold transition-colors"
                                >
                                    <Plus size={20} />
                                    Nova Transação
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {transactions.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    Nenhuma transação encontrada para este período
                                </p>
                            ) : (
                                transactions.slice(0, 10).map((transaction) => {
                                    const isIncome = transaction.type === 'income' || transaction.type === 'revenue';
                                    return (
                                        <div
                                            key={transaction.id}
                                            onClick={() => {
                                                setSelectedTransaction(transaction);
                                                setShowDetailsModal(true);
                                            }}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-lg ${isIncome ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                                    <span className="material-symbols-outlined text-[20px]" style={{ color: transaction.category_color }}>
                                                        {transaction.category_icon || 'attach_money'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-main dark:text-white">
                                                        {transaction.description}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {transaction.category_name} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black text-lg ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {isIncome ? '+' : '-'}
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {transaction.bank_account_name}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Transaction Modal */}
                    {showTransactionModal && (
                        <TransactionModal
                            isOpen={showTransactionModal}
                            onClose={() => {
                                setShowTransactionModal(false);
                                setEditTransaction(null);
                            }}
                            onSave={handleTransactionSaved}
                            categories={categories}
                            bankAccounts={bankAccounts}
                            editTransaction={editTransaction}
                            quotes={quotes}
                            suppliers={suppliers}
                        />
                    )}

                    {/* Transaction Details Modal */}
                    {showDetailsModal && selectedTransaction && (
                        <TransactionDetailsModal
                            isOpen={showDetailsModal}
                            onClose={() => {
                                setShowDetailsModal(false);
                                setSelectedTransaction(null);
                            }}
                            transaction={selectedTransaction}
                            categories={categories}
                            bankAccounts={bankAccounts}
                            onEdit={handleEdit}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Financial;
