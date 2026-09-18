import React, { useState } from 'react';

interface ReasonModalProps {
    isOpen: boolean;
    type: 'incomplete_checklist' | 'regression' | null;
    missingItems?: string[];
    onConfirm: (reason: string) => void;
    onClose: () => void;
    fromStage?: string;
    toStage?: string;
}

const ReasonModal: React.FC<ReasonModalProps> = ({ isOpen, type, missingItems, onConfirm, onClose, fromStage, toStage }) => {
    const [reason, setReason] = useState('');

    if (!isOpen || !type) return null;

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert('Por favor, informe o motivo.');
            return;
        }
        onConfirm(reason);
        setReason('');
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-xl shadow-2xl border border-primary/20 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-500">
                        <span className="material-symbols-outlined text-3xl">
                            {type === 'regression' ? 'history' : 'warning'}
                        </span>
                        <h3 className="text-lg font-bold">
                            {type === 'regression' ? 'Regressão de Etapa' : 'Checklist Incompleto'}
                        </h3>
                    </div>

                    <p className="text-sm text-text-muted dark:text-gray-300 mb-4 leading-relaxed">
                        {type === 'regression'
                            ? `Você está movendo o projeto de "${fromStage}" para uma etapa anterior "${toStage}". Por favor, justifique esta ação para o histórico.`
                            : `Existem itens não concluídos no checklist da etapa "${fromStage}". Para prosseguir, é necessário justificar.`
                        }
                    </p>

                    {type === 'incomplete_checklist' && missingItems && missingItems.length > 0 && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
                            <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2 uppercase">Itens Pendentes:</p>
                            <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-300 space-y-1">
                                {missingItems.map(item => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase">
                            {type === 'regression' ? 'Motivo da Regressão' : 'Justificativa da Pendência'}
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Descreva o motivo aqui..."
                            className="w-full h-32 p-3 rounded-lg border border-border-light dark:border-neutral-700 bg-background-light dark:bg-black/20 focus:ring-2 focus:ring-primary focus:border-primary text-sm resize-none"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 dark:bg-white/5 border-t border-border-light dark:border-neutral-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow hover:bg-primary-hover transition-colors"
                    >
                        Confirmar e Mover
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReasonModal;
