import React, { useState, useEffect } from 'react';
import NewLeadModal from '../components/NewLeadModal';
import NewQuoteModal from '../components/NewQuoteModal';
import QuoteDetailsModal from '../components/QuoteDetailsModal';
import { Quote } from '../types';
import { api } from '../src/services/api';
import { useLeads } from '../hooks/useLeads';

const Leads: React.FC = () => {
    const { leads, isLoading: loading, error, refetch: refetchLeads } = useLeads();
    // Manual state for leads removed, mapped loading to verify existing status.
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false); // Mantido por compatibilidade com código existente, se removido pode quebrar

    // Interaction states for details panel
    const [activeAction, setActiveAction] = useState<'call' | 'email' | null>(null);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [currentFilter, setCurrentFilter] = useState('Todos os Leads');
    const [noteContent, setNoteContent] = useState('');
    const [interactions, setInteractions] = useState<any[]>([]);

    // New Quote Integration
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [selectedQuoteForDetails, setSelectedQuoteForDetails] = useState<Quote | null>(null);

    // Projects Data
    const [linkedProjects, setLinkedProjects] = useState<any[]>([]);

    // Quotes do lead (buscar do backend)
    const [linkedQuotes, setLinkedQuotes] = useState<Quote[]>([]);


    useEffect(() => {
        if (selectedLead) {
            // Fetch Linked Projects from LocalStorage (Integration with Kanban)
            const storedProjects = localStorage.getItem('marcenaria_projects');
            if (storedProjects) {
                const projects = JSON.parse(storedProjects);
                // Filter projects that match the lead (by client name for now, ideally by ID)
                const relevant = projects.filter((p: any) =>
                    p.client && selectedLead.name &&
                    p.client.toLowerCase() === selectedLead.name.toLowerCase()
                );
                setLinkedProjects(relevant);
            }
        } else {
            setLinkedProjects([]);
        }
    }, [selectedLead]);

    const fetchInteractions = async (leadId: string) => {
        try {
            const data = await api.interactions.list('lead', parseInt(leadId));
            setInteractions(data);
        } catch (error) {
            console.error('Erro ao buscar interações:', error);
        }
    };

    const handleRowClick = (lead: any) => {
        setSelectedLead(lead);
        setActiveAction(null); // Reset actions on new selection
        setIsStatusDropdownOpen(false);
        fetchInteractions(lead.id);
        fetchLeadQuotes(lead.id); // ← BUSCAR QUOTES
    };

    // Buscar quotes vinculados ao lead
    const fetchLeadQuotes = async (leadId: string) => {
        try {
            // Using unified list fetch to guarantee consistency with the main Quotes view
            const allQuotes = await api.quotes.list();

            // Filter quotes for this lead (by ID if available, fallback to Client Name matching)
            const relevantQuotes = allQuotes.filter((q: any) => {
                // Check exact Lead ID match
                if (q.lead_id && String(q.lead_id) === String(leadId)) return true;

                // Fallback: Check Legacy linkage or Name Match
                // (Useful if backend link logic was added recently)
                if (selectedLead && q.client && q.client.toLowerCase() === selectedLead.name.toLowerCase()) return true;

                return false;
            });

            console.log(`📊 Quotes filtrados para lead ${leadId}:`, relevantQuotes);
            setLinkedQuotes(relevantQuotes);
        } catch (error) {
            console.error('Erro ao buscar orçamentos do lead:', error);
            setLinkedQuotes([]);
        }
    };


    const handleSendNote = async () => {
        if (!selectedLead || !noteContent.trim()) return;

        try {
            await api.interactions.create({
                entity_type: 'lead',
                entity_id: selectedLead.id,
                content: noteContent,
                type: 'note',
                user_id: 1 // TODO: Get logged user ID
            });
            setNoteContent('');
            fetchInteractions(selectedLead.id);
        } catch (error) {
            console.error('Erro ao enviar nota:', error);
        }
    };

    const closeDetail = () => {
        setSelectedLead(null);
        setActiveAction(null);
        setInteractions([]);
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedLead) return;

        try {
            await api.leads.updateStatus(selectedLead.id, newStatus);
            // Atualiza localmente e refaz o fetch para garantir sincronia
            await refetchLeads();
            const updatedLead = { ...selectedLead, status: newStatus };
            setSelectedLead(updatedLead);
            // setLeads no longer exists, managed by React Query cache
            setIsStatusDropdownOpen(false);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const handleWhatsApp = () => {
        if (selectedLead && selectedLead.phone) {
            // Remove non-numeric chars
            const cleanPhone = selectedLead.phone.replace(/\D/g, '');
            const url = `https://wa.me/55${cleanPhone}`;
            window.open(url, '_blank');
        }
    };

    const handleCall = () => {
        if (selectedLead && selectedLead.phone) {
            window.location.href = `tel:${selectedLead.phone}`;
        }
    };

    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedLead && selectedLead.email) {
            const subject = encodeURIComponent("Proposta de Projeto - Marcenaria Pro");
            const body = encodeURIComponent("Olá, " + selectedLead.name + ",\n\nConforme conversamos...");
            window.location.href = `mailto:${selectedLead.email}?subject=${subject}&body=${body}`;
        }
    };

    const handleExport = (type: 'pdf' | 'excel') => {
        setIsExportOpen(false);
        console.log(`Exportando leads para ${type.toUpperCase()}...`);
        alert(`Exportação para ${type.toUpperCase()} iniciada. O download começará em breve.`);
        // Aqui futuramente entrará a lógica real de geração de arquivo
    };

    // Funções de Orçamento
    const handleSaveQuote = (quoteData: any) => {
        if (selectedLead) {
            fetchLeadQuotes(selectedLead.id);
        }
    };

    const handleQuoteStatusChange = async (quoteId: string, newStatus: Quote['status']) => {
        try {
            const response = await api.quotes.updateStatus(parseInt(quoteId), newStatus);

            // Handle Project Creation Response
            if (newStatus === 'Aprovado' && response.project_id) {
                alert(`✅ Orçamento Aprovado! Projeto #${response.project_id} criado.`);
            }

            const updatedQuoteData = { status: newStatus, projectId: response.project_id };

            setLinkedQuotes(linkedQuotes.map((q: any) =>
                q.id === quoteId ? { ...q, ...updatedQuoteData } : q
            ));

            // Also update the modal view if it's the one open
            if (selectedQuoteForDetails && selectedQuoteForDetails.id === quoteId) {
                setSelectedQuoteForDetails({ ...selectedQuoteForDetails, ...updatedQuoteData });
            }
        } catch (error) {
            console.error('Erro ao atualizar status do orçamento:', error);
            // Optionally revert UI or show toasted error
        }
    };

    const getStatusColor = (status: Quote['status']) => {
        switch (status) {
            case 'Aprovado': return 'green';
            case 'Recusado': return 'red';
            case 'Pendente': return 'yellow';
            case 'Enviado': return 'blue';
            default: return 'gray';
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background-light dark:bg-background-dark">
            <NewLeadModal
                isOpen={isLeadModalOpen}
                onClose={() => setIsLeadModalOpen(false)}
                onSave={refetchLeads}
            />

            {/* Passing selected lead data to pre-fill quote modal */}
            <NewQuoteModal
                isOpen={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
                initialData={selectedLead ? {
                    client: selectedLead.name,
                    phone: selectedLead.phone,
                    leadId: String(selectedLead.id),
                    project: selectedLead.project
                } : undefined}
                onSave={handleSaveQuote}
            />

            <QuoteDetailsModal
                quote={selectedQuoteForDetails}
                isOpen={!!selectedQuoteForDetails}
                onClose={() => setSelectedQuoteForDetails(null)}
                onStatusChange={(status) => selectedQuoteForDetails && handleQuoteStatusChange(selectedQuoteForDetails.id, status)}
            />

            <div className="px-4 md:px-10 lg:px-12 xl:px-20 py-8 max-w-[1600px] mx-auto w-full overflow-y-auto h-full scroll-smooth">
                {/* Header */}
                <div className="flex flex-wrap justify-between gap-3 p-4 items-end mb-4">
                    <div className="flex min-w-72 flex-col gap-3">
                        <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]">Gestão de Leads</h1>
                        <p className="text-text-muted text-base font-normal leading-normal">Pipeline de vendas e acompanhamento de orçamentos.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setIsExportOpen(!isExportOpen)}
                                className="flex items-center justify-center rounded-lg h-10 px-4 bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 shadow-sm font-bold text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                            >
                                <span className="material-symbols-outlined mr-2">ios_share</span> Exportar Leads
                            </button>
                            {isExportOpen && (
                                <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-[#e7dbcf] dark:border-neutral-700 z-20 overflow-hidden animate-fade-in">
                                    <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm font-medium flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-500 text-[18px]">picture_as_pdf</span> PDF
                                    </button>
                                    <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm font-medium flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-600 text-[18px]">table_view</span> Excel
                                    </button>
                                </div>
                            )}
                        </div>

                        <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 shadow-sm font-bold text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                            <span className="material-symbols-outlined mr-2">filter_list</span> Filtros
                        </button>
                        <button
                            onClick={() => setIsLeadModalOpen(true)}
                            className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white shadow-sm font-bold text-sm hover:bg-primary-hover transition-colors"
                        >
                            <span className="material-symbols-outlined mr-2">add</span> Novo Lead
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 mb-2">
                    {(() => {
                        const newLeads = leads.filter(l => l.status === 'Novo' || l.status === 'New').length;
                        const negotiation = leads.filter(l => l.status === 'Em Contato' || l.status === 'Qualificado').length;
                        const lost = leads.filter(l => l.status === 'Perdido' || l.status === 'Fechado').length;
                        const qualfied = leads.filter(l => l.status === 'Qualificado').length;

                        return [
                            { title: 'Novos Leads', value: newLeads, change: '-', icon: 'fiber_new' },
                            { title: 'Em Negociação', value: negotiation, change: '-', icon: 'handshake' },
                            { title: 'Qualificados', value: qualfied, change: '-', icon: 'calendar_clock' },
                            { title: 'Perdidos', value: lost, change: '-', icon: 'cancel' },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col gap-2 rounded-xl p-6 border border-[#e7dbcf] dark:border-neutral-800 bg-surface-light dark:bg-surface-dark shadow-sm">
                                <div className="flex justify-between items-center">
                                    <p className="text-text-muted text-sm font-medium">{stat.title}</p>
                                    <span className="material-symbols-outlined text-primary">{stat.icon}</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                                    {stat.change !== '-' && <p className="text-green-600 text-sm font-medium bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">{stat.change}</p>}
                                </div>
                            </div>
                        ));
                    })()}
                </div>

                {/* Tabs */}
                <div className="pb-2 px-4 mt-4">
                    <div className="flex border-b border-[#e7dbcf] dark:border-neutral-800 gap-8 overflow-x-auto">
                        {['Todos os Leads', 'Novos', 'Qualificados', 'Em Contato', 'Perdidos'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setCurrentFilter(tab)}
                                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 min-w-fit ${currentFilter === tab ? 'border-primary font-bold' : 'border-transparent text-text-muted hover:text-text-main font-medium'}`}
                            >
                                <p className="text-sm tracking-[0.015em]">{tab}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="px-4 py-3">
                    <div className="flex overflow-hidden rounded-lg border border-[#e7dbcf] dark:border-neutral-800 bg-surface-light dark:bg-surface-dark shadow-sm">
                        <div className="overflow-x-auto w-full">
                            <table className="flex-1 w-full min-w-[900px]">
                                <thead>
                                    <tr className="bg-background-light dark:bg-neutral-800 border-b border-[#e7dbcf] dark:border-neutral-800 text-left text-sm font-bold">
                                        <th className="px-4 py-4 w-[25%]">Nome do Cliente</th>
                                        <th className="px-4 py-4 w-[20%]">Contato</th>
                                        <th className="px-4 py-4 w-[12%]">Status</th>
                                        <th className="px-4 py-4 w-[12%]">Fonte</th>
                                        <th className="px-4 py-4 w-[12%]">Data Criação</th>
                                        <th className="px-4 py-4 w-[19%]">Próxima Ação</th>
                                        <th className="px-4 py-4 w-[50px]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e7dbcf] dark:divide-neutral-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-10 text-center text-text-muted">Carregando leads...</td>
                                        </tr>
                                    ) : leads.length > 0 ? (
                                        leads.filter(row => {
                                            if (currentFilter === 'Todos os Leads') return true;
                                            if (currentFilter === 'Novos') return row.status === 'Novo';
                                            if (currentFilter === 'Qualificados') return row.status === 'Qualificados';
                                            if (currentFilter === 'Em Contato') return row.status === 'Em Contato';
                                            if (currentFilter === 'Perdidos') return row.status === 'Perdido' || row.status === 'Fechado';
                                            return true;
                                        }).map((row, i) => {
                                            const statusConfig: { [key: string]: string } = {
                                                'Novo': 'blue',
                                                'Qualificados': 'green',
                                                'Qualificado': 'green',
                                                'Em Contato': 'yellow',
                                                'Fechado': 'gray',
                                                'Perdido': 'red'
                                            };
                                            const statusCol = statusConfig[row.status] || 'gray';

                                            return (
                                                <tr
                                                    key={row.id}
                                                    onClick={() => handleRowClick(row)}
                                                    className={`hover:bg-background-light dark:hover:bg-neutral-800/50 cursor-pointer border-l-4 transition-colors ${selectedLead?.id === row.id ? 'bg-orange-50/50 dark:bg-surface-dark border-l-primary' : 'border-l-transparent'}`}
                                                >
                                                    <td className="px-4 py-4 text-sm font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full bg-${row.avatarColor}-100 dark:bg-${row.avatarColor}-900/40 text-${row.avatarColor}-700 flex items-center justify-center text-xs font-bold`}>
                                                                {row.avatarInitials}
                                                            </div>
                                                            <div>
                                                                <span className="block">{row.name}</span>
                                                                <span className="text-xs text-text-muted font-normal">{row.project}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-text-muted">
                                                        <div className="flex flex-col">
                                                            <span className="text-text-main dark:text-gray-200 font-medium">{row.phone}</span>
                                                            <span className="text-xs">{row.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-flex items-center rounded-md bg-${statusCol}-50 dark:bg-${statusCol}-900/20 px-2 py-1 text-xs font-medium text-${statusCol}-700 dark:text-${statusCol}-300 ring-1 ring-inset ring-${statusCol}-600/20`}>{row.status}</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-text-muted">{row.source}</td>
                                                    <td className="px-4 py-4 text-sm text-text-muted">{new Date(row.createdAt).toLocaleDateString('pt-BR')}</td>
                                                    <td className="px-4 py-4">
                                                        <div className={`flex items-center gap-2 text-text-muted font-medium text-sm`}>
                                                            <span className="material-symbols-outlined text-lg">event</span> Ver detalhes
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <span className="material-symbols-outlined text-lg text-text-muted">chevron_right</span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-10 text-center text-text-muted">Nenhum lead encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Overlay */}
            {selectedLead && (
                <div className="w-full md:w-[480px] bg-surface-light dark:bg-surface-dark border-l border-[#e7dbcf] dark:border-neutral-800 shadow-2xl z-30 flex flex-col h-full shrink-0 absolute right-0 top-0 animate-fade-in">
                    <div className="p-6 border-b border-[#e7dbcf] dark:border-neutral-800 flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-full bg-${selectedLead.avatarColor}-100 dark:bg-${selectedLead.avatarColor}-900/40 text-${selectedLead.avatarColor}-700 flex items-center justify-center text-lg font-bold`}>{selectedLead.avatarInitials}</div>
                            <div>
                                <h3 className="text-xl font-bold">{selectedLead.name}</h3>
                                <p className="text-text-muted text-sm">{selectedLead.project}</p>
                            </div>
                        </div>
                        <button onClick={closeDetail} className="text-text-muted hover:text-text-main rounded-full p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto relative">
                        <div className="p-6 bg-background-light dark:bg-neutral-800/30 border-b border-[#e7dbcf] dark:border-neutral-800">
                            {/* Status Dropdown */}
                            <div className="flex items-center justify-between mb-4 relative">
                                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Status do Lead</span>
                                <button
                                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                    className="inline-flex items-center gap-2 rounded-md bg-surface-light dark:bg-surface-dark border border-gray-300 dark:border-neutral-600 px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    <span className={`w-2 h-2 rounded-full 
                                        ${selectedLead.status === 'Novo' ? 'bg-blue-500' :
                                            selectedLead.status === 'Qualificado' || selectedLead.status === 'Qualificados' ? 'bg-green-500' :
                                                selectedLead.status === 'Em Contato' ? 'bg-yellow-500' : 'bg-red-500'}`}></span> {selectedLead.status} <span className="material-symbols-outlined text-lg">arrow_drop_down</span>
                                </button>

                                {isStatusDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-[#e7dbcf] dark:border-neutral-700 z-20 py-1 animate-fade-in">
                                        {[
                                            { label: 'Novo', col: 'blue' },
                                            { label: 'Em Contato', col: 'yellow' },
                                            { label: 'Qualificado', col: 'green' },
                                            { label: 'Perdido', col: 'red' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.label}
                                                onClick={() => handleStatusChange(opt.label)}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                                            >
                                                <span className={`w-2 h-2 rounded-full bg-${opt.col}-500`}></span> {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 relative">
                                <button
                                    onClick={() => setActiveAction(activeAction === 'call' ? null : 'call')}
                                    className={`flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-lg transition-colors ${activeAction === 'call' ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                                >
                                    <span className="material-symbols-outlined text-lg">call</span> Ligar
                                </button>
                                <button
                                    onClick={() => setActiveAction(activeAction === 'email' ? null : 'email')}
                                    className={`flex items-center justify-center gap-2 border text-sm font-bold py-2.5 rounded-lg transition-colors ${activeAction === 'email' ? 'bg-surface-light dark:bg-surface-dark border-primary text-primary' : 'bg-surface-light dark:bg-surface-dark border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800'}`}
                                >
                                    <span className="material-symbols-outlined text-lg">mail</span> Email
                                </button>
                            </div>

                            {/* Action Frames (Inline Modals) */}
                            {activeAction === 'call' && (
                                <div className="mt-4 p-4 bg-white dark:bg-surface-dark rounded-xl border border-primary/20 shadow-lg animate-fade-in">
                                    <h5 className="font-bold text-sm mb-2">Iniciar Chamada</h5>
                                    <p className="text-2xl font-black mb-4">{selectedLead.phone}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCall}
                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">call</span> Chamar
                                        </button>
                                        <button
                                            onClick={handleWhatsApp}
                                            className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">chat</span> WhatsApp
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeAction === 'email' && (
                                <div className="mt-4 p-4 bg-white dark:bg-surface-dark rounded-xl border border-gray-300 dark:border-neutral-700 shadow-lg animate-fade-in">
                                    <h5 className="font-bold text-sm mb-2">Novo Email</h5>
                                    <p className="text-xs text-text-muted mb-3">Para: {selectedLead.email}</p>
                                    <textarea className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-2 text-sm mb-3 resize-none" rows={3} placeholder="Assunto: Proposta de Projeto..."></textarea>
                                    <button onClick={handleSendEmail} className="w-full bg-primary text-white py-2 rounded-lg font-bold text-sm">Enviar Email (App Padrão)</button>
                                </div>
                            )}
                        </div>

                        {/* Orçamentos Section */}
                        <div className="p-6 border-b border-[#e7dbcf] dark:border-neutral-800">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-base">Orçamentos</h4>
                                <button
                                    onClick={() => setIsQuoteModalOpen(true)}
                                    className="text-xs font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span> Novo
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                {linkedQuotes.length > 0 ? (
                                    linkedQuotes.map((quote: any) => (
                                        <div key={quote.id} className="p-3 rounded-lg border border-[#e7dbcf] dark:border-neutral-800 bg-background-light dark:bg-background-dark/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-sm">{quote.project}</p>
                                                    <p className="text-xs text-text-muted">{quote.date} • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.value)}</p>
                                                </div>
                                                <div className="relative group/status">
                                                    <span className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-${getStatusColor(quote.status)}-100 text-${getStatusColor(quote.status)}-700 dark:bg-${getStatusColor(quote.status)}-900/30 dark:text-${getStatusColor(quote.status)}-400`}>
                                                        {quote.status}
                                                    </span>

                                                    {/* Quick Status Change */}
                                                    <div className="hidden group-hover/status:flex flex-col absolute top-full right-0 bg-white dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg shadow-xl z-20 min-w-[120px] overflow-hidden">
                                                        {['Pendente', 'Enviado', 'Aprovado', 'Recusado'].map(st => (
                                                            <button
                                                                key={st}
                                                                onClick={() => handleQuoteStatusChange(quote.id, st as Quote['status'])}
                                                                className="text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-neutral-800"
                                                            >
                                                                {st}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => setSelectedQuoteForDetails(quote)}
                                                    className="flex-1 text-xs border border-[#e7dbcf] dark:border-neutral-700 rounded py-1 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors font-medium"
                                                >
                                                    Ver Detalhes
                                                </button>
                                                <button className="text-xs border border-[#e7dbcf] dark:border-neutral-700 rounded px-2 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"><span className="material-symbols-outlined text-sm">picture_as_pdf</span></button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-text-muted text-sm border border-dashed border-[#e7dbcf] dark:border-neutral-800 rounded-lg">
                                        Nenhum orçamento criado.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Projects Section (New Integration) */}
                        {linkedProjects.length > 0 && (
                            <div className="p-6 border-b border-[#e7dbcf] dark:border-neutral-800 bg-surface-light dark:bg-surface-dark">
                                <h4 className="font-bold text-base mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">view_kanban</span>
                                    Projetos em Andamento
                                </h4>
                                <div className="space-y-3">
                                    {linkedProjects.map((proj, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border border-[#e7dbcf] dark:border-neutral-700 bg-white dark:bg-black/20 shadow-sm relative overflow-hidden group">
                                            <div className={`absolute top-0 left-0 w-1 h-full 
                                                ${proj.status === 'Refinamento' ? 'bg-blue-500' :
                                                    proj.status === 'Montagem' ? 'bg-purple-500' :
                                                        proj.status === 'Entregue' ? 'bg-green-500' : 'bg-gray-500'}`}>
                                            </div>
                                            <div className="pl-3">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="font-bold text-sm text-text-main">{proj.title}</h5>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-text-muted">
                                                        {proj.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-text-muted mt-1">
                                                    Prazo: {new Date(proj.deadline).toLocaleDateString('pt-BR')}
                                                </p>
                                                <div className="mt-3 w-full bg-gray-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-primary transition-all duration-500`}
                                                        style={{ width: proj.status === 'Entregue' ? '100%' : proj.status === 'Montagem' ? '60%' : '20%' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            <h4 className="font-bold text-base mb-4">Informações</h4>
                            <div className="space-y-4">
                                {[
                                    { icon: 'phone', val: selectedLead.phone, lbl: 'Celular' },
                                    { icon: 'email', val: selectedLead.email, lbl: 'Email' },
                                    { icon: 'source', val: 'Instagram', lbl: 'Fonte' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-3">
                                        <span className="material-symbols-outlined text-text-muted">{item.icon}</span>
                                        <div>
                                            <p className="text-sm font-medium">{item.val}</p>
                                            <p className="text-text-muted text-xs">{item.lbl}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#e7dbcf] dark:border-neutral-800">
                            <h4 className="font-bold text-base mb-6">Histórico de Interações</h4>
                            <div className="relative border-l-2 border-[#e7dbcf] dark:border-neutral-700 ml-3 space-y-8">
                                {interactions.length > 0 ? interactions.map((interaction, i) => (
                                    <div key={i} className="ml-6 relative">
                                        <div className="absolute -left-[33px] bg-surface-light dark:bg-surface-dark border-2 border-[#e7dbcf] dark:border-neutral-700 rounded-full p-1.5 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm text-text-muted">
                                                {interaction.type === 'note' ? 'sticky_note_2' : 'info'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{interaction.type === 'note' ? 'Nota' : 'Ação'}</p>
                                            <p className="text-xs text-text-muted">{new Date(interaction.created_at).toLocaleString('pt-BR')}</p>
                                            <p className="text-sm text-text-muted mt-1">{interaction.content}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-text-muted ml-6">Nenhuma interação registrada ainda.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-[#e7dbcf] dark:border-neutral-800 bg-surface-light dark:bg-surface-dark">
                        <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Nova Nota</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                className="flex-1 rounded-lg border-gray-300 dark:border-neutral-700 bg-background-light dark:bg-neutral-800 text-sm focus:ring-primary focus:border-primary"
                                placeholder="Escreva uma observação..."
                                onKeyPress={(e) => e.key === 'Enter' && handleSendNote()}
                            />
                            <button onClick={handleSendNote} className="bg-text-main dark:bg-white text-white dark:text-black rounded-lg px-3 py-2"><span className="material-symbols-outlined text-lg">send</span></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;
