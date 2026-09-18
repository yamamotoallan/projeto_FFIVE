import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Building2 } from 'lucide-react';
import API_URL from '../src/config/api';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    categories: any[];
    bankAccounts: any[];
    editTransaction?: any; // Optional: transaction to edit
    quotes?: any[]; // List of available projects/quotes
    suppliers?: any[]; // List of suppliers
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, categories, bankAccounts, editTransaction, quotes = [], suppliers = [] }) => {
    const [formData, setFormData] = useState({
        type: editTransaction?.type === 'income' ? 'revenue' : editTransaction?.type || 'expense',
        category_id: editTransaction?.category_id?.toString() || '',
        bank_account_id: editTransaction?.bank_account_id?.toString() || '',
        amount: editTransaction?.amount?.toString() || '',
        date: editTransaction?.date || new Date().toISOString().split('T')[0],
        description: editTransaction?.description || '',
        payment_method: editTransaction?.payment_method || 'PIX',
        document_number: editTransaction?.document_number || '',
        status: editTransaction?.status || 'pending', // New: payment status
        quote_id: editTransaction?.quote_id?.toString() || '', // New: project reference
        supplier_id: editTransaction?.supplier_id?.toString() || '' // New: supplier reference
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Update form when editTransaction changes
    useEffect(() => {
        if (editTransaction) {
            setFormData({
                type: editTransaction.type === 'income' ? 'revenue' : editTransaction.type,
                category_id: editTransaction.category_id?.toString() || '',
                bank_account_id: editTransaction.bank_account_id?.toString() || '',
                amount: editTransaction.amount?.toString() || '',
                date: editTransaction.date || new Date().toISOString().split('T')[0],
                description: editTransaction.description || '',
                payment_method: editTransaction.payment_method || 'PIX',
                document_number: editTransaction.document_number || '',
                status: editTransaction.status || 'pending',
                quote_id: editTransaction.quote_id?.toString() || '',
                supplier_id: editTransaction.supplier_id?.toString() || ''
            });
        }
    }, [editTransaction]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const token = localStorage.getItem('token');
            const url = editTransaction
                ? `${API_URL}/api/financial/transactions/${editTransaction.id}`
                : `${API_URL}/api/financial/transactions`;
            const method = editTransaction ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    category_id: parseInt(formData.category_id),
                    bank_account_id: parseInt(formData.bank_account_id),

                    quote_id: formData.quote_id ? parseInt(formData.quote_id) : null,
                    supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null
                })
            });

            if (res.ok) {
                // TODO: If files are selected, upload them associated with this transaction
                // This would require a separate endpoint for file uploads
                if (selectedFiles.length > 0) {
                    console.log('Files to upload:', selectedFiles);
                    // Future enhancement: upload files to Cloudinary or backend
                }
                onSave();
            } else {
                const errorData = await res.json();
                console.error('Error response:', errorData);
                alert(`Erro ao salvar transação: ${errorData.details || errorData.error}`);
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar transação');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const filteredCategories = categories.filter(cat => cat.type === formData.type);

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
                <div className="px-6 py-5 border-b border-[#e7dbcf] dark:border-neutral-800 bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Nova Transação</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Tipo *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'revenue', category_id: '' }))}
                                className={`p-3 rounded-lg border-2 font-bold transition-all ${formData.type === 'revenue'
                                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300'
                                    : 'border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                Receita
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category_id: '' }))}
                                className={`p-3 rounded-lg border-2 font-bold transition-all ${formData.type === 'expense'
                                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                    : 'border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                Despesa
                            </button>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-bold mb-2 text-text-main dark:text-white">
                            Categoria *
                        </label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-text-main dark:text-white outline-none"
                            required
                        >
                            <option value="">Selecione...</option>
                            {categories
                                .filter(cat => cat.type === (formData.type === 'revenue' ? 'revenue' : 'expense'))
                                .map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                        </select>
                    </div>



                    {/* Supplier - Only for Expense */}
                    {formData.type === 'expense' && suppliers && suppliers.length > 0 && (
                        <div>
                            <label className="block text-sm font-bold mb-2 text-text-main dark:text-white">
                                Fornecedor (Opcional)
                            </label>
                            <select
                                name="supplier_id"
                                value={formData.supplier_id}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-text-main dark:text-white outline-none"
                            >
                                <option value="">Selecione...</option>
                                {suppliers.map(sup => (
                                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Valor (R$) *
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="0,00"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Bank Account */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Conta *
                        </label>
                        <select
                            name="bank_account_id"
                            value={formData.bank_account_id}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Selecione...</option>
                            {bankAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.current_balance)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Data *
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Payment Status - NEW */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Pagamento Realizado? *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, status: 'completed' }))}
                                className={`p-3 rounded-lg border-2 font-bold transition-all ${formData.status === 'completed'
                                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300'
                                    : 'border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                Sim - Pago
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, status: 'pending' }))}
                                className={`p-3 rounded-lg border-2 font-bold transition-all ${formData.status === 'pending'
                                    ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-300'
                                    : 'border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                Não - Pendente
                            </button>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Forma de Pagamento
                        </label>
                        <select
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                        >
                            <option value="PIX">PIX</option>
                            <option value="Dinheiro">Dinheiro</option>
                            <option value="Transferência">Transferência</option>
                            <option value="Boleto">Boleto</option>
                            <option value="Cartão">Cartão</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Descrição *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={3}
                            placeholder="Ex: Compra de chapas MDF"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    {/* Document Number (Optional) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Número do Documento (Nota/Recibo)
                        </label>
                        <input
                            type="text"
                            name="document_number"
                            value={formData.document_number}
                            onChange={handleChange}
                            placeholder="Ex: NF-12345"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* File Upload - NEW */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Anexar Arquivos (Notas, Recibos, Comprovantes)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-lg p-4 text-center hover:border-primary dark:hover:border-primary transition-colors">
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center gap-2"
                            >
                                <Upload className="text-gray-400 dark:text-gray-500" size={32} />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Clique para selecionar ou arraste arquivos aqui
                                </span>
                                <span className="text-xs text-gray-500">PDF, JPG, PNG (máx. 5MB por arquivo)</span>
                            </label>
                        </div>
                        {selectedFiles.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-neutral-800 p-2 rounded-lg">
                                        <FileText size={16} />
                                        <span className="flex-1 truncate">{file.name}</span>
                                        <span className="text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? 'Salvando...' : 'Salvar Transação'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default TransactionModal;
