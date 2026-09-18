import React, { useState, useEffect } from 'react';
import { api } from '../src/services/api';
import { useToast } from '../src/contexts/ToastContext';
import { validators } from '../src/utils/validators';

interface NewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    client?: string;
    project?: string;
    phone?: string;
    leadId?: string;
  };
  onSave?: (quoteData: any) => void;
}

const NewQuoteModal: React.FC<NewQuoteModalProps> = ({ isOpen, onClose, initialData, onSave }) => {
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    client: '',
    phone: '',
    project: '',
    type: 'Cozinha',
    service: 'Móveis Planejados',
    value: '',
    notes: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(prev => ({
        ...prev,
        client: initialData.client || '',
        phone: initialData.phone || '',
        project: initialData.project || '',
      }));
    } else if (!isOpen) {
      // Reset form on close
      setFormData({
        client: '',
        phone: '',
        project: '',
        type: 'Cozinha',
        service: 'Móveis Planejados',
        value: '',
        notes: ''
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    const clientValidation = validators.required(formData.client, 'Nome do cliente');
    if (!clientValidation.isValid) {
      showError(clientValidation.error!);
      return;
    }

    const projectValidation = validators.required(formData.project, 'Nome do projeto');
    if (!projectValidation.isValid) {
      showError(projectValidation.error!);
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
      // 1. Create Quote
      const newQuote = await api.quotes.create({
        lead_id: initialData?.leadId ? parseInt(initialData.leadId) : null,
        client: formData.client,
        phone: formData.phone,
        project: formData.project,
        project_type: formData.type,
        service_type: formData.service,
        value: parseFloat(formData.value) || 0,
        notes: formData.notes,
        date: new Date().toISOString()
      });

      // 2. Upload Files if any
      if (selectedFiles.length > 0) {
        if (newQuote && newQuote.id) {
          try {
            await api.quotes.uploadFiles(newQuote.id, selectedFiles);
          } catch (fileError) {
            console.error("Erro ao fazer upload dos arquivos:", fileError);
            showError('Orçamento criado, mas houve erro ao enviar arquivos.');
          }
        }
      }

      if (onSave) onSave(newQuote);
      success('✅ Orçamento criado com sucesso!');
      onClose();
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      showError('Erro ao salvar orçamento');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-surface-light dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#e7dbcf] dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-black">Novo Orçamento</h2>
            <p className="text-sm text-text-muted">Preencha os dados iniciais para a proposta.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="quote-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted uppercase">Cliente</label>
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                  placeholder="Nome do cliente"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted uppercase">Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-muted uppercase">Nome do Projeto</label>
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                placeholder="Ex: Cozinha Planejada Apto 302"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted uppercase">Tipo de Projeto</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none cursor-pointer"
                >
                  <option>Cozinha</option>
                  <option>Dormitório</option>
                  <option>Sala / Home</option>
                  <option>Banheiro</option>
                  <option>Corporativo</option>
                  <option>Área Externa</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted uppercase">Tipo de Serviço</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none cursor-pointer"
                >
                  <option>Móveis Planejados</option>
                  <option>Marcenaria Fina</option>
                  <option>Reparos / Reformas</option>
                  <option>Projeto 3D</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-muted uppercase">Valor Estimado (R$)</label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                placeholder="0,00"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-muted uppercase">Observações Internas</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm resize-none"
                placeholder="Detalhes importantes para o orçamento..."
              ></textarea>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-muted uppercase">Arquivos do Projeto</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#e7dbcf] dark:border-neutral-700 rounded-lg cursor-pointer bg-background-light dark:bg-background-dark hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors text-2xl mb-1">cloud_upload</span>
                    <p className="text-xs text-text-muted text-center group-hover:text-primary transition-colors">
                      <span className="font-bold">Clique para enviar</span> ou arraste arquivos
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">PDF, JPG, PNG (Max. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-gray-100 dark:bg-neutral-800 px-3 py-2 rounded">
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="p-6 pt-4 border-t border-[#e7dbcf] dark:border-neutral-800 flex justify-end gap-3 bg-surface-light dark:bg-surface-dark">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            form="quote-form"
            className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Criar Orçamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewQuoteModal;