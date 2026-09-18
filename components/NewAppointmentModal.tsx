import React, { useState } from 'react';
import { api } from '../src/services/api';
import { useToast } from '../src/contexts/ToastContext';
import { validators } from '../src/utils/validators';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ isOpen, onClose, onSave }) => {
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    timeStart: '09:00',
    timeEnd: '10:00',
    type: 'Medição', // Default to Medição as per original form
    description: '',
    leadId: null as string | null,
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Auto-update end time if start time changes
    if (name === 'timeStart') {
      const [hours, minutes] = value.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(hours + 1);
      endDate.setMinutes(minutes);

      const endHours = String(endDate.getHours()).padStart(2, '0');
      const endMinutes = String(endDate.getMinutes()).padStart(2, '0');

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        timeEnd: `${endHours}:${endMinutes}`
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, type: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    const titleValidation = validators.required(formData.title, 'Título');
    if (!titleValidation.isValid) {
      showError(titleValidation.error!);
      return;
    }

    const dateValidation = validators.futureDate(formData.date);
    if (!dateValidation.isValid) {
      showError(dateValidation.error!);
      return;
    }

    // Validar que hora de fim é posterior à hora de início
    if (formData.timeEnd && formData.timeStart >= formData.timeEnd) {
      showError('Hora de término deve ser posterior à hora de início');
      return;
    }

    setLoading(true);

    try {
      await api.events.create({
        title: formData.title,
        subtitle: formData.subtitle,
        time_start: `${formData.date}T${formData.timeStart}:00Z`,
        time_end: `${formData.date}T${formData.timeEnd}:00Z`,
        type: formData.type,
        description: formData.description,
        lead_id: formData.leadId || null
      });
      success('✅ Compromisso agendado!');
      if (onSave) onSave();
      onClose();
      setFormData({ title: '', subtitle: '', date: '', timeStart: '09:00', timeEnd: '10:00', type: 'Medição', description: '', leadId: null });
    } catch (error: any) {
      console.error('Erro ao criar compromisso:', error);
      showError(error.message || 'Erro ao agendar compromisso');
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
            <h2 className="text-xl font-black">Novo Compromisso</h2>
            <p className="text-sm text-text-muted">Agende uma visita ou tarefa.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form
            id="new-appointment-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-muted uppercase">Título do Evento</label>
              <input name="title" value={formData.title} onChange={handleChange} type="text" required className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm" placeholder="Ex: Medição Cliente Silva" autoFocus />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted uppercase">Data</label>
                <input name="date" value={formData.date} onChange={handleChange} type="date" required className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted uppercase">Início</label>
                <input name="timeStart" value={formData.timeStart} onChange={handleChange} type="time" required className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted uppercase">Término</label>
                <input name="timeEnd" value={formData.timeEnd} onChange={handleChange} type="time" required className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-muted uppercase">Tipo de Compromisso</label>
              <div className="grid grid-cols-3 gap-2">
                <label className="cursor-pointer">
                  <input type="radio" name="type" value="Medição" checked={formData.type === 'Medição'} onChange={handleRadioChange} className="peer sr-only" />
                  <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-background-light dark:bg-background-dark hover:bg-gray-100 dark:hover:bg-neutral-800 peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all">
                    <span className="material-symbols-outlined mb-1">straighten</span>
                    <span className="text-[10px] font-bold uppercase">Medição</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="type" value="Instalação" checked={formData.type === 'Instalação'} onChange={handleRadioChange} className="peer sr-only" />
                  <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-background-light dark:bg-background-dark hover:bg-gray-100 dark:hover:bg-neutral-800 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all">
                    <span className="material-symbols-outlined mb-1">handyman</span>
                    <span className="text-[10px] font-bold uppercase">Instalação</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="type" value="Reunião" checked={formData.type === 'Reunião'} onChange={handleRadioChange} className="peer sr-only" />
                  <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-background-light dark:bg-background-dark hover:bg-gray-100 dark:hover:bg-neutral-800 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:border-purple-600 transition-all">
                    <span className="material-symbols-outlined mb-1">groups</span>
                    <span className="text-[10px] font-bold uppercase">Reunião</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-text-muted uppercase">Endereço / Local</label>
              <input name="subtitle" value={formData.subtitle} onChange={handleChange} type="text" className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm" placeholder="Rua das Flores, 123" />
            </div>
          </form>
        </div>

        <div className="p-6 pt-4 border-t border-[#e7dbcf] dark:border-neutral-800 flex justify-end gap-3 bg-surface-light dark:bg-surface-dark">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
            Cancelar
          </button>
          <button type="submit" form="new-appointment-form" className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check</span>
            Agendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
