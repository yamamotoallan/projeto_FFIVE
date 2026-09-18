import React, { useState } from 'react';
import { useToast } from '../src/contexts/ToastContext';
import API_URL from '../src/config/api';

interface EventDetailsModalProps {
    event: any;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    onReschedule?: (newDate: string, newTime: string) => void;
    onComplete?: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, isOpen, onClose, title, onReschedule, onComplete }) => {
    const { success, error: showError } = useToast();
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    if (!isOpen) return null;

    const handleStartRoute = () => {
        // Mock address using event details or generic if missing
        const address = event.subtitle || "Centro";
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    };

    const confirmReschedule = async () => {
        if (!newDate || !newTime) {
            showError('Por favor, preencha data e hora');
            return;
        }

        const selectedDateTime = new Date(`${newDate}T${newTime}:00`);
        const now = new Date();

        if (selectedDateTime < now) {
            showError('Não é possível agendar para uma data/hora no passado');
            return;
        }

        if (onReschedule) {
            try {
                setIsSubmitting(true);
                await onReschedule(newDate, newTime);
                setIsRescheduling(false);
            } catch (error: any) {
                showError(error.message || 'Erro ao reagendar');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleCompleteClick = async () => {
        if (onComplete) {
            try {
                // Ensure we don't double submit or close before done ideally, but parent handles refresh
                await onComplete();
                onClose();
            } catch (e) {
                console.error(e);
            }
        }
    };

    // If "event" is an array, it's a Day View mode
    if (Array.isArray(event)) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
                <div className="bg-surface-light dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 flex flex-col max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-5 border-b border-[#e7dbcf] dark:border-neutral-800">
                        <h2 className="text-lg font-black">{title || 'Compromissos do Dia'}</h2>
                        <button onClick={onClose}><span className="material-symbols-outlined">close</span></button>
                    </div>
                    <div className="p-5 overflow-y-auto">
                        {event.length === 0 ? (
                            <p className="text-center text-text-muted py-8">Nenhum compromisso agendado para este dia.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {event.map((evt: any, idx: number) => (
                                    <div key={idx} className="p-3 rounded-xl bg-background-light dark:bg-neutral-800/50 border border-[#e7dbcf] dark:border-neutral-800 flex gap-3">
                                        <div className="w-1 rounded-full bg-primary h-full"></div>
                                        <div>
                                            <p className="font-bold text-sm">{evt.time}</p>
                                            <p className="font-medium text-sm">{evt.title}</p>
                                            <p className="text-xs text-text-muted">{evt.desc || 'Sem descrição'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={onClose} className="w-full mt-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover">Adicionar Novo</button>
                    </div>
                </div>
            </div>
        );
    }

    // Single Event View
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-surface-light dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-24 bg-primary/10">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full bg-white/50 hover:bg-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="absolute -bottom-8 left-6 w-16 h-16 bg-surface-light dark:bg-surface-dark rounded-2xl border border-[#e7dbcf] dark:border-neutral-800 flex items-center justify-center text-primary shadow-sm">
                        <span className="material-symbols-outlined text-3xl">event</span>
                    </div>
                </div>

                <div className="pt-10 px-6 pb-6">
                    {!isRescheduling ? (
                        <>
                            <div className="mb-6">
                                {event.confirmed ? (
                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-xs font-bold uppercase mb-2">
                                        Realizado
                                    </span>
                                ) : (
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-xs font-bold uppercase mb-2">
                                        Pendente
                                    </span>
                                )}
                                <h2 className="text-2xl font-black leading-tight">{event.title}</h2>
                                <p className="text-text-muted font-medium">{event.subtitle}</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-text-muted">schedule</span>
                                    <div>
                                        <p className="text-sm font-bold">Horário</p>
                                        <p className="text-xs text-text-muted">{event.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-text-muted">location_on</span>
                                    <div>
                                        <p className="text-sm font-bold">Localização</p>
                                        <p className="text-xs text-text-muted">{event.subtitle || 'Endereço não informado'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-text-muted">notes</span>
                                    <div>
                                        <p className="text-sm font-bold">Observações</p>
                                        <p className="text-xs text-text-muted">{event.desc || 'Sem observações'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <button
                                    onClick={() => setIsRescheduling(true)}
                                    className="py-2.5 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 font-bold text-sm hover:bg-gray-50 dark:hover:bg-neutral-800"
                                >
                                    Reagendar
                                </button>
                                <button
                                    onClick={async () => {
                                        const email = prompt('Digite o e-mail do destinatário:');
                                        if (email) {
                                            try {
                                                const res = await fetch(`${API_URL}/api/events/${event.id}/send-invite`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ recipients: [email] })
                                                });
                                                const data = await res.json();
                                                if (data.success) {
                                                    const blob = new Blob([data.icsContent], { type: 'text/calendar' });
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = data.filename;
                                                    a.click();
                                                    alert('✅ Convite gerado! Arquivo .ics baixado.');
                                                }
                                            } catch (error) {
                                                alert('❌ Erro ao enviar convite');
                                            }
                                        }
                                    }}
                                    className="py-2.5 rounded-lg bg-surface-light dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-700 font-bold text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">mail</span> Enviar Convite
                                </button>
                            </div>

                            {!event.confirmed && onComplete && (
                                <button
                                    onClick={handleCompleteClick}
                                    className="w-full mb-3 py-2.5 rounded-lg bg-green-600 text-white font-bold text-sm shadow-md hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Marcar como Realizado
                                </button>
                            )}

                            <button
                                onClick={handleStartRoute}
                                className="w-full py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-hover flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">near_me</span> Iniciar Rota
                            </button>
                        </>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-2 mb-4 text-text-muted cursor-pointer" onClick={() => setIsRescheduling(false)}>
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                <span className="text-xs font-bold uppercase">Voltar</span>
                            </div>
                            <h2 className="text-xl font-black mb-4">Reagendar Compromisso</h2>
                            <div className="flex flex-col gap-4 mb-6">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase text-text-muted">Nova Data</label>
                                    <input type="date" className="p-3 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-background-light dark:bg-background-dark text-sm" onChange={(e) => setNewDate(e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase text-text-muted">Novo Horário</label>
                                    <input type="time" className="p-3 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-background-light dark:bg-background-dark text-sm" onChange={(e) => setNewTime(e.target.value)} />
                                </div>
                            </div>
                            <button
                                onClick={confirmReschedule}
                                disabled={!newDate || !newTime || isSubmitting}
                                className="w-full py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Reagendando...
                                    </>
                                ) : (
                                    'Confirmar Alteração'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal;
