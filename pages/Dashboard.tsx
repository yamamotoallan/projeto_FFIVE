import React, { useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Quote, User } from '../types';
import { useNavigate } from 'react-router-dom';
import NewQuoteModal from '../components/NewQuoteModal';
import NewAppointmentModal from '../components/NewAppointmentModal';
import NewLeadModal from '../components/NewLeadModal';
import NotificationBell from '../components/NotificationBell';
import UserMenu from '../components/UserMenu';
import ThemeToggle from '../components/ThemeToggle';
import MetricCard from '../components/MetricCard';
import RevenueChart from '../components/RevenueChart';
import ConversionFunnel from '../components/ConversionFunnel';
import { DollarSign, Clock, TrendingUp, Target } from 'lucide-react';
import { api } from '../src/services/api';
import { Skeleton } from '../src/components/Loading';

// Mocks removidos - Dados agora são buscados da API

interface DashboardProps {
    user: User;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

    // Analytics state
    const [analytics, setAnalytics] = useState<any>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
    const [todaysEvents, setTodaysEvents] = useState<any[]>([]);
    const [newLeads, setNewLeads] = useState<any[]>([]);

    // Buscar dados iniciais
    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [analyticsData, quotes, leads] = await Promise.all([
                    api.analytics.getSummary(),
                    api.quotes.list(),
                    api.leads.list()
                ]);

                setAnalytics(analyticsData);

                // Processar Orçamentos Recentes (Top 5 não aprovados primeiro ou recentes)
                // Filter items that are NOT approved/rejected for "Open" view, or just recent
                const openQuotes = Array.isArray(quotes) ? quotes
                    .filter(q => q.status !== 'Aprovado' && q.status !== 'Rejeitado')
                    .slice(0, 5) : [];
                setRecentQuotes(openQuotes.length > 0 ? openQuotes : (Array.isArray(quotes) ? quotes.slice(0, 5) : []));

                // Processar Novos Leads (Top 3 recentes criados < 24h)
                const oneDayAgo = new Date();
                oneDayAgo.setHours(oneDayAgo.getHours() - 24);

                const recentLeads = Array.isArray(leads) ? leads
                    .filter(l => new Date(l.createdAt) > oneDayAgo)
                    .slice(0, 3) : [];
                setNewLeads(recentLeads);

                // Agenda do Dia
                const today = new Date().toISOString().split('T')[0];

                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr = tomorrow.toISOString().split('T')[0];

                const todaysAgenda = await api.events.list(today, tomorrowStr);

