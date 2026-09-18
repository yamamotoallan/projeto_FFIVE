import React from 'react';
import { X, Calendar, DollarSign, CreditCard, FileText, Building2, Edit2 } from 'lucide-react';

interface TransactionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: any;
    categories: any[];
    bankAccounts: any[];
    onEdit?: (transaction: any) => void; // Callback to open edit mode
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
    isOpen,
    onClose,
    transaction,
    categories,
    bankAccounts,
    onEdit
}) => {
    if (!isOpen || !transaction) return null;

    const category = categories.find(c => c.id === transaction.category_id);
    const bankAccount = bankAccounts.find(a => a.id === transaction.bank_account_id);
    const isIncome = transaction.type === 'income' || transaction.type === 'revenue';

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`px-6 py-5 border-b border-[#e7dbcf] dark:border-neutral-800 ${isIncome ? 'bg-gradient-to-r from-green-500/10 to-green-500/5' : 'bg-gradient-to-r from-red-500/10 to-red-500/5'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${isIncome ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                <span
                                    className="material-symbols-outlined text-[24px]"
                                    style={{ color: category?.color || (isIncome ? '#16a34a' : '#dc2626') }}
                                >
                                    {category?.icon || 'attach_money'}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                    {isIncome ? 'Receita' : 'Despesa'}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {category?.name || 'Sem categoria'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Amount */}
                    <div className="text-center py-6 bg-gray-50 dark:bg-neutral-800 rounded-xl">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valor</p>
                        <p className={`text-4xl font-black ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isIncome ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                        </p>
                        <p className={`text-sm mt-2 font-bold ${transaction.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                            {transaction.status === 'completed' ? '✓ Pago' : '⏱ Pendente'}
                        </p>
                        {transaction.transaction_number && (
                            <p className="text-xs text-gray-400 mt-2 font-mono">
                                ID: {transaction.transaction_number}
                            </p>
                        )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Description */}
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                <FileText size={18} />
                                <span className="text-sm font-bold">Descrição</span>
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium pl-7">
                                {transaction.description || 'Sem descrição'}
                            </p>
                        </div>

                        {/* Project Reference */}
                        {transaction.quote_id && (
                            <div className="col-span-2 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                                    <Building2 size={18} />
                                    <span className="text-sm font-bold">Projeto Vinculado</span>
                                </div>
                                <p className="text-gray-900 dark:text-white font-medium pl-7">
                                    #{transaction.quote_number} - {transaction.quote_client} - {transaction.quote_project}
                                </p>
                            </div>
                        )}

                        {/* Date */}
                        <div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                <Calendar size={18} />
                                <span className="text-sm font-bold">Data</span>
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium pl-7">
                                {new Date(transaction.date).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                <CreditCard size={18} />
                                <span className="text-sm font-bold">Forma de Pagamento</span>
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium pl-7">
                                {transaction.payment_method || 'Não informado'}
                            </p>
                        </div>

                        {/* Bank Account */}
                        <div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                <Building2 size={18} />
                                <span className="text-sm font-bold">Conta</span>
                            </div>
                            <p className="text-gray-900 dark:text-white font-medium pl-7">
                                {bankAccount?.name || transaction.bank_account_name || 'Não informado'}
                            </p>
                        </div>

                        {/* Document Number */}
                        {transaction.document_number && (
                            <div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                                    <FileText size={18} />
                                    <span className="text-sm font-bold">Nº Documento</span>
                                </div>
                                <p className="text-gray-900 dark:text-white font-medium pl-7">
                                    {transaction.document_number}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex gap-3">
                        {onEdit && (
                            <button
                                onClick={() => {
                                    onEdit(transaction);
                                    onClose();
                                }}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit2 size={18} />
                                Editar
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailsModal;
