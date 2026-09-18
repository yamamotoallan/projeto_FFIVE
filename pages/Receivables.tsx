import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Clock, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import { useToast } from '../src/contexts/ToastContext';
import InstallmentTracker from '../components/InstallmentTracker';
import API_URL from '../src/config/api';
import FinancialNav from '../components/FinancialNav';

const Receivables = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('marcenaria_user') || 'null');
    const { success, error } = useToast();

    const [loading, setLoading] = useState(true);
    const [installments, setInstallments] = useState<any[]>([]);
    const [quotes, setQuotes] = useState([]);
    const [filter, setFilter] = useState('all'); // all, pending, overdue, paid
    const [summary, setSummary] = useState({
        total_pending: 0,
        total_overdue: 0,
        total_paid: 0,
        count_pending: 0,
        count_overdue: 0,
        count_paid: 0
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadReceivables();
    }, []); // Only run once on mount

    const loadReceivables = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch all installments with quote details
            const res = await fetch(`${API_URL}/api/financial/receivables`, { headers });
            const data = await res.json();

            setInstallments(data.installments || []);

            // Calculate summary on frontend
            const allInstallments = data.installments || [];
            const newSummary = allInstallments.reduce((acc: any, inst: any) => {
                const amount = parseFloat(inst.amount) || 0;

                if (inst.status === 'pending') {
                    // Check overdue
                    const today = new Date().toISOString().split('T')[0];
                    if (inst.due_date < today) {
                        acc.total_overdue += amount;
                        acc.count_overdue += 1;
                    } else {
                        acc.total_pending += amount;
                        acc.count_pending += 1;
                    }
                } else if (inst.status === 'paid' || inst.status === 'completed') {
                    acc.total_paid += amount;
                    acc.count_paid += 1;
                }

                return acc;
            }, {
                total_pending: 0,
                total_overdue: 0,
                total_paid: 0,
                count_pending: 0,
                count_overdue: 0,
                count_paid: 0
            });

            setSummary(newSummary);
        } catch (err) {
            console.error('Erro ao carregar recebíveis:', err);
            error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (installmentId: number, amount: number, date: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/financial/installments/${installmentId}/pay`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount,
                    date,
                    bank_account_id: 1, // Default to first account, could make configurable
                    payment_method: 'PIX',
                    description: `Recebimento parcela #${installmentId}`
                })
            });

            if (res.ok) {
                success('Parcela marcada como paga!');
                loadReceivables();
            } else {
                error('Erro ao marcar parcela como paga');
            }
        } catch (err) {
            console.error('Erro:', err);
            error('Erro ao processar pagamento');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const filteredInstallments = installments.filter(inst => {
        if (filter === 'all') return true;
        return inst.status === filter;
    });

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
            <FinancialNav />
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-black text-text-main dark:text-white mb-2">
                    Contas a Receber
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Acompanhamento de parcelas e pagamentos de clientes
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Pending */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-600 p-3 rounded-lg">
                            <Clock className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                            {summary.count_pending}
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                        A Receber
                    </h3>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.total_pending)}
                    </p>
                </div>

                {/* Overdue */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-red-600 p-3 rounded-lg">
                            <AlertCircle className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black text-red-600 dark:text-red-400">
                            {summary.count_overdue}
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                        Vencidas
                    </h3>
                    <p className="text-2xl font-black text-red-600 dark:text-red-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.total_overdue)}
                    </p>
                </div>

                {/* Paid */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-600 p-3 rounded-lg">
                            <CheckCircle className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black text-green-600 dark:text-green-400">
                            {summary.count_paid}
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                        Recebidas
                    </h3>
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.total_paid)}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${filter === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300'
                        }`}
                >
                    Todas
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${filter === 'pending'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300'
                        }`}
                >
                    Pendentes
                </button>
                <button
                    onClick={() => setFilter('overdue')}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${filter === 'overdue'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300'
                        }`}
                >
                    Vencidas
                </button>
                <button
                    onClick={() => setFilter('paid')}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${filter === 'paid'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300'
                        }`}
                >
                    Pagas
                </button>
            </div>

            {/* Installments List */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-6 shadow-sm">
                <h2 className="text-lg font-black text-text-main dark:text-white mb-4">
                    Parcelas ({filteredInstallments.length})
                </h2>

                <div className="space-y-3">
                    {filteredInstallments.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            Nenhuma parcela encontrada
                        </p>
                    ) : (
                        filteredInstallments.map((installment) => (
                            <InstallmentTracker
                                key={installment.id}
                                installment={installment}
                                onMarkAsPaid={handleMarkAsPaid}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Receivables;
