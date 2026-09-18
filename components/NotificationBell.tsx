import React, { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { api } from '../src/services/api';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    link: string;
    read: boolean;
    created_at: string;
}

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    // Buscar notificações
    const fetchNotifications = async () => {
        try {
            const data = await api.notifications.list();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
        }
    };

    // Conectar ao SSE para atualizações em tempo real
    useEffect(() => {
        fetchNotifications();

        // Conectar ao stream SSE
        // Note: EventSource does not support headers. Be careful with auth.
        // If backend requires auth, consider passing token in query param.
        const streamUrl = `${api.notifications.getStreamUrl()}?userId=1`;
        const eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.unreadCount !== undefined) {
                    setUnreadCount(data.unreadCount);
                    // Re-fetch notificações se houver novas
                    if (data.unreadCount > unreadCount) {
                        fetchNotifications();
                    }
                }
            } catch (error) {
                console.error('Erro ao processar SSE:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    // Marcar como lida
    const markAsRead = async (id: number) => {
        try {
            await api.notifications.markRead(id);

            // Atualizar localmente
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
        }
    };

    // Marcar todas como lidas
    const markAllAsRead = async () => {
        setLoading(true);
        try {
            await api.notifications.markAllRead();

            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Erro ao marcar todas:', error);
        } finally {
            setLoading(false);
        }
    };

    // Deletar notificação
    const deleteNotification = async (id: number) => {
        try {
            await api.notifications.delete(id);

            setNotifications(notifications.filter(n => n.id !== id));
            const wasUnread = notifications.find(n => n.id === id)?.read === false;
            if (wasUnread) {
                setUnreadCount(Math.max(0, unreadCount - 1));
            }
        } catch (error) {
            console.error('Erro ao deletar:', error);
        }
    };

    // Ícone baseado no tipo
    const getIcon = (type: string) => {
        switch (type) {
            case 'new_lead': return '👤';
            case 'quote_approved': return '✅';
            case 'event_soon': return '⏰';
            case 'project_update': return '📋';
            case 'welcome': return '🎉';
            case 'system': return '⚙️';
            default: return '📢';
        }
    };

    // Formatar tempo relativo
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Agora';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="relative">
            {/* Botão Bell */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-text-main dark:text-white hover:bg-primary/10 rounded-full transition-colors"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-800 z-50 max-h-[500px] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                        <h3 className="font-bold text-lg">Notificações</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                    className="text-xs text-primary hover:underline disabled:opacity-50"
                                >
                                    Marcar todas como lidas
                                </button>
                            )}
                            <button
                                onClick={() => setShowDropdown(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell size={48} className="mx-auto mb-2 opacity-30" />
                                <p>Nenhuma notificação</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors ${!notif.read ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{getIcon(notif.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-bold text-sm">{notif.title}</h4>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {formatTime(notif.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {notif.link && (
                                                    <a
                                                        href={notif.link}
                                                        onClick={() => setShowDropdown(false)}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        Ver detalhes →
                                                    </a>
                                                )}
                                                {!notif.read && (
                                                    <button
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="text-xs text-gray-500 hover:text-primary flex items-center gap-1"
                                                    >
                                                        <Check size={12} /> Marcar como lida
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notif.id)}
                                                    className="text-xs text-gray-500 hover:text-red-500 ml-auto"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
