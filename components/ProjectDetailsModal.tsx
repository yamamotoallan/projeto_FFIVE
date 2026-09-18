import React, { useState, useEffect } from 'react';
import { Project, QuoteFile } from '../types';
// STAGE_CHECKLISTS removed - now dynamic
import { api } from '../src/services/api';


interface ProjectDetailsModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (updatedProject: Project) => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, isOpen, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'history'>('overview');
    // Lead & Quote Data based on context
    const [leadData, setLeadData] = useState<any>(null);
    const [quoteData, setQuoteData] = useState<any>(null);
    const [files, setFiles] = useState<QuoteFile[]>([]);
    const [checklistItems, setChecklistItems] = useState<any[]>([]);
    const [loadingChecklist, setLoadingChecklist] = useState(false);
    const [isSavingChecklist, setIsSavingChecklist] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const handleDownload = async (file: any) => {
        const quoteId = project?.quoteId || (project as any)?.quote_id;

        if (!file.id || !quoteId) {
            console.error("Missing file ID or quote ID", file, project);
            alert("Não foi possível baixar o arquivo: Informações incompletas.");
            return;
        }

        try {
            const response = await api.quotes.downloadFile(parseInt(quoteId), file.id);
            const downloadUrl = response?.url || response?.signedUrl;

            if (downloadUrl) {
                // If it's a PDF, try to force download via Blob to avoid viewer errors
                // or if it's a Cloudinary 'image/authenticated' URL that doesn't render well.
                const fileName = file.original_name || file.filename || `arquivo-${file.id}`;
                const isPdf = file.mimetype?.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');

                if (isPdf) {
                    try {
                        const blobResponse = await fetch(downloadUrl);
                        if (!blobResponse.ok) throw new Error('Fetch failed');

                        const blob = await blobResponse.blob();
                        const blobUrl = window.URL.createObjectURL(blob);

                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.setAttribute('download', fileName);
                        document.body.appendChild(link);
                        link.click();

                        // Cleanup
                        link.parentNode?.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                        return;
                    } catch (fetchError) {
                        console.warn("Direct blob fetch failed, falling back to window.open", fetchError);
                    }
                }

                // Fallback / Standard behavior for images/others
                window.open(downloadUrl, '_blank');
            } else {
                console.log("Download response:", response);
                alert("Link de download gerado. Verifique o console se não abrir.");
            }
        } catch (error) {
            console.error("Erro ao baixar arquivo:", error);
            alert("Erro ao iniciar download.");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const quoteId = project?.quoteId || (project as any)?.quote_id;

            if (!quoteId) {
                alert("Este projeto não possui um orçamento vinculado para anexar arquivos.");
                return;
            }

            try {
                setIsUploading(true);
                const filesArray = Array.from(e.target.files);

                // Uses the centralized API method which handles FormData and Auth
                await api.quotes.uploadFiles(parseInt(quoteId), filesArray);

                alert("Arquivo(s) enviado(s) com sucesso!");

                // Refresh list
                const updatedFiles = await api.quotes.listFiles(parseInt(quoteId));
                if (Array.isArray(updatedFiles)) {
                    setFiles(updatedFiles);
                }
            } catch (error) {
                console.error('Erro no upload:', error);
                alert("Erro ao enviar arquivo. Tente novamente.");
            } finally {
                setIsUploading(false);
                e.target.value = '';
            }
        }
    };






    // Effect to load files if missing from project but quoteId exists
    useEffect(() => {
        const quoteId = project?.quoteId || (project as any)?.quote_id;
        if (isOpen && quoteId && (!project?.files || project.files.length === 0)) {
            api.quotes.listFiles(parseInt(quoteId))
                .then(files => {
                    if (Array.isArray(files)) {
                        setFiles(files);
                    }
                })
                .catch(err => console.error("Error fetching quote files:", err));
        }
    }, [isOpen, project]);

    useEffect(() => {
        if (isOpen && project) {
            // Reset and load files
            setFiles(project.files || []);

            // Extract IDs handling both camelCase and snake_case
            const leadId = project.leadId || (project as any).lead_id;
            const quoteId = project.quoteId || (project as any).quote_id;

            // Buscar dados reais do Lead se existir leadId
            if (leadId) {
                api.leads.get(leadId)
                    .then(data => {
                        if (data) {
                            setLeadData({
                                name: data.name,
                                phone: data.phone,
                                email: data.email,
                                source: data.source
                            });
                        } else {
                            setLeadData(null);
                        }
                    })
                    .catch(() => setLeadData(null));
            } else {
                setLeadData(null);
            }

            // Buscar dados reais do Quote se existir quoteId
            if (quoteId) {
                api.quotes.get(quoteId)
                    .then(data => {
                        if (data) {
                            setQuoteData({
                                id: data.id,
                                value: data.value,
                                date: data.date ? new Date(data.date).toLocaleDateString('pt-BR') : 'Data inválida',
                                items: 12
                            });
                        } else {
                            setQuoteData(null);
                        }
                    })
                    .catch(() => setQuoteData(null));
            } else {
                setQuoteData(null);
            }

            fetchChecklist();
            fetchHistory();
        }
    }, [isOpen, project]);

    const fetchChecklist = async () => {
        if (!project) return;
        setLoadingChecklist(true);
        try {
            // 1. Fetch saved items
            const savedItems = await api.projects.getChecklist(project.id);

            // 2. Fetch stage to get template
            const stages = await api.kanban.stages.list();
            const currentStage = stages.find((s: any) => s.name === project.status);

            let templateItems: any[] = [];

            if (currentStage) {
                templateItems = await api.kanban.checklist.list(currentStage.id);
            } else {
                // Fallback for stages not in DB yet (migration issue?)
                console.warn(`Stage ${project.status} not found in DB`);
            }

            // 3. Merge: Template drives the display
            const mergedItems = templateItems.map((t: any) => {
                const saved = savedItems.find((i: any) => i.item_label === t.item_label && i.stage === project.status);
                return {
                    id: saved?.id, // specific checklist_item id if needed
                    project_id: project.id,
                    stage: project.status,
                    item_label: t.item_label,
                    completed: saved?.completed || false,
                    is_required: t.is_required
                };
            });

            setChecklistItems(mergedItems);
        } catch (error) {
            console.error('Erro ao buscar checklist:', error);
        } finally {
            setLoadingChecklist(false);
        }
    };

    const fetchHistory = async () => {
        if (!project) return;
        try {
            const data = await api.projects.getHistory(project.id);
            if (Array.isArray(data)) {
                setHistory(data);
            }
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
        }
    };

    const handleToggleItem = (label: string, completed: boolean) => {
        if (!project) return;
        setChecklistItems(prev => {
            return prev.map(i => i.item_label === label ? { ...i, completed } : i);
        });
    };

    const handleSaveChecklist = async () => {
        if (!project) return;
        setIsSavingChecklist(true);
        try {
            // Save state of all displayed items
            for (const item of checklistItems) {
                await api.projects.updateChecklist(project.id, {
                    stage: project.status,
                    item_label: item.item_label,
                    completed: item.completed
                });
            }
            alert("Checklist salvo com sucesso!");
        } catch (error) {
            console.error('Erro ao salvar checklist:', error);
            alert("Erro ao salvar checklist.");
        } finally {
            setIsSavingChecklist(false);
        }
    };


    if (!isOpen || !project) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-surface-light dark:bg-surface-dark w-full max-w-4xl rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 flex flex-col h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#e7dbcf] dark:border-neutral-800 bg-white dark:bg-surface-dark">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-bold text-text-muted bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded uppercase tracking-wider">{project.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                    ${project.priority === 'Alta' ? 'bg-red-100 text-red-700' : project.priority === 'Média' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                Prioridade {project.priority}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black leading-tight text-text-main dark:text-white">{project.title}</h2>
                        <p className="text-sm text-text-main dark:text-gray-300 mt-1 font-medium">{project.client} • {new Date(project.deadline).toLocaleDateString('pt-BR')} (Prazo)</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#e7dbcf] dark:border-neutral-800 px-6 bg-[#fcfaf8] dark:bg-black/20">
                    {['overview', 'files', 'history'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'}`}
                        >
                            {tab === 'overview' ? 'Visão Geral' : tab === 'files' ? 'Arquivos & Projetos' : 'Histórico & Origem'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark/50">

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <section>
                                    <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase mb-3">Descritivo do Projeto</h3>
                                    <div className="bg-white dark:bg-neutral-800/50 p-5 rounded-xl border border-[#e7dbcf] dark:border-neutral-700 shadow-sm text-sm leading-relaxed text-text-main dark:text-gray-200">
                                        {project.description || "Nenhuma descrição detalhada fornecida para este projeto. Utilize este espaço para documentar especificações técnicas, restrições e notas importantes para a equipe de produção."}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-bold text-text-muted dark:text-gray-300 uppercase mb-3">Checklist de Etapa ({project.status})</h3>
                                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm overflow-hidden divide-y divide-[#e7dbcf] dark:divide-neutral-800">
                                        {checklistItems.map(item => {
                                            const isCompleted = item.completed || false;
                                            return (
                                                <div
                                                    key={item.item_label}
                                                    className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                                                    onClick={() => handleToggleItem(item.item_label, !isCompleted)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`material-symbols-outlined ${isCompleted ? 'text-green-500 fill' : 'text-gray-300'}`}>
                                                            {isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                                                        </span>
                                                        <span className={`text-sm font-medium ${isCompleted ? 'text-text-muted dark:text-gray-500 line-through' : 'text-text-main dark:text-gray-200'}`}>
                                                            {item.item_label}
                                                        </span>
                                                        {item.is_required && !isCompleted && (
                                                            <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded uppercase">Obrigatório</span>
                                                        )}
                                                    </div>
                                                    {/* TODO: Add completed_by visualization if available in future schema update */}
                                                </div>
                                            );
                                        })}
                                        {checklistItems.length === 0 && (
                                            <div className="p-6 text-center text-text-muted italic text-sm">
                                                Nenhum checklist definido para esta etapa.
                                            </div>
                                        )}

                                        <div className="mt-4 flex justify-end p-4">
                                            <button
                                                onClick={handleSaveChecklist}
                                                disabled={isSavingChecklist}
                                                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isSavingChecklist ? (
                                                    <>
                                                        <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                                        Salvar Alterações
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm">
                                    <h3 className="text-xs font-bold text-text-muted dark:text-gray-300 uppercase mb-4">Status Atual</h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`w-3 h-3 rounded-full 
                                    ${project.status === 'Refinamento' ? 'bg-blue-500' :
                                                project.status === 'Montagem' ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                                        <span className="font-bold text-lg dark:text-white">{project.status}</span>
                                    </div>
                                    <div className="text-xs text-text-muted dark:text-gray-400">
                                        Estimativa de conclusão desta etapa: <span className="font-bold text-text-main dark:text-white">2 dias</span>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm">
                                    <h3 className="text-xs font-bold text-text-muted dark:text-gray-300 uppercase mb-4">Financeiro</h3>
                                    <p className="text-sm text-text-muted dark:text-gray-400 mb-1">Valor Total Contratado</p>
                                    <p className="text-2xl font-black text-primary mb-3">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.value)}
                                    </p>
                                    <button
                                        onClick={() => alert('Plano de Pagamento:\n1. Entrada (30%): R$ ' + (project.value * 0.3).toLocaleString() + '\n2. Entrega (70%): R$ ' + (project.value * 0.7).toLocaleString())}
                                        className="w-full py-2 border border-[#e7dbcf] dark:border-neutral-700 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-neutral-800"
                                    >
                                        Ver Parcelas
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Files Tab */}
                    {activeTab === 'files' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold text-text-muted dark:text-gray-300 uppercase">Arquivos Vinculados</h3>
                                <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                                    <span className="material-symbols-outlined text-[18px]">upload_file</span> Novo Arquivo
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {files.map((file, idx) => (
                                    <div
                                        key={file.id || idx}
                                        className="group relative bg-white dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 p-4 rounded-xl flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handleDownload(file)}
                                    >
                                        <span className="material-symbols-outlined text-4xl mb-3 text-text-muted group-hover:text-primary transition-colors">
                                            {(file as any).mimetype?.includes('pdf') ? 'picture_as_pdf' : 'image'}
                                        </span>
                                        <p className="text-sm font-bold truncate w-full mb-1 dark:text-gray-200">{(file as any).original_name || (file as any).filename || 'Arquivo'}</p>
                                        <p className="text-xs text-text-muted dark:text-gray-400">{((file as any).size / 1024 / 1024).toFixed(2)} MB</p>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1 hover:bg-gray-100 rounded-full" onClick={(e) => { e.stopPropagation(); handleDownload(file); }}>
                                                <span className="material-symbols-outlined text-sm">download</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <label className="border-2 border-dashed border-[#e7dbcf] dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center p-4 text-text-muted hover:text-primary hover:border-primary cursor-pointer transition-colors bg-white/50 relative overflow-hidden">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isUploading} />
                                    <span className="material-symbols-outlined text-3xl mb-2">{isUploading ? 'sync' : 'add'}</span>
                                    <span className="text-xs font-bold">{isUploading ? 'Enviando...' : 'Adicionar'}</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <div className="animate-fade-in space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Lead Origin */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-text-muted dark:text-gray-300 uppercase flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        Lead Origem
                                    </h3>
                                    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm">
                                        {leadData ? (
                                            <>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                        {leadData.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold dark:text-white">{leadData.name}</p>
                                                        <p className="text-xs text-text-muted">Captado via {leadData.source}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-text-muted">
                                                        <span className="material-symbols-outlined text-[16px]">call</span>
                                                        {leadData.phone}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-text-muted">
                                                        <span className="material-symbols-outlined text-[16px]">mail</span>
                                                        {leadData.email}
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-[#e7dbcf] dark:border-neutral-800">
                                                    <button
                                                        onClick={() => alert('Abrindo ficha do Lead: ' + leadData.name)}
                                                        className="text-xs font-bold text-primary hover:underline"
                                                    >
                                                        Ver Ficha Completa do Lead
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-6">
                                                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">person_off</span>
                                                <p className="text-sm text-text-muted">Sem informações de lead vinculado</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quote Origin */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-text-muted dark:text-gray-300 uppercase flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">request_quote</span>
                                        Orçamento Aprovado
                                    </h3>
                                    <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl pointer-events-none"></div>
                                        {quoteData ? (
                                            <>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="font-bold text-lg mb-0.5 dark:text-white">#{quoteData.id}</p>
                                                        <p className="text-xs text-text-muted">Aprovado em {quoteData.date}</p>
                                                    </div>
                                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Aprovado</span>
                                                </div>
                                                <p className="text-sm text-text-muted mb-4">
                                                    Proposta comercial vinculada ao projeto.
                                                </p>
                                                <button className="w-full py-2 border border-primary/30 text-primary rounded-lg text-sm font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                                                    Visualizar Proposta PDF
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center py-6">
                                                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">request_quote</span>
                                                <p className="text-sm text-text-muted">Sem orçamento vinculado</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed History Timeline */}
                            <div className="mt-8 pt-8 border-t border-[#e7dbcf] dark:border-neutral-800">
                                <h3 className="text-xs font-bold text-text-muted dark:text-gray-300 uppercase mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">history_edu</span>
                                    Histórico de Movimentação e Auditoria
                                </h3>

                                <div className="space-y-6 relative ml-2 pl-6 border-l-2 border-[#e7dbcf] dark:border-neutral-800">
                                    {Array.isArray(history) && history.length > 0 ? (
                                        history.map((evt) => {
                                            return (
                                                <div key={evt.id} className="relative">
                                                    <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 ${evt.type === 'regression' ? 'bg-amber-500' : 'bg-primary'
                                                        }`}></span>

                                                    <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-[#e7dbcf] dark:border-neutral-700 shadow-sm">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-bold text-sm text-text-main dark:text-white flex items-center gap-2">
                                                                    {evt.type === 'regression' ? 'Regressão de Etapa' : 'Avanço de Etapa'}
                                                                    <span className="text-[10px] font-normal text-text-muted bg-gray-100 dark:bg-black/20 px-2 py-0.5 rounded-full border border-black/5">
                                                                        {new Date(evt.timestamp).toLocaleString()}
                                                                    </span>
                                                                </p>
                                                                <p className="text-xs text-text-muted mt-1">
                                                                    De <strong className="text-text-main dark:text-gray-300">{evt.from}</strong> para <strong className="text-text-main dark:text-gray-300">{evt.to}</strong>
                                                                </p>
                                                            </div>
                                                            <span className="text-[10px] uppercase font-bold text-text-muted opacity-60">
                                                                {evt.user_name}
                                                            </span>
                                                        </div>

                                                        {evt.reason && (
                                                            <div className="mb-3 p-3 bg-gray-50 dark:bg-black/20 rounded-lg border border-black/5 dark:border-white/5">
                                                                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">
                                                                    {evt.type === 'regression' ? 'Motivo da Regressão' : 'Justificativa de Pendência'}
                                                                </p>
                                                                <p className="text-xs italic text-gray-700 dark:text-gray-300">"{evt.reason}"</p>
                                                            </div>
                                                        )}

                                                        {/* Snapshot of Checklist Items */}
                                                        {evt.checklist_snapshot && evt.checklist_snapshot.length > 0 && (
                                                            <div className="mt-3 space-y-1 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                                                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase mb-2">Itens Pendentes / Observados:</p>
                                                                {evt.checklist_snapshot.map((item: any, idx: number) => (
                                                                    <div key={idx} className="flex items-start gap-2 text-xs">
                                                                        <span className={`material-symbols-outlined text-[14px] mt-0.5 ${item.completed ? 'text-green-500' : 'text-red-500'
                                                                            }`}>
                                                                            {item.completed ? 'check_circle' : 'cancel'}
                                                                        </span>
                                                                        <div className="flex-1">
                                                                            <span className={item.completed ? 'text-text-muted line-through' : 'text-red-700 dark:text-red-300 font-medium'}>
                                                                                {item.label}
                                                                            </span>
                                                                            {!item.completed && item.reason && (
                                                                                <p className="text-[10px] text-text-muted mt-0.5 ml-1 border-l-2 border-red-200 pl-2">
                                                                                    Obs: {item.reason}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs text-text-muted italic py-4">Nenhum histórico detalhado registrado. (Debug: Length 0)</p>
                                    )}
                                </div>
                            </div>

                            {/* Legacy Checklist View (Optional - keeping for fallback or removing if redundant) */}
                            {/* Removing legacy view in favor of timeline */}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default ProjectDetailsModal;
