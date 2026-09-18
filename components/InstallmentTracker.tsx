import React, { useState } from 'react';
import { Calendar, DollarSign, User, FileText } from 'lucide-react';

interface Installment {
    id: number;
    quote_id: number;
    installment_number: number;
    due_date: string;
    amount: number;
    status: string;
    paid_date?: string;
    paid_amount?: number;
    client_name?: string;
    quote_description?: string;
}

interface InstallmentTrackerProps {
    installment: Installment;
    onMarkAsPaid: (id: number, amount: number, date: string) => void;
}

const InstallmentTracker: React.FC<InstallmentTrackerProps> = ({ installment, onMarkAsPaid }) => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentAmount, setPaymentAmount] = useState(installment.amount.toString());

    const handleConfirmPayment = () => {
        onMarkAsPaid(installment.id, parseFloat(paymentAmount), paymentDate);
        setShowPaymentModal(false);
    };

    const getStatusColor = () => {
        switch (installment.status) {
            case 'paid':
                return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800';
            case 'overdue':
                return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800';
            case 'pending':
                return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800';
            default:
                return 'bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700';
        }
    };

    const getStatusBadge = () => {
        switch (installment.status) {
            case 'paid':
                return <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">PAGA</span>;
            case 'overdue':
                return <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">VENCIDA</span>;
            case 'pending':
                return <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">PENDENTE</span>;
            default:
                return null;
        }
    };

    const daysUntilDue = Math.ceil((new Date(installment.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <>
            <div className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${getStatusColor()}`}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <User size={16} className="text-gray-600 dark:text-gray-400" />
                            <span className="font-bold text-text-main dark:text-white">
                                {installment.client_name || `Cliente #${installment.quote_id}`}
                            </span>
                            {getStatusBadge()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <FileText size={14} />
                            <span>Orçamento #{installment.quote_id} - Parcela {installment.installment_number}</span>
                        </div>
                        {installment.quote_description && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {installment.quote_description}
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installment.amount)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-300 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Vencimento: {new Date(installment.due_date).toLocaleDateString('pt-BR')}
                        </span>
                        {installment.status === 'pending' && daysUntilDue <= 7 && daysUntilDue > 0 && (
                            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold rounded">
                                {daysUntilDue} dia{daysUntilDue > 1 ? 's' : ''}
                            </span>
                        )}
                        {installment.status === 'overdue' && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-bold rounded">
                                {Math.abs(daysUntilDue)} dia{Math.abs(daysUntilDue) > 1 ? 's' : ''} atrasado
                            </span>
                        )}
                    </div>

                    {installment.status === 'paid' ? (
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                            Pago em {new Date(installment.paid_date!).toLocaleDateString('pt-BR')}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors"
                        >
                            Marcar como Paga
                        </button>
                    )}
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
                                Confirmar Recebimento
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Data do Recebimento
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
                                    Valor Recebido (R$)
                                </label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    step="0.01"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong>Cliente:</strong> {installment.client_name}<br />
                                    <strong>Parcela:</strong> {installment.installment_number}<br />
                                    <strong>Valor Original:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installment.amount)}
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
                                    Confirmar Recebimento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InstallmentTracker;
