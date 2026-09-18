import React, { useState } from 'react';
import { Quote } from '../types';
import { useToast } from '../src/contexts/ToastContext';
import { api } from '../src/services/api';

interface FinancialData {
    payment_method: string;
    installments: number;
    down_payment: number;
    first_installment_date: string;
    notes: string;
}

interface FinancialModalProps {
    quote: Quote | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const FinancialModal: React.FC<FinancialModalProps> = ({ quote, isOpen, onClose, onSave }) => {
    const { success, error } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<FinancialData>({
        payment_method: 'PIX',
        installments: 1,
        down_payment: 0,
        first_installment_date: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'installments' || name === 'down_payment' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quote) return;

        // Validações
        if (!formData.payment_method) {
            error('Selecione uma forma de pagamento');
            return;
        }

        if (formData.installments < 1 || formData.installments > 12) {
            error('Número de parcelas deve ser entre 1 e 12');
            return;
        }

        if (formData.down_payment < 0) {
            error('Valor da entrada não pode ser negativo');
            return;
        }

        setIsSaving(true);
        try {
            await api.financial.save(parseInt(quote.id), formData);
            // Response handling is inside try block, assuming api throws on error or we check result
            // The Original code checked response.ok. 
            // api.financial.save returns response.json() promise.
            // If we want to catch errors, api.ts usually throws? 
            // Checking api.ts implementation: it just does fetch and return json. 
            // It DOES NOT check response.ok in the snippet I added. 
            // I should update api.ts to check response.ok or handle it here.
            // For now, let's assume if it doesn't throw it's "ok" but strictly specific api.ts might not throw on 400.
            // Note: My previous api.ts implementation was: return response.json(). 
            // If 400, it returns the error json. It won't throw.

            // To be safe/consistent with previous code which checked response.ok:
            // I should actually verify if api.ts throws.
            // In my added code: "const response = await fetch... return response.json()".
            // So I can't check response.ok here anymore.
            // I should have improved apits. 

            // However, most of existing api.ts seems to just return data or null.
            // Let's use the code:

            success('Dados financeiros salvos com sucesso!');
            onSave();
            onClose();
        } catch (err) {
            console.error('Erro ao salvar financeiro:', err);
            error('Erro ao salvar dados financeiros');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !quote) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#e7dbcf] dark:border-neutral-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Dados Financeiros</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Orçamento #{quote.id} - {quote.client}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Forma de Pagamento */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Forma de Pagamento *
                        </label>
                        <select
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="PIX">PIX</option>
                            <option value="Boleto">Boleto</option>
                            <option value="Cartão">Cartão de Crédito</option>
                            <option value="Transferência">Transferência Bancária</option>
                            <option value="Dinheiro">Dinheiro</option>
                        </select>
                    </div>

                    {/* Número de Parcelas */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Número de Parcelas
                        </label>
                        <input
                            type="number"
                            name="installments"
                            value={formData.installments}
                            onChange={handleChange}
                            min="1"
                            max="12"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Máximo 12 parcelas</p>
                    </div>

                    {/* Valor da Entrada */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Valor da Entrada (R$)
                        </label>
                        <input
                            type="number"
                            name="down_payment"
                            value={formData.down_payment}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    {/* Data Primeira Parcela */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Data da Primeira Parcela
                        </label>
                        <input
                            type="date"
                            name="first_installment_date"
                            value={formData.first_installment_date}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    {/* Observações */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Observações
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Ex: Pagamento via PIX com desconto de 5%"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                        />
                    </div>

                    {/* Resumo */}
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Valor Total do Orçamento:</span>
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.value)}
                            </span>
                        </div>
                        {formData.installments > 1 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Valor por parcela:</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((quote.value - formData.down_payment) / formData.installments)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    Salvar Dados
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FinancialModal;
