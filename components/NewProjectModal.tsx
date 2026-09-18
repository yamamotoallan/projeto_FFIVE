import React, { useState } from 'react';
import { Project } from '../types';
import { api } from '../src/services/api';
import { useToast } from '../src/contexts/ToastContext';
import { validators } from '../src/utils/validators';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (projectData: any) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSave }) => {
    const { success, error: showError } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        client: '',
        value: '',
        deadline: '',
        priority: 'Média',
        description: '',
        status: 'Refinamento'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validações
        const titleValidation = validators.required(formData.title, 'Nome do projeto');
        if (!titleValidation.isValid) {
            showError(titleValidation.error!);
            return;
        }

        const clientValidation = validators.required(formData.client, 'Nome do cliente');
        if (!clientValidation.isValid) {
            showError(clientValidation.error!);
            return;
        }

        const deadlineValidation = validators.required(formData.deadline, 'Prazo de entrega');
        if (!deadlineValidation.isValid) {
            showError(deadlineValidation.error!);
            return;
        }

        if (formData.value) {
            const valueValidation = validators.positiveNumber(formData.value);
            if (!valueValidation.isValid) {
                showError(valueValidation.error!);
                return;
            }
        }

        try {
            await api.projects.create({
                title: formData.title,
                client: formData.client,
                value: formData.value,
                status: 'Refinamento',
                deadline: formData.deadline,
                priority: formData.priority,
                description: formData.description
            });
            success('✅ Projeto criado com sucesso!');
            if (onSave) onSave({});
            onClose();
            setFormData({ title: '', client: '', value: '', deadline: '', priority: 'Média', description: '', status: 'Refinamento' });
        } catch (error: any) {
            console.error('Erro ao criar projeto:', error);
            showError(error.message || 'Erro ao criar projeto');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-surface-light dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-[#e7dbcf] dark:border-neutral-800">
                    <div>
                        <h2 className="text-xl font-black">Novo Projeto</h2>
                        <p className="text-sm text-text-muted">Inicie o fluxo de produção de um novo pedido.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="new-project-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-text-muted uppercase">Nome do Projeto</label>
                                <input name="title" value={formData.title} onChange={handleChange} required className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-sm font-bold" placeholder="Ex: Cozinha Apto 402" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-text-muted uppercase">Cliente</label>
                                <input name="client" value={formData.client} onChange={handleChange} required className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Nome do Cliente" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-text-muted uppercase">Prazo de Entrega</label>
                                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-sm" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-text-muted uppercase">Valor do Contrato</label>
                                <input type="number" name="value" value={formData.value} onChange={handleChange} className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="0.00" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-text-muted uppercase">Prioridade</label>
                                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-sm cursor-pointer appearance-none">
                                    <option value="Baixa">Baixa</option>
                                    <option value="Média">Média</option>
                                    <option value="Alta">Alta</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-text-muted uppercase">Descritivo / Observações</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-sm resize-none" placeholder="Detalhes técnicos, restrições de horário, etc." />
                        </div>
                    </form>
                </div>

                <div className="p-6 pt-4 border-t border-[#e7dbcf] dark:border-neutral-800 flex justify-end gap-3 bg-surface-light dark:bg-surface-dark">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                    <button type="submit" form="new-project-form" className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary-hover transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">add_task</span>
                        Criar Projeto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewProjectModal;
