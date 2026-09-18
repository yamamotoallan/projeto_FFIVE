import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Clock, AlertCircle, CheckCircle, Plus, XCircle } from 'lucide-react';
import { useToast } from '../src/contexts/ToastContext';
import BillTracker from '../components/BillTracker';
import BillModal from '../components/BillModal';
import API_URL from '../src/config/api';
import FinancialNav from '../components/FinancialNav';

const Payables = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('marcenaria_user') || 'null');
    const { success, error } = useToast();

    const [loading, setLoading] = useState(true);
    const [bills, setBills] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState([]);
    const [filter, setFilter] = useState('all'); // all, pending, overdue, paid, cancelled
    const [showBillModal, setShowBillModal] = useState(false);
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
        loadPayables();
    }, []); // Only run once on mount

    const loadPayables = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch payables and suppliers in parallel
            const [payablesRes, suppliersRes] = await Promise.all([
                fetch(`${API_URL}/api/financial/payables`, { headers }),
                fetch(`${API_URL}/api/financial/suppliers`, { headers })
            ]);

            const payablesData = await payablesRes.json();
            const suppliersData = await suppliersRes.json();

            setBills(payablesData.bills || []);
            setSuppliers(suppliersData || []);

            // Calculate summary on frontend
            const allBills = payablesData.bills || [];
            const newSummary = allBills.reduce((acc: any, bill: any) => {
                const amount = parseFloat(bill.amount) || 0;
                const status = bill.status || 'pending';

                // Check if paid
                if (status === 'paid' || status === 'completed') {
                    acc.total_paid += amount;
                    acc.count_paid += 1;
                } else if (status !== 'cancelled') {
                    // Pending or Overdue
                    const today = new Date().toISOString().split('T')[0];
                    const dueDate = bill.due_date ? new Date(bill.due_date).toISOString().split('T')[0] : today;

                    if (dueDate < today) {
                        acc.total_overdue += amount;
                        acc.count_overdue += 1;
                    } else {
                        acc.total_pending += amount;
                        acc.count_pending += 1;
                    }
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
            console.error('Erro ao carregar contas a pagar:', err);
            error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (billId: number, amount: number, date: string, bankAccountId: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/financial/bills/${billId}/pay`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount,
                    date,
                    bank_account_id: bankAccountId,
                    payment_method: 'Transferência',
                    description: `Pagamento conta #${billId}`
                })
            });

            if (res.ok) {
                success('Conta marcada como paga!');
                loadPayables();
            } else {
                error('Erro ao marcar conta como paga');
            }
        } catch (err) {
            console.error('Erro:', err);
            error('Erro ao processar pagamento');
        }
    };

    const handleCancelBill = async (billId: number) => {
        if (!confirm('Deseja realmente cancelar esta conta?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/financial/bills/${billId}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                success('Conta cancelada!');
                loadPayables();
            } else {
                error('Erro ao cancelar conta');
            }
        } catch (err) {
            console.error('Erro:', err);
            error('Erro ao cancelar conta');
        }
    };

    const handleBillSaved = () => {
        setShowBillModal(false);
        loadPayables();
        success('Conta criada com sucesso!');
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const filteredBills = bills.filter(bill => {
        if (filter === 'all') return true;
        return bill.status === filter;
    });

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
            <FinancialNav />
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-text-main dark:text-white mb-2">
                        Contas a Pagar
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Controle de despesas e pagamentos a fornecedores
                    </p>
                </div>
                <button
                    onClick={() => setShowBillModal(true)}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nova Conta
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Pending */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-orange-600 p-3 rounded-lg">
                            <Clock className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                            {summary.count_pending}
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                        A Pagar
                    </h3>
                    <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
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
                        Pagas
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
                        ? 'bg-orange-600 text-white'
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

            {/* Bills List */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-6 shadow-sm">
                <h2 className="text-lg font-black text-text-main dark:text-white mb-4">
                    Contas ({filteredBills.length})
                </h2>

                <div className="space-y-3">
                    {filteredBills.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            Nenhuma conta encontrada
                        </p>
                    ) : (
                        filteredBills.map((bill) => (
                            <BillTracker
                                key={bill.id}
                                bill={bill}
                                onMarkAsPaid={handleMarkAsPaid}
                                onCancel={handleCancelBill}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Bill Modal */}
            {showBillModal && (
                <BillModal
                    isOpen={showBillModal}
                    onClose={() => setShowBillModal(false)}
                    onSave={handleBillSaved}
                    suppliers={suppliers}
                />
            )}
        </div>
    );
};

export default Payables;