                if (Array.isArray(todaysAgenda)) {
                    setTodaysEvents(todaysAgenda.filter((e: any) => {
                        // Double check client side to be sure it falls on today
                        const eventDate = new Date(e.time_start).toDateString();
                        return eventDate === new Date().toDateString();
                    }).slice(0, 5));
                }

            } catch (error) {
                console.error('Erro ao buscar dados do dashboard:', error);
            } finally {
                setLoadingAnalytics(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in w-full p-4 md:p-6 overflow-y-auto">
            <NewQuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
            <NewAppointmentModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} />
            <NewLeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} />

            {/* Header */}
            <header className="flex flex-wrap justify-between items-end gap-4 pb-2">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
                    <p className="text-text-muted dark:text-text-dark-muted text-sm font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                        {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })} - Visão Geral do Dia
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark shadow-sm">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <ThemeToggle />
                    <NotificationBell />
                    <UserMenu user={user} onLogout={onLogout} />
                </div>
            </header>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
                <button
                    onClick={() => setIsAppointmentModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 rounded-xl shadow-sm hover:shadow-md transition-all group"
                >
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">event</span>
                    <span className="font-bold text-sm">Adicionar Compromisso</span>
                </button>
                <button
                    onClick={() => setIsLeadModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 rounded-xl shadow-sm hover:shadow-md transition-all group"
                >
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">person_add</span>
                    <span className="font-bold text-sm">Novo Lead</span>
                </button>
                <button
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-primary text-white border border-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all group"
                >
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">post_add</span>
                    <span className="font-bold text-sm">Criar Orçamento</span>
                </button>
            </div>

            {/* Analytics Section */}
            {!loadingAnalytics && analytics && (
                <>
                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            title="Taxa de Conversão"
                            value={`${analytics.conversion?.conversion_rate || 0}%`}
                            subtitle={`${analytics.conversion?.total_projects || 0} projetos de ${analytics.conversion?.total_leads || 0} leads`}
                            trend={analytics.comparison?.trend}
                            trendValue={`${Math.abs(analytics.comparison?.change || 0)}%`}
                            icon={<Target size={24} className="text-white" />}
                            color="primary"
                        />

                        <MetricCard
                            title="Tempo Médio"
                            value={`${analytics.closingTime?.avgDays || 0} dias`}
                            subtitle="Lead até projeto"
                            icon={<Clock size={24} className="text-white" />}
                            color="info"
                        />

                        <MetricCard
                            title="Ticket Médio"
                            value={`R$ ${(analytics.ticket?.avgValue || 0).toLocaleString('pt-BR')}`}
                            subtitle={`Min: R$ ${(analytics.ticket?.minValue || 0).toLocaleString('pt-BR')} | Max: R$ ${(analytics.ticket?.maxValue || 0).toLocaleString('pt-BR')}`}
                            icon={<DollarSign size={24} className="text-white" />}
                            color="success"
                        />

                        <MetricCard
                            title="Novos Leads"
                            value={analytics.comparison?.current || 0}
                            subtitle="Últimos 30 dias"
                            trend={analytics.comparison?.trend}
                            trendValue={`vs ${analytics.comparison?.previous || 0} anterior`}
                            icon={<TrendingUp size={24} className="text-white" />}
                            color="warning"
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ConversionFunnel data={analytics.funnel || { leads: 0, quotes: 0, approved: 0, projects: 0 }} />
                        <RevenueChart data={analytics.revenue || []} />
                    </div>
                </>
            )}

            {loadingAnalytics && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando métricas...</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts Column */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Leads Chart */}
                        <div onClick={() => navigate('/leads')} className="flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 p-6 shadow-sm cursor-pointer hover:border-primary/30 transition-colors">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-lg font-bold">Acompanhamento de Leads</h2>
                                    <p className="text-sm text-text-muted">Últimos 7 dias</p>
                                </div>
                                <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-bold">+12%</div>
                            </div>
                            <div className="h-40 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics?.leadsChart || []}>
                                        <defs>
                                            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ec7f13" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ec7f13" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="value" stroke="#ec7f13" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9a734c' }} dy={10} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Status Bar Chart */}
                        <div onClick={() => navigate('/orcamentos')} className="flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 p-6 shadow-sm cursor-pointer hover:border-primary/30 transition-colors">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-lg font-bold">Orçamentos por Status</h2>
                                    <p className="text-sm text-text-muted">Distribuição Atual</p>
                                </div>
                            </div>
                            <div className="h-40 w-full flex items-end justify-between gap-3 mt-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics?.statusChart || []}>
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {(analytics?.statusChart || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9a734c', fontWeight: 'bold' }} dy={10} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Recent Quotes Table */}
                    <div className="flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#e7dbcf] dark:border-neutral-800">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">pending_actions</span>
                                Orçamentos em Aberto
                            </h2>
                            <button onClick={() => navigate('/orcamentos')} className="text-sm font-bold text-primary hover:underline">Ver todos</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#fcfaf8] dark:bg-neutral-800 text-text-muted">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Cliente</th>
                                        <th className="px-6 py-3 font-medium">Projeto</th>
                                        <th className="px-6 py-3 font-medium">Valor Estimado</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e7dbcf] dark:divide-neutral-800">
                                    {recentQuotes.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                                                Nenhum orçamento em aberto encontrado.
                                            </td>
                                        </tr>
                                    ) : recentQuotes.map((quote) => (
                                        <tr key={quote.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{quote.client}</td>
                                            <td className="px-6 py-4 text-text-muted">{quote.project}</td>
                                            <td className="px-6 py-4 font-medium">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.value)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${quote.status === 'Em Análise' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                                                        quote.status === 'Aprovado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                    {quote.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => navigate('/orcamentos')} className="text-text-muted hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Column */}
                <div className="flex flex-col gap-6">
                    {/* Agenda Widget */}
                    <div className="flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Agenda do Dia</h2>
                            <span className="material-symbols-outlined text-text-muted">calendar_month</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            {todaysEvents.length === 0 ? (
                                <p className="text-sm text-text-muted text-center py-4">Sem compromissos hoje.</p>
                            ) : todaysEvents.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-start group cursor-pointer" onClick={() => navigate('/agenda')}>
                                    <div className="flex flex-col items-center">
                                        <div className="text-xs font-bold">{new Date(item.time_start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                        {idx !== todaysEvents.length - 1 && <div className="w-0.5 h-full bg-primary/20 mt-1 rounded-full min-h-[20px]"></div>}
                                    </div>
                                    <div className="flex-1 pb-4 border-b border-[#e7dbcf]/50 dark:border-neutral-800/50 last:border-0 last:pb-0">
                                        <div className={`rounded-lg p-3 ${item.type === 'Medição' ? 'bg-primary/10' : 'bg-gray-50 dark:bg-neutral-800'}`}>
                                            <p className="text-sm font-bold">{item.title}</p>
                                            <p className="text-xs text-text-muted mt-1">{item.subtitle || item.description || 'Sem local'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => navigate('/agenda')} className="w-full mt-4 py-2 border border-dashed border-[#e7dbcf] dark:border-neutral-700 text-text-muted rounded-lg text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                            Ver agenda completa
                        </button>
                    </div>

                    {/* New Leads Widget */}
                    <div className="flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 p-6 shadow-sm flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Novos Leads (24h)</h2>
                            <span className="inline-flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">{newLeads.length} Novos</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {newLeads.length === 0 ? (
                                <p className="text-sm text-text-muted text-center py-4">Nenhum novo lead nas últimas 24h.</p>
                            ) : newLeads.map((lead, idx) => (
                                <div onClick={() => navigate('/leads')} key={idx} className="flex items-center justify-between p-3 rounded-lg border border-[#e7dbcf] dark:border-neutral-800 hover:border-primary/50 transition-colors bg-white dark:bg-transparent relative overflow-hidden group cursor-pointer">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${lead.avatarColor ? `bg-${lead.avatarColor}-500` : 'bg-primary'} rounded-l-lg`}></div>
                                    <div className="flex items-center gap-3 pl-2">
                                        <div className={`w-8 h-8 rounded-full ${lead.avatarColor ? `bg-${lead.avatarColor}-100 text-${lead.avatarColor}-600` : 'bg-blue-100 text-blue-600'} dark:bg-opacity-20 flex items-center justify-center font-bold text-xs`}>
                                            {lead.avatarInitials || lead.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{lead.name}</p>
                                            <p className="text-xs text-text-muted">{new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {lead.source}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-full text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">chat</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;