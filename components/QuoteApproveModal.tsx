import React, { useState, useEffect } from 'react';
import { Quote } from '../types';

interface QuoteApproveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentInfo: any) => Promise<void>;
    quoteTotal: number;
}

const QuoteApproveModal: React.FC<QuoteApproveModalProps> = ({ isOpen, onClose, onConfirm, quoteTotal }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [downPayment, setDownPayment] = useState<string>(''); // String to handle inputs better
    const [installmentsCount, setInstallmentsCount] = useState(1);
    const [firstInstallmentDate, setFirstInstallmentDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Set default date to 30 days from now
            const date = new Date();
            date.setDate(date.getDate() + 30);
            setFirstInstallmentDate(date.toISOString().split('T')[0]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const paymentInfo = {
            paymentMethod,
            downPayment: downPayment ? parseFloat(downPayment.replace(',', '.')) : 0,
            installmentsCount: Number(installmentsCount),
            firstInstallmentDate
        };

        try {
            await onConfirm(paymentInfo);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao aprovar orçamento. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // Calculate Summary
    const downPaymentValue = downPayment ? parseFloat(downPayment.replace(',', '.')) : 0;
    const remainingValue = Math.max(0, quoteTotal - downPaymentValue);
    const installmentValue = installmentsCount > 0 ? remainingValue / installmentsCount : 0;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-[#e7dbcf] dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-green-600">
                        <span className="material-symbols-outlined">check_circle</span>
                        Aprovar Orçamento
                    </h2>
                    <p className="text-sm text-text-muted mt-1">Defina os detalhes do pagamento para gerar o financeiro.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Payment Method */}
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">Forma de Pagamento</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full p-3 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                        >
                            <option value="pix" className="bg-white dark:bg-neutral-800">Pix</option>
                            <option value="credit_card" className="bg-white dark:bg-neutral-800">Cartão de Crédito</option>
                            <option value="boleto" className="bg-white dark:bg-neutral-800">Boleto</option>
                            <option value="cash" className="bg-white dark:bg-neutral-800">Dinheiro</option>
                            <option value="transfer" className="bg-white dark:bg-neutral-800">Transferência Bancária</option>
                        </select>
                    </div>

                    {/* Down Payment */}
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1">Valor de Entrada (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={downPayment}
                            onChange={(e) => setDownPayment(e.target.value)}
                            className="w-full p-3 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono"
                            placeholder="0,00"
                        />
                        <p className="text-xs text-text-muted mt-1">Deixe em branco se não houver entrada.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Installments Count */}
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1">Parcelas Restantes</label>
                            <select
                                value={installmentsCount}
                                onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                                className="w-full p-3 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                                    <option key={num} value={num} className="bg-white dark:bg-neutral-800">{num}x</option>
                                ))}
                            </select>
                        </div>

                        {/* First Installment Date */}
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1">1ª Parcela em</label>
                            <input
                                type="date"
                                required
                                value={firstInstallmentDate}
                                onChange={(e) => setFirstInstallmentDate(e.target.value)}
                                className="w-full p-3 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Summary Box */}
                    <div className="bg-primary/5 p-4 rounded-xl space-y-2 text-sm border border-primary/10">
                        <div className="flex justify-between">
                            <span className="text-text-muted">Valor Total:</span>
                            <span className="font-bold">{formatCurrency(quoteTotal)}</span>
                        </div>
                        {downPaymentValue > 0 && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Entrada (Hoje):</span>
                                <span>{formatCurrency(downPaymentValue)}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-primary/10">
                            <span className="text-text-muted">Restante ({installmentsCount}x):</span>
                            <span className="font-bold">{formatCurrency(installmentValue)} /mês</span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-[#e7dbcf] dark:border-neutral-700 font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">check</span>
                                    Confirmar Aprovação
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuoteApproveModal;
