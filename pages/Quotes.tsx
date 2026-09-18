import React, { useState } from 'react';
import NewQuoteModal from '../components/NewQuoteModal';
import QuoteDetailsModal from '../components/QuoteDetailsModal';
import QuoteApproveModal from '../components/QuoteApproveModal';
import { Quote } from '../types';
import { api } from '../src/services/api';

const Quotes: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [isIdSorted, setIsIdSorted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [isExportOpen, setIsExportOpen] = useState(false);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const data = await api.quotes.list();
            // Map API fields if necessary or use as is if names match
            const mappedData = data.map((q: any) => ({
                ...q,
                id: String(q.id),
                value: Number(q.value),
                date: new Date(q.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
                validity: q.validity ? new Date(q.validity).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
            }));
            setQuotes(mappedData);
        } catch (error) {
            console.error("Erro ao buscar orçamentos:", error);
        } finally {
            setLoading(false);
        }
    };

    useState(() => {
        fetchQuotes();
    });

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [clientFilter, setClientFilter] = useState('Todos');
    const [periodFilter, setPeriodFilter] = useState('Todos');

    // Derived Data
    const uniqueClients = Array.from(new Set(quotes.map(q => q.client)));

    const filteredQuotes = quotes.filter(quote => {
        const matchesSearch =
            quote.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.status.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'Todos' || quote.status === statusFilter;
        const matchesClient = clientFilter === 'Todos' || quote.client === clientFilter;

        const matchesPeriod = periodFilter === 'Todos' || true;

        return matchesSearch && matchesStatus && matchesClient && matchesPeriod;
    });

    const handleViewQuote = (quote: Quote) => {
        setSelectedQuote(quote);
    };

    const handleExport = (type: 'pdf' | 'excel') => {
        setIsExportOpen(false);
        try {
            // CSV export (Excel-compatible)
            const headers = ['ID', 'Cliente', 'Projeto', 'Status', 'Valor', 'Data'];
            const rows = quotes.map(q => [
                q.id, q.client, q.project, q.status, q.value, q.date
            ]);

            let csvContent = headers.join(',') + '\n';
            rows.forEach(row => {
                csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `orcamentos_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            alert('✅ Orçamentos exportados com sucesso!');
        } catch (error) {
            alert('❌ Erro ao exportar');
            console.error(error);
        }
    };

    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

    const handleStatusChange = async (newStatus: Quote['status']) => {
        if (selectedQuote) {
            if (newStatus === 'Aprovado') {
                setIsApproveModalOpen(true);
                return;
            }

            try {
                await api.quotes.updateStatus(parseInt(selectedQuote.id), newStatus);
                await fetchQuotes();
                setSelectedQuote(null);
            } catch (error) {
                console.error("Erro ao atualizar status do orçamento:", error);
            }
        }
    };

    const handleApproveConfirm = async (paymentInfo: any) => {
        if (selectedQuote) {
            try {
                // Call API with payment info
                await api.quotes.updateStatus(parseInt(selectedQuote.id), 'Aprovado', paymentInfo);
                await fetchQuotes();
                setSelectedQuote(null); // Close details modal
                alert('Orçamento aprovado e financeiro gerado com sucesso!');
            } catch (error) {
                console.error("Erro ao aprovar orçamento:", error);
                alert('Erro ao aprovar orçamento.');
            }
        }
    };

    // Note: To make the table update when modifying a quote via modal, 
    // we would ideally need to move quotesMock into a state variable.
    // For now, avoiding major refactor of data source, focusing on Filters.

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
            <NewQuoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchQuotes}
            />
            <QuoteDetailsModal
                quote={selectedQuote}
                isOpen={!!selectedQuote}
                onClose={() => setSelectedQuote(null)}
                onStatusChange={handleStatusChange}
            />
            <QuoteApproveModal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                onConfirm={handleApproveConfirm}
                quoteTotal={selectedQuote?.value || 0}
            />

            <header className="flex-shrink-0 px-8 py-6 border-b border-[#e7dbcf] dark:border-neutral-800 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm z-10">
                <div className="max-w-[1400px] mx-auto w-full flex flex-wrap justify-between items-end gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black leading-tight tracking-tight">Acompanhamento de Orçamentos</h1>
                        <p className="text-text-muted text-base font-normal">Gerencie suas propostas comerciais e monitore conversões.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setIsExportOpen(!isExportOpen)}
                                className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 shadow-sm text-sm font-bold"
                            >
                                <span className="material-symbols-outlined text-[20px]">ios_share</span> Exportar
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

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm text-sm font-bold"
                        >
                            <span className="material-symbols-outlined text-[20px]">add_circle</span> Novo Orçamento
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 pt-6">
                <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'Total em Aberto', icon: 'pending_actions', val: 'R$ 45.200', badge: '12%', badgeColor: 'green', bg: 'orange' },
                            { title: 'Aprovados (Mês)', icon: 'check_circle', val: '8', badge: '+2 vs mês passado', badgeColor: 'green', bg: 'green' },
                            { title: 'Taxa de Conversão', icon: 'pie_chart', val: '65%', badge: '+5%', badgeColor: 'green', bg: 'blue' },
                            { title: 'Vencidos', icon: 'warning', val: '3', badge: '-1%', badgeColor: 'red', bg: 'red' },
                        ].map((card, i) => (
                            <div key={i} className="flex flex-col gap-2 rounded-xl p-5 bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-text-muted text-sm font-semibold">{card.title}</p>
                                    <div className={`p-1.5 bg-${card.bg}-100 dark:bg-${card.bg}-900/30 rounded-full text-${card.bg}-600`}>
                                        <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                                    </div>
                                </div>
                                <div className="flex items-end gap-2">
                                    <p className="text-2xl font-bold leading-none">{card.val}</p>
                                    <span className={`text-${card.badgeColor}-600 text-xs font-bold mb-0.5 bg-${card.badgeColor}-50 dark:bg-${card.badgeColor}-900/20 px-1.5 py-0.5 rounded`}>{card.badge}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="relative flex-1 min-w-[300px] max-w-lg">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-text-muted">search</span>
                                </div>
                                <input
                                    className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-surface-light dark:bg-surface-dark focus:ring-2 focus:ring-primary shadow-sm text-sm"
                                    placeholder="Buscar por cliente, projeto ou ID..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 items-center">
                                {/* Status Filter */}
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 hover:border-primary transition-colors shadow-sm text-sm font-medium cursor-pointer focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="Todos">Status: Todos</option>
                                        <option value="Pendente">Pendente</option>
                                        <option value="Aprovado">Aprovado</option>
                                        <option value="Recusado">Recusado</option>
                                        <option value="Enviado">Enviado</option>
                                    </select>
                                    <span className="material-symbols-outlined text-text-muted text-[18px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                                </div>

                                {/* Client Filter */}
                                <div className="relative">
                                    <select
                                        value={clientFilter}
                                        onChange={(e) => setClientFilter(e.target.value)}
                                        className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 hover:border-primary transition-colors shadow-sm text-sm font-medium cursor-pointer focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="Todos">Cliente: Todos</option>
                                        {uniqueClients.map(client => (
                                            <option key={client} value={client}>{client}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined text-text-muted text-[18px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                                </div>

                                {/* Period Filter (Mock) */}
                                <div className="relative">
                                    <select
                                        value={periodFilter}
                                        onChange={(e) => setPeriodFilter(e.target.value)}
                                        className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 hover:border-primary transition-colors shadow-sm text-sm font-medium cursor-pointer focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="Todos">Período: Todos</option>
                                        <option value="Este Mês">Este Mês</option>
                                        <option value="Mês Passado">Mês Passado</option>
                                    </select>
                                    <span className="material-symbols-outlined text-text-muted text-[18px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                                </div>

                                <div className="h-6 w-px bg-[#e7dbcf] dark:bg-neutral-800 mx-1"></div>
                                <button
                                    onClick={() => { setSearchTerm(''); setStatusFilter('Todos'); setClientFilter('Todos'); setPeriodFilter('Todos'); }}
                                    className="text-text-muted hover:text-primary text-sm font-medium transition-colors"
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left border-collapse">
                                <thead>
                                    <tr className="bg-background-light dark:bg-neutral-800 border-b border-[#e7dbcf] dark:border-neutral-800">
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider w-20">ID</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Projeto / Cliente</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Valor Total</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Enviado</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Validade</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e7dbcf] dark:divide-neutral-800">
                                    {filteredQuotes.length > 0 ? (
                                        filteredQuotes.map((quote) => (
                                            <tr
                                                key={quote.id}
                                                className={`group hover:bg-background-light dark:hover:bg-neutral-800 transition-colors cursor-pointer border-l-4 ${quote.status === 'Pendente' ? 'bg-orange-50/50 dark:bg-orange-900/10 border-l-primary' : 'border-l-transparent'}`}
                                                onClick={() => handleViewQuote(quote)}
                                            >
                                                <td className="p-4 text-sm font-medium text-text-muted">#{quote.id}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{quote.project}</span>
                                                        <span className="text-text-muted text-xs">{quote.client}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold 
                                                ${quote.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' :
                                                            quote.status === 'Aprovado' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800' : ''}
                                            `}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${quote.status === 'Pendente' ? 'bg-yellow-500' : 'bg-green-500'}`}></span> {quote.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.value)}</td>
                                                <td className="p-4 text-sm">{quote.date}</td>
                                                <td className="p-4 text-sm">{quote.validity}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleViewQuote(quote); }}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e7dbcf] dark:hover:bg-neutral-700 text-text-muted"
                                                            title="Visualizar"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-text-muted">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="material-symbols-outlined text-4xl opacity-50">search_off</span>
                                                    <p>Nenhum orçamento encontrado com os filtros atuais.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Quotes;