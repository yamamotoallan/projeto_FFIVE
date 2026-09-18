import React, { useState } from 'react';
import { Calendar, Building2, FileText, X } from 'lucide-react';

interface Bill {
    id: number;
    supplier_id: number;
    supplier_name: string;
    supplier_trade_name?: string;
    description: string;
    amount: number;
    due_date: string;
    status: string;
    paid_date?: string;
    paid_amount?: number;
    category_name?: string;
    category_icon?: string;
    category_color?: string;
    bill_number?: string;
}

interface BillTrackerProps {
    bill: Bill;
    onMarkAsPaid: (id: number, amount: number, date: string, bankAccountId: number) => void;
    onCancel: (id: number) => void;
}

const BillTracker: React.FC<BillTrackerProps> = ({ bill, onMarkAsPaid, onCancel }) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentAmount, setPaymentAmount] = useState(bill.amount.toString());
    const [bankAccountId, setBankAccountId] = useState(1); // Default account

    const handleConfirmPayment = () => {
        onMarkAsPaid(bill.id, parseFloat(paymentAmount), paymentDate, bankAccountId);
        setShowPaymentModal(false);
    };

    const getStatusColor = () => {
        switch (bill.status) {
            case 'paid':
                return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800';
            case 'overdue':
                return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800';
            case 'pending':
                return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-800';
            case 'cancelled':
                return 'bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700';
            default:
                return 'bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700';
        }
    };

    const getStatusBadge = () => {
        switch (bill.status) {
            case 'paid':
                return <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">PAGA</span>;
            case 'overdue':
                return <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">VENCIDA</span>;
            case 'pending':
                return <span className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">PENDENTE</span>;
            case 'cancelled':
                return <span className="px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded-full">CANCELADA</span>;
            default:
                return null;
        }
    };

    const daysUntilDue = Math.ceil((new Date(bill.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <>
            <div className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${getStatusColor()}`}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 size={16} className="text-gray-600 dark:text-gray-400" />
                            <span className="font-bold text-text-main dark:text-white">
                                {bill.supplier_trade_name || bill.supplier_name}
                            </span>
                            {getStatusBadge()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <FileText size={14} />
                            <span>{bill.description}</span>
                            {bill.bill_number && (
                                <span className="text-xs bg-gray-200 dark:bg-neutral-700 px-2 py-0.5 rounded">
                                    {bill.bill_number}
                                </span>
                            )}
                        </div>
                        {bill.category_name && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mt-1">
                                <span className="material-symbols-outlined text-[14px]" style={{ color: bill.category_color }}>
                                    {bill.category_icon || 'category'}
                                </span>
                                <span>{bill.category_name}</span>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bill.amount)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-300 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Vencimento: {new Date(bill.due_date).toLocaleDateString('pt-BR')}
                        </span>
                        {bill.status === 'pending' && daysUntilDue <= 7 && daysUntilDue > 0 && (
                            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold rounded">
                                {daysUntilDue} dia{daysUntilDue > 1 ? 's' : ''}
                            </span>
                        )}
                        {bill.status === 'overdue' && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-bold rounded">
                                {Math.abs(daysUntilDue)} dia{Math.abs(daysUntilDue) > 1 ? 's' : ''} atrasado
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {bill.status === 'paid' ? (
                            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Pago em {new Date(bill.paid_date!).toLocaleDateString('pt-BR')}
                            </div>
                        ) : bill.status === 'cancelled' ? (
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                Conta cancelada
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => onCancel(bill.id)}
                                    className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <X size={16} />
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    Marcar como Paga
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowPaymentModal(false)}
                >
                    <div
                        className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 border-b border-[#e7dbcf] dark:border-neutral-800">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                Confirmar Pagamento
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Data do Pagamento
                                </label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Valor Pago (R$)
                                </label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    step="0.01"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong>Fornecedor:</strong> {bill.supplier_name}<br />
                                    <strong>Descrição:</strong> {bill.description}<br />
                                    <strong>Valor Original:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bill.amount)}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmPayment}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition-colors"
                                >
                                    Confirmar Pagamento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BillTracker;
