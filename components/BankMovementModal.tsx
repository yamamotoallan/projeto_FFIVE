import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import API_URL from '../src/config/api';

interface BankMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    bankAccounts: any[];
}

const BankMovementModal: React.FC<BankMovementModalProps> = ({ isOpen, onClose, onSave, bankAccounts }) => {
    const [formData, setFormData] = useState({
        type: 'transfer', // transfer, adjustment_in, adjustment_out
        amount: '',
        date: new Date().toISOString().split('T')[0],
        origin_account_id: '',
        destination_account_id: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                type: 'transfer',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                origin_account_id: '',
                destination_account_id: '',
                description: ''
            });
            setError('');
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Informe um valor válido');
            setLoading(false);
            return;
        }
        if (!formData.date) {
            setError('Informe a data');
            setLoading(false);
            return;
        }

        if (formData.type === 'transfer') {
            if (!formData.origin_account_id || !formData.destination_account_id) {
                setError('Selecione as contas de origem e destino');
                setLoading(false);
                return;
            }
            if (formData.origin_account_id === formData.destination_account_id) {
                setError('As contas de origem e destino devem ser diferentes');
                setLoading(false);
                return;
            }
        } else if (formData.type === 'adjustment_in') {
            if (!formData.destination_account_id) {
                setError('Selecione a conta de destino');
                setLoading(false);
                return;
            }
        } else if (formData.type === 'adjustment_out') {
            if (!formData.origin_account_id) {
                setError('Selecione a conta de origem');
                setLoading(false);
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/financial/movements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    origin_account_id: formData.origin_account_id ? parseInt(formData.origin_account_id) : null,
                    destination_account_id: formData.destination_account_id ? parseInt(formData.destination_account_id) : null
                })
            });

            if (!res.ok) throw new Error('Falha ao salvar movimentação');

            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Erro ao salvar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-dark rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">

                {/* Header */}
                <div className="bg-primary px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ArrowRightLeft className="text-white/80" />
                        Nova Movimentação
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Type Selection */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'transfer' }))}
                            className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${formData.type === 'transfer'
                                    ? 'border-primary bg-primary/10 text-primary font-bold'
                                    : 'border-gray-200 dark:border-neutral-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                }`}
                        >
                            <ArrowRightLeft size={20} />
                            <span className="text-xs">Transferência</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'adjustment_in' }))}
                            className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${formData.type === 'adjustment_in'
                                    ? 'border-green-500 bg-green-500/10 text-green-600 font-bold'
                                    : 'border-gray-200 dark:border-neutral-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                }`}
                        >
                            <TrendingUp size={20} />
                            <span className="text-xs">Entrada (Ajuste)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'adjustment_out' }))}
                            className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${formData.type === 'adjustment_out'
                                    ? 'border-red-500 bg-red-500/10 text-red-600 font-bold'
                                    : 'border-gray-200 dark:border-neutral-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                }`}
                        >
                            <TrendingDown size={20} />
                            <span className="text-xs">Saída (Ajuste)</span>
                        </button>
                    </div>

                    {/* Amount & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                    placeholder="0,00"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* Origin Account (Transfer or Out) */}
                    {(formData.type === 'transfer' || formData.type === 'adjustment_out') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Conta de Origem (Sai dinheiro)
                            </label>
                            <select
                                name="origin_account_id"
                                value={formData.origin_account_id}
                                onChange={handleChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="">Selecione a conta...</option>
                                {bankAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id} disabled={acc.id.toString() === formData.destination_account_id}>
                                        {acc.name} ({acc.bank})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Destination Account (Transfer or In) */}
                    {(formData.type === 'transfer' || formData.type === 'adjustment_in') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Conta de Destino (Entra dinheiro)
                            </label>
                            <select
                                name="destination_account_id"
                                value={formData.destination_account_id}
                                onChange={handleChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="">Selecione a conta...</option>
                                {bankAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id} disabled={acc.id.toString() === formData.origin_account_id}>
                                        {acc.name} ({acc.bank})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                            placeholder="Ex: Transferência para cobrir cartão"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? 'Salvando...' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BankMovementModal;
