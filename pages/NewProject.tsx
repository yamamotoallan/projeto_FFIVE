import React from 'react';
import { useNavigate } from 'react-router-dom';

const NewProject: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative animate-fade-in">
        <header className="shrink-0 px-8 py-6 border-b border-[#e7dbcf] dark:border-neutral-800 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm z-10">
            <div className="max-w-3xl mx-auto w-full flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-black leading-tight">Novo Projeto</h1>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto w-full bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm p-8">
                <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); navigate('/orcamentos'); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-text-muted uppercase">Nome do Cliente</label>
                            <input type="text" className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Ex: Ana Silva" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-text-muted uppercase">Telefone / Contato</label>
                            <input type="tel" className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="(00) 00000-0000" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-text-muted uppercase">Tipo de Projeto</label>
                        <select className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                            <option>Cozinha Planejada</option>
                            <option>Dormitório / Guarda-roupa</option>
                            <option>Home Theater / Sala</option>
                            <option>Banheiro</option>
                            <option>Escritório / Corporativo</option>
                            <option>Outros</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-text-muted uppercase">Descrição / Necessidades</label>
                        <textarea className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none" placeholder="Descreva os detalhes do projeto, medidas aproximadas, materiais de preferência..."></textarea>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-text-muted uppercase">Data Desejada para Medição</label>
                        <input type="date" className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#e7dbcf] dark:border-neutral-800 mt-2">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-lg font-bold text-text-muted hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-6 py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined">save</span>
                            Salvar Projeto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default NewProject;