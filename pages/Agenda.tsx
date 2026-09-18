import React, { useState, useEffect } from 'react';
import NewAppointmentModal from '../components/NewAppointmentModal';
import EventDetailsModal from '../components/EventDetailsModal';
import { api } from '../src/services/api';
import { useToast } from '../src/contexts/ToastContext';
import AgendaDashboard from '../components/AgendaDashboard';
import SummaryCard from '../components/SummaryCard';

const Agenda: React.FC = () => {
    const { success, error: showError } = useToast();
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    // Core State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

    // Filters (Optional)
    const [filters, setFilters] = useState<string[]>(['Reuniões', 'Instalações', 'Orçamentos', 'Oficina']);

    // --- Helpers ---

    const getMonthDays = (baseDate: Date) => {
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

        const days = [];

        // Padding (Previous Month)
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, prevMonthLastDay - i);
            days.push({ day: prevMonthLastDay - i, type: 'padding', fullDate: d });
        }

        // Current Month
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            days.push({ day: i, type: 'current', fullDate: d });
        }

        // Padding (Next Month) to fill 42 cells
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            const d = new Date(year, month + 1, i);
            days.push({ day: i, type: 'padding', fullDate: d });
        }

        return days;
    };

    // --- Data Fetching ---

    const fetchEvents = async () => {
        setLoading(true);
        try {
            let start: Date, end: Date;

            if (viewMode === 'month') {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                start = new Date(year, month, 1);
                start.setDate(start.getDate() - 7);
                end = new Date(year, month + 1, 0);
                end.setDate(end.getDate() + 14);
            } else {
                // List View: Broad range (-1 month to +3 months)
                start = new Date(currentDate);
                start.setMonth(start.getMonth() - 1);
                end = new Date(currentDate);
                end.setMonth(end.getMonth() + 3);
            }

            const endISO = new Date(end);
            endISO.setHours(23, 59, 59, 999);

            const data = await api.events.list(start.toISOString(), endISO.toISOString());
            setEvents(data);
        } catch (error: any) {
            console.error("Fetch Error:", error);
            showError('Erro ao carregar eventos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentDate, viewMode]);

    // --- Handlers ---

    const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
        if (direction === 'today') {
            setCurrentDate(new Date());
            return;
        }

        const modifier = direction === 'next' ? 1 : -1;
        const newDate = new Date(currentDate);
        // Navigate by month for both views for consistency
        newDate.setMonth(newDate.getMonth() + modifier);
        setCurrentDate(newDate);
    };

    const handleEventClick = (e: React.MouseEvent, event: any) => {
        e.stopPropagation();
        const time = event.time_start.split('T')[1].substring(0, 5);
        let timeStr = time;
        if (event.time_end) timeStr += ` - ${event.time_end.split('T')[1].substring(0, 5)}`;

        setSelectedEvent({
            ...event,
            time: timeStr,
            desc: event.description,
            subtitle: event.subtitle
        });
    };

    const handleComplete = async () => {
        const event = selectedEvent;
        if (!event || !event.id) return;
        try {
            await api.events.update(event.id, { confirmed: true });
            setSelectedEvent(null);
            fetchEvents();
            success('Compromisso marcado como realizado!');
        } catch (error) {
            showError('Erro ao concluir compromisso');
        }
    };

    // ...

    return (
        <div className="flex h-full w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
            <NewAppointmentModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onSave={fetchEvents} />
            <EventDetailsModal
                event={selectedEvent}
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onReschedule={handleReschedule}
                onComplete={handleComplete}
            />

            {/* Sidebar */}
            <aside className="w-80 bg-surface-light dark:bg-surface-dark border-r border-[#e7dbcf] dark:border-neutral-800 hidden md:flex flex-col overflow-y-auto z-20">
                <div className="p-6">
                    <button onClick={() => setIsNewModalOpen(true)} className="w-full bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-primary font-bold py-3 px-4 rounded-full shadow border border-gray-200 dark:border-neutral-700 flex items-center justify-center gap-2 transition-all mb-6">
                        <span className="material-symbols-outlined font-light text-3xl text-primary">add</span>
                        <span className="text-lg">Criar</span>
                    </button>

                    {/* Mini Calendar */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2 px-2">
                            <span className="font-bold text-sm capitalize">{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                            <div className="flex gap-1">
                                <span className="material-symbols-outlined text-gray-400 text-sm cursor-pointer hover:text-gray-600" onClick={() => handleNavigate('prev')}>chevron_left</span>
                                <span className="material-symbols-outlined text-gray-400 text-sm cursor-pointer hover:text-gray-600" onClick={() => handleNavigate('next')}>chevron_right</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 text-center text-[10px] mb-1 text-gray-400">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <span key={d}>{d}</span>)}
                        </div>
                        <div className="grid grid-cols-7 text-center text-xs gap-y-1">
                            {monthDays.slice(0, 35).map((d, i) => (
                                <button key={i} className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto ${d.fullDate.toDateString() === new Date().toDateString() ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-400'}`}>
                                    {d.day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filters */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 ml-2">Minhas Agendas</h4>
                        <div className="flex flex-col gap-1">
                            {filters.map((label, idx) => {
                                const colors = ['blue', 'orange', 'green', 'gray'];
                                const color = colors[idx % colors.length];
                                return (
                                    <label key={label} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
                                        <input type="checkbox" checked={true} readOnly className={`rounded text-${color}-500 focus:ring-${color}-500 border-gray-300 w-4 h-4`} />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1f1a14] relative">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-neutral-800 min-h-[64px]">
                    <div className="flex items-center gap-6">
                        {/* Month Title & Nav */}
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-normal text-gray-800 dark:text-gray-100 capitalize min-w-[180px]">
                                {viewMode === 'month' ? monthYearLabel : 'Dashboard'}
                            </h1>
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleNavigate('prev')} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors" title="Anterior">
                                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-xl">chevron_left</span>
                                </button>
                                <button onClick={() => handleNavigate('next')} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors" title="Próximo">
                                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400 text-xl">chevron_right</span>
                                </button>
                            </div>
                            <button onClick={() => handleNavigate('today')} className="ml-2 px-4 py-1.5 text-sm font-medium border border-gray-300 dark:border-neutral-700 rounded hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                                Hoje
                            </button>
                        </div>
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center gap-2">
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value as any)}
                            className="bg-transparent border border-gray-300 dark:border-neutral-700 rounded px-3 py-1.5 text-sm font-medium outline-none focus:border-primary cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 max-w-[150px]"
                        >
                            <option value="month">Mês</option>
                            <option value="list">Lista/Dashboard</option>
                        </select>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {viewMode === 'list' && (
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-6 pb-0 grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <SummaryCard count={overdueCount} label="Atrasadas" color="red" />
                                <SummaryCard count={todayCount} label="Hoje" color="blue" />
                                <SummaryCard count={next7DaysCount} label="Próximos 7 dias" color="purple" />
                                <SummaryCard count={completedCount} label="Concluídas" color="green" />
                            </div>
                            <AgendaDashboard events={events} onEventClick={(e) => {
                                handleEventClick({ stopPropagation: () => { } } as any, e); // Mock event object for reuse
                            }} />
                        </div>
                    )}

                    {viewMode === 'month' && (
                        <div className="flex-1 flex flex-col h-full">
                            {/* Grid Header */}
                            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-neutral-800">
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                                    <div key={d} className="py-2 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wide">{d}</div>
                                ))}
                            </div>
                            {/* Grid Body */}
                            <div className="flex-1 grid grid-cols-7 grid-rows-6 divide-y divide-gray-200 dark:divide-neutral-800 border-l border-gray-200 dark:border-neutral-800 h-full">
                                {monthDays.map((cell, idx) => {
                                    const cellDateStr = cell.fullDate.toISOString().split('T')[0];
                                    const dayEvents = events.filter(e => e.time_start.startsWith(cellDateStr));
                                    const isToday = cellDateStr === todayStr;

                                    return (
                                        <div
                                            key={idx}
                                            className={`relative border-r border-gray-200 dark:border-neutral-800 p-1 flex flex-col ${cell.type === 'padding' ? 'bg-gray-50/30' : 'bg-white dark:bg-[#1f1a14]'}`}
                                        >
                                            <div className="flex justify-center py-1">
                                                <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : cell.type === 'padding' ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {cell.day}
                                                </span>
                                            </div>

                                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[140px] px-1 scrollbar-hide">
                                                {dayEvents.map(ev => {
                                                    let bgClass = "bg-blue-100 text-blue-800";
                                                    if (ev.type === 'Instalação') bgClass = "bg-orange-100 text-orange-800";
                                                    if (ev.type === 'Orçamentos') bgClass = "bg-green-100 text-green-800";
                                                    if (ev.time_start < todayStr + 'T00:00:00' && !ev.confirmed) bgClass = "bg-red-100 text-red-800";
                                                    if (ev.title.toLowerCase().includes('reunião')) bgClass = "bg-purple-100 text-purple-800";

                                                    return (
                                                        <div
                                                            key={ev.id}
                                                            onClick={(e) => handleEventClick(e, ev)}
                                                            className={`text-[11px] px-2 py-0.5 rounded-[4px] cursor-pointer truncate font-medium ${bgClass} hover:opacity-80 transition-opacity`}
                                                            title={ev.title}
                                                        >
                                                            {ev.title}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Agenda;
