import React from 'react';

interface AgendaDashboardProps {
    events: any[];
    onEventClick: (event: any) => void;
}

const AgendaDashboard: React.FC<AgendaDashboardProps> = ({ events, onEventClick }) => {
    // Helper to categorize events
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Calculate date 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const overdue = events.filter(e => {
        // Only count as overdue if not completed (assuming 'confirmed' might mean done, or we need a status field. 
        // For now, let's assume 'past time' is overdue if not confirmed/done.
        // Simplifying: event before today and not 'concluded' (we don't have detailed status on events yet, usually just 'confirmed')
        return e.time_start < todayStr + 'T00:00:00' && !e.confirmed;
    });

    const today = events.filter(e => e.time_start.startsWith(todayStr));

    const next7Days = events.filter(e => {
        const start = e.time_start.split('T')[0];
        return start > todayStr && start <= nextWeekStr;
    });

    const completed = events.filter(e => e.confirmed); // Assuming confirmed = concluded for now, or we can use past events?

    // Helper to format Date
    const formatDate = (isoString: string) => {
        const [datePart, timePart] = isoString.split('T');
        const [y, m, d] = datePart.split('-');
        const [h, min] = timePart.split(':');
        return `${d}/${m} - ${h}:${min}`;
    };

    return (
        <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full dark:text-gray-100">
            {/* Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overdue / High Priority */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-red-500 font-bold uppercase text-sm tracking-wider">
                        <span className="material-symbols-outlined">warning</span>
                        <h4>Atrasadas / Pendentes</h4>
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{overdue.length}</span>
                    </div>
                    <div className="bg-white dark:bg-[#1f1a14] rounded-xl border border-red-100 dark:border-red-900/30 p-2 flex flex-col gap-2 min-h-[200px]">
                        {overdue.length === 0 ? (
                            <EmptyState message="Nenhuma pendência atrasada" />
                        ) : (
                            overdue.map(ev => (
                                <EventCard key={ev.id} event={ev} formatDate={formatDate} color="red" onClick={() => onEventClick(ev)} />
                            ))
                        )}
                    </div>
                </div>

                {/* Today */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-sm tracking-wider">
                        <span className="material-symbols-outlined">today</span>
                        <h4>Hoje</h4>
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{today.length}</span>
                    </div>
                    <div className="bg-white dark:bg-[#1f1a14] rounded-xl border border-blue-100 dark:border-blue-900/30 p-2 flex flex-col gap-2 min-h-[200px]">
                        {today.length === 0 ? (
                            <EmptyState message="Nenhum compromisso para hoje" />
                        ) : (
                            today.map(ev => (
                                <EventCard key={ev.id} event={ev} formatDate={formatDate} color="blue" onClick={() => onEventClick(ev)} />
                            ))
                        )}
                    </div>
                </div>

                {/* Next Days */}
                <div className="flex flex-col gap-4 lg:col-span-2">
                    <div className="flex items-center gap-2 text-purple-600 font-bold uppercase text-sm tracking-wider">
                        <span className="material-symbols-outlined">calendar_month</span>
                        <h4>Próximos Dias</h4>
                        <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">{next7Days.length}</span>
                    </div>
                    <div className="bg-white dark:bg-[#1f1a14] rounded-xl border border-purple-100 dark:border-purple-900/30 p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {next7Days.length === 0 ? (
                            <div className="col-span-full"><EmptyState message="Agenda livre nos próximos dias" /></div>
                        ) : (
                            next7Days.map(ev => (
                                <EventCard key={ev.id} event={ev} formatDate={formatDate} color="purple" onClick={() => onEventClick(ev)} />
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};



// ... (rest of the file)

const EventCard = ({ event, formatDate, color, onClick }: any) => (
    <div onClick={onClick} className={`bg-${color}-50 dark:bg-${color}-900/10 p-4 rounded-lg flex items-start gap-4 cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-${color}-200`}>
        <div className={`mt-1 w-2 h-2 rounded-full bg-${color}-500 shrink-0`} />
        <div className="flex-1 min-w-0">
            <h5 className="font-bold text-gray-900 dark:text-gray-100 truncate">{event.title}</h5>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{event.subtitle || event.description}</p>
            <div className="flex items-center gap-4 mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-black/20 text-${color}-600`}>
                    {formatDate(event.time_start)}
                </span>
                {event.type && <span className="text-[10px] text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded">{event.type}</span>}
            </div>
        </div>
    </div>
);

const EmptyState = ({ message }: { message: string }) => (
    <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 py-8 gap-2">
        <span className="material-symbols-outlined text-3xl opacity-20">event_busy</span>
        <span className="text-sm font-medium opacity-50">{message}</span>
    </div>
);

export default AgendaDashboard;
