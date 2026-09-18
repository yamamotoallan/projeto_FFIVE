import React, { useState, useEffect } from 'react';
import { api } from '../src/services/api';

interface AuditLog {
    id: number;
    user_name: string;
    entity_type: string;
    entity_id: string;
    action: string;
    description: string;
    created_at: string;
}

const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        query: '',
        user: '',
        entity_type: 'all',
        date_from: '',
        date_to: ''
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await api.auditLogs.list(filters);
            // api.ts returns the json directly (array of logs)
            // Need to verify if backend returns array or { logs: [] }
            // Previous code: const data = await response.json(); setLogs(data);
            // So seemingly it returns array.
            if (Array.isArray(data)) {
                setLogs(data);
            } else if (data.logs) {
                setLogs(data.logs);
            } else {
                setLogs([]);
            }
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionBadge = (action: string) => {
        const colors: { [key: string]: string } = {
            'CREATE': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            'UPDATE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            'DELETE': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            'FINALIZE': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
        };
        return colors[action] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="p-6 bg-background-light dark:bg-background-dark min-h-full">
            <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black">Auditoria de Logs</h1>
                    <p className="text-text-muted">Histórico completo de modificações no sistema.</p>
                </div>
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-text-muted px-1">Busca (Descrição/ID)</label>
                        <input
                            type="text"
                            placeholder="Ex: PROJ-123, Lead..."
                            className="rounded-lg border-[#e7dbcf] dark:border-neutral-700 bg-surface-light dark:bg-surface-dark text-sm w-48 focus:ring-primary h-10"
                            value={filters.query}
                            onChange={e => setFilters({ ...filters, query: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-text-muted px-1">Usuário</label>
                        <input
                            type="text"
                            placeholder="Nome..."
                            className="rounded-lg border-[#e7dbcf] dark:border-neutral-700 bg-surface-light dark:bg-surface-dark text-sm w-32 focus:ring-primary h-10"
                            value={filters.user}
                            onChange={e => setFilters({ ...filters, user: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-text-muted px-1">Entidade</label>
                        <select
                            className="rounded-lg border-[#e7dbcf] dark:border-neutral-700 bg-surface-light dark:bg-surface-dark text-sm w-32 focus:ring-primary h-10"
                            value={filters.entity_type}
                            onChange={e => setFilters({ ...filters, entity_type: e.target.value })}
                        >
                            <option value="all">Todas</option>
                            <option value="lead">Lead</option>
                            <option value="quote">Orçamento</option>
                            <option value="project">Projeto</option>
                            <option value="event">Evento</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-text-muted px-1">Período De</label>
                        <input
                            type="date"
                            className="rounded-lg border-[#e7dbcf] dark:border-neutral-700 bg-surface-light dark:bg-surface-dark text-sm focus:ring-primary h-10"
                            value={filters.date_from}
                            onChange={e => setFilters({ ...filters, date_from: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-text-muted px-1">Até</label>
                        <input
                            type="date"
                            className="rounded-lg border-[#e7dbcf] dark:border-neutral-700 bg-surface-light dark:bg-surface-dark text-sm focus:ring-primary h-10"
                            value={filters.date_to}
                            onChange={e => setFilters({ ...filters, date_to: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="bg-primary text-white h-10 px-6 rounded-lg font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">filter_alt</span>
                        <span>Filtrar</span>
                    </button>
                    <button
                        onClick={() => {
                            setFilters({ query: '', user: '', entity_type: 'all', date_from: '', date_to: '' });
                            // Pequeno delay para garantir que o estado foi limpo antes de buscar
                            setTimeout(fetchLogs, 10);
                        }}
                        className="h-10 px-4 rounded-lg font-bold border border-[#e7dbcf] dark:border-neutral-700 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                        Limpar
                    </button>
                </div>
            </header>

            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-neutral-800 border-b border-[#e7dbcf] dark:border-neutral-700">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Data/Hora</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Usuário</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Entidade</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Ação</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Descrição</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e7dbcf] dark:divide-neutral-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-text-muted italic">Carregando logs...</td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {new Date(log.created_at).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold">
                                            {log.user_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="capitalize text-text-muted font-medium">{log.entity_type}</span>
                                            <span className="text-xs ml-2 text-primary">#{log.entity_id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getActionBadge(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted">
                                            {log.description}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-text-muted">Nenhum log registrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
