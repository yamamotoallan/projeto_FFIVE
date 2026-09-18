import React, { useState } from 'react';
import { api } from '../src/services/api';
import { useToast } from '../src/contexts/ToastContext';
import { LoadingButton } from '../src/components/Loading';
import { validators } from '../src/utils/validators';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose, onSave }) => {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    project: '',
    source: 'Instagram'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    const nameValidation = validators.required(formData.name, 'Nome');
    if (!nameValidation.isValid) {
      showError(nameValidation.error!);
      return;
    }

    const emailValidation = validators.email(formData.email);
    if (!emailValidation.isValid) {
      showError(emailValidation.error!);
      return;
    }

    const phoneValidation = validators.phone(formData.phone);
    if (!phoneValidation.isValid) {
      showError(phoneValidation.error!);
      return;
    }

    setLoading(true);
    try {
      await api.leads.create(formData);
      success('✅ Lead cadastrado com sucesso!');
      if (onSave) onSave();
      onClose();
      // Reset form
      setFormData({ name: '', phone: '', email: '', project: '', source: 'Instagram' });
    } catch (error: any) {
      console.error('Erro ao cadastrar lead:', error);
      showError(error.message || 'Erro ao cadastrar lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#e7dbcf] dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-black">Novo Lead</h2>
            <p className="text-sm text-text-muted">Cadastre um cliente potencial.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="lead-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-muted uppercase">Nome do Cliente</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                placeholder="Ex: João da Silva"
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted uppercase">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted uppercase">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                  placeholder="cliente@email.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-muted uppercase">Interesse / Projeto</label>
              <input
                type="text"
                value={formData.project}
                onChange={e => setFormData({ ...formData, project: e.target.value })}
                className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                placeholder="Ex: Cozinha Planejada"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-muted uppercase">Fonte do Lead</label>
              <select
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none cursor-pointer"
              >
                <option>Instagram</option>
                <option>Facebook</option>
                <option>Indicação</option>
                <option>Google</option>
                <option>Passante / Loja Física</option>
              </select>
            </div>
          </form>
        </div>

        <div className="p-6 pt-4 border-t border-[#e7dbcf] dark:border-neutral-800 flex justify-end gap-3 bg-surface-light dark:bg-surface-dark">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
            Cancelar
          </button>
          <LoadingButton
            type="submit"
            form="lead-form"
            loading={loading}
            className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Cadastrar Lead
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default NewLeadModal;