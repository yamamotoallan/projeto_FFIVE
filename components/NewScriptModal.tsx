import React from 'react';

interface NewScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewScriptModal: React.FC<NewScriptModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface-light dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#e7dbcf] dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-black">Novo Script</h2>
            <p className="text-sm text-text-muted">Crie um modelo de mensagem para seus clientes.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted uppercase">Título do Script</label>
                <input type="text" className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm" placeholder="Ex: Cobrança Amigável" autoFocus />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted uppercase">Categoria</label>
                <select className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm appearance-none cursor-pointer">
                    <option>Orçamento</option>
                    <option>Agendamento</option>
                    <option>Pós-venda</option>
                    <option>Cobrança</option>
                    <option>Marketing / Promoção</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted uppercase">Conteúdo do Script</label>
                <textarea rows={6} className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm resize-none leading-relaxed" placeholder="Digite aqui o texto da mensagem... Use [Nome] para variáveis."></textarea>
                <p className="text-xs text-text-muted">Dica: A IA poderá sugerir melhorias após salvar.</p>
            </div>
          </form>
        </div>

        <div className="p-6 pt-4 border-t border-[#e7dbcf] dark:border-neutral-800 flex justify-end gap-3 bg-surface-light dark:bg-surface-dark">
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                Cancelar
            </button>
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">save</span>
                Salvar Script
            </button>
        </div>
      </div>
    </div>
  );
};

export default NewScriptModal;