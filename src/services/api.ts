import API_URL_CONFIG from '../config/api';

const API_URL = API_URL_CONFIG;

// Função auxiliar para obter headers com autenticação (JSON)
const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

// Função auxiliar para obter headers de autenticação sem Content-Type (para multipart/form-data)
const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Tipos auxiliares
interface ApiError {
    success: false;
    message: string;
}

export const api = {
    // Audit Logs
    auditLogs: {
        list: async (filters: any) => {
            const query = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_URL}/api/audit-logs?${query}`, {
                headers: getHeaders()
            });
            return response.json();
        }
    },
    // Autenticação
    auth: {
        login: async (email: string, password: string) => {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return response.json();
        }
    },

    // Usuários (Admin)
    users: {
        list: async () => {
            const response = await fetch(`${API_URL}/api/users`, {
                headers: getHeaders()
            });
            return response.json();
        },
        create: async (userData: any) => {
            const response = await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(userData)
            });
            return response.json();
        },
        delete: async (id: number) => {
            const response = await fetch(`${API_URL}/api/users/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return response.json();
        },
        updateRole: async (id: number, role: string) => {
            const response = await fetch(`${API_URL}/api/users/${id}/role`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ role })
            });
            return response.json();
        }
    },

    // Leads
    leads: {
        list: async () => {
            const response = await fetch(`${API_URL}/api/leads`, {
                headers: getHeaders()
            });
            return response.json();
        },
        get: async (id: string | number) => {
            try {
                const response = await fetch(`${API_URL}/api/leads/${id}`, {
                    headers: getHeaders()
                });
                if (!response.ok) return null;
                return response.json();
            } catch (e) {
                console.error("Error fetching lead details:", e);
                return null;
            }
        },
        create: async (leadData: any) => {
            const response = await fetch(`${API_URL}/api/leads`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(leadData)
            });
            return response.json();
        },
        updateStatus: async (id: number | string, status: string) => {
            const response = await fetch(`${API_URL}/api/leads/${id}/status`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ status })
            });
            return response.json();
        }
    },

    // Events/Agenda
    events: {
        list: async (start?: string, end?: string) => {
            const params = new URLSearchParams();
            if (start) params.append('start', start);
            if (end) params.append('end', end);
            const query = params.toString() ? `?${params.toString()}` : '';

            const response = await fetch(`${API_URL}/api/events${query}`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao buscar eventos');
            }

            const data = await response.json();
            return data;
        },
        create: async (eventData: any) => {
            const response = await fetch(`${API_URL}/api/events`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao criar evento');
            }

            const data = await response.json();
            return data.data || data; // Retornar data.data se existir, senão data
        },
        update: async (id: number, eventData: any) => {
            const response = await fetch(`${API_URL}/api/events/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao atualizar evento');
            }

            const data = await response.json();
            return data.data || data;
        },
        delete: async (id: number) => {
            const response = await fetch(`${API_URL}/api/events/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao deletar evento');
            }

            return response.json();
        },
        sendInvite: async (id: number, recipients: string[]) => {
            const response = await fetch(`${API_URL}/api/events/${id}/send-invite`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ recipients })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao enviar convite');
            }

            return response.json();
        }
    },

    // Quotes/Orçamentos
    quotes: {
        list: async () => {
            const response = await fetch(`${API_URL}/api/quotes`, {
                headers: getHeaders()
            });
            return response.json();
        },
        get: async (id: string | number) => {
            try {
                const response = await fetch(`${API_URL}/api/quotes/${id}`, {
                    headers: getHeaders()
                });
                if (!response.ok) return null;
                return response.json();
            } catch (e) {
                console.error("Error fetching quote details:", e);
                return null;
            }
        },
        create: async (quoteData: any) => {
            const response = await fetch(`${API_URL}/api/quotes`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(quoteData)
            });
            return response.json();
        },
        updateStatus: async (id: number, status: string, paymentInfo?: any) => {
            const response = await fetch(`${API_URL}/api/quotes/${id}/status`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ status, paymentInfo })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao atualizar status');
            }
            return response.json();
        },
        uploadFiles: async (quoteId: number, files: File[]) => {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            const response = await fetch(`${API_URL}/api/quotes/${quoteId}/files`, {
                method: 'POST',
                headers: getAuthHeaders(), // Only Authorization, let browser set Content-Type for multipart
                body: formData
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Upload failed' }));
                throw new Error(error.message || 'Upload failed');
            }
            return response.json();
        },
        listFiles: async (quoteId: number) => {
            const response = await fetch(`${API_URL}/api/quotes/${quoteId}/files`, {
                headers: getHeaders()
            });
            return response.json();
        },
        downloadFile: async (quoteId: number, fileId: number) => {
            const response = await fetch(`${API_URL}/api/quotes/${quoteId}/files/${fileId}/download`, {
                headers: getHeaders()
            });
            return response.json();
        },
        deleteFile: async (quoteId: number, fileId: number) => {
            const response = await fetch(`${API_URL}/api/quotes/${quoteId}/files/${fileId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return response.json();
        }
    },

    // Projects/Projetos
    projects: {
        list: async () => {
            const response = await fetch(`${API_URL}/api/projects`, {
                headers: getHeaders()
            });
            return response.json();
        },
        create: async (projectData: any) => {
            const response = await fetch(`${API_URL}/api/projects`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(projectData)
            });
            return response.json();
        },
        updateStatus: async (id: string, status: string, historyEvent?: any) => {
            // Save history optimistically (before API call) to ensure it's available for immediate UI reads
            if (historyEvent) {
                try {
                    const historyKey = `project_history_${id}`;
                    const currentHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
                    currentHistory.unshift(historyEvent); // Add new event to top
                    localStorage.setItem(historyKey, JSON.stringify(currentHistory));
                } catch (e) {
                    console.error("Error saving history:", e);
                }
            }

            try {
                const response = await fetch(`${API_URL}/api/projects/${id}/status`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify({ status })
                });

                return response.json();
            } catch (error) {
                console.error("Error updating status API:", error);

                // Fallback: History is already saved, just throw error to let UI know API failed
                throw error;
            }
        },
        getHistory: async (id: string) => {
            const historyKey = `project_history_${id}`;
            try {
                const local = localStorage.getItem(historyKey);
                if (!local) return [];
                const parsed = JSON.parse(local);
                return Array.isArray(parsed) ? parsed : [];
            } catch { return []; }
        },
        getChecklist: async (id: string) => {
            const key = `checklist_${id}`;
            try {
                const response = await fetch(`${API_URL}/api/projects/${id}/checklist`, {
                    headers: getHeaders()
                });

                if (!response.ok) {
                    try {
                        const local = localStorage.getItem(key);
                        return local ? JSON.parse(local) : [];
                    } catch (e) {
                        return [];
                    }
                }

                const data = await response.json();
                // Fix: If server returns empty array (default behavior), try loading from local storage
                // This handles cases where backend doesn't support persistence but returns 200 OK []
                if (Array.isArray(data) && data.length === 0) {
                    const local = localStorage.getItem(key);
                    if (local) {
                        console.log(`[API] Server returned empty, using localStorage for ${key}`);
                        return JSON.parse(local);
                    }
                }
                return data;
            } catch (error) {
                // Fallback on network error
                const local = localStorage.getItem(key);
                return local ? JSON.parse(local) : [];
            }
        },
        updateChecklist: async (id: string, checklistData: any) => {
            const key = `checklist_${id}`;
            try {
                const response = await fetch(`${API_URL}/api/projects/${id}/checklist`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(checklistData)
                });

                if (!response.ok) {
                    throw new Error('API failed');
                }
                return await response.json();
            } catch (error) {
                // Fallback to localStorage if API endpoint missing or error

                // Get existing items
                let currentItems: any[] = [];
                try {
                    currentItems = JSON.parse(localStorage.getItem(key) || '[]');
                } catch { currentItems = []; }

                // Determine if we need to update check or add new
                // Logic mimics typical backend: upsert based on label + stage
                const existingIndex = currentItems.findIndex(i => i.item_label === checklistData.item_label && i.stage === checklistData.stage);

                const newItem = {
                    ...checklistData,
                    project_id: id,
                    completed_at: new Date().toISOString(),
                    completed_by_user_name: 'Usuário Local' // Mock user
                };

                if (existingIndex >= 0) {
                    currentItems[existingIndex] = { ...currentItems[existingIndex], ...newItem };
                } else {
                    currentItems.push(newItem);
                }

                localStorage.setItem(key, JSON.stringify(currentItems));
                return newItem;
            }
        }
    },

    // Interactions (notes/comments)
    interactions: {
        list: async (entityType: string, entityId: number) => {
            const response = await fetch(`${API_URL}/api/interactions?entity_type=${entityType}&entity_id=${entityId}`, {
                headers: getHeaders()
            });
            return response.json();
        },
        create: async (interactionData: any) => {
            const response = await fetch(`${API_URL}/api/interactions`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(interactionData)
            });
            return response.json();
        }
    },

    // Analytics
    analytics: {
        getSummary: async () => {
            const response = await fetch(`${API_URL}/api/analytics/summary`, {
                headers: getHeaders()
            });
            return response.json();
        }
    },



    // Financial
    financial: {
        save: async (quoteId: number, data: any) => {
            const response = await fetch(`${API_URL}/api/quotes/${quoteId}/financial`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return response.json();
        }
    },

    // Notifications
    notifications: {
        list: async () => {
            const response = await fetch(`${API_URL}/api/notifications`, {
                headers: getHeaders()
            });
            return response.json();
        },
        markRead: async (id: number) => {
            const response = await fetch(`${API_URL}/api/notifications/${id}/mark-read`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ userId: 1 }) // TODO: Get real userId
            });
            return response.json();
        },
        markAllRead: async () => {
            const response = await fetch(`${API_URL}/api/notifications/mark-all-read`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ userId: 1 })
            });
            return response.json();
        },
        delete: async (id: number) => {
            const response = await fetch(`${API_URL}/api/notifications/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
                body: JSON.stringify({ userId: 1 })
            });
            return response.json();
        },
        getStreamUrl: () => `${API_URL}/api/notifications/stream`
    },

    // Settings
    settings: {
        getMail: async () => {
            const response = await fetch(`${API_URL}/api/settings/mail`, {
                headers: getHeaders()
            });
            return response.json();
        },
        saveMail: async (config: any) => {
            const response = await fetch(`${API_URL}/api/settings/mail`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(config)
            });
            return response.json();
        },
        testEmail: async (to: string) => {
            const response = await fetch(`${API_URL}/api/test-email`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ to })
            });
            return response.json();
        }
    },

    // Profile
    profile: {
        changePassword: async (oldPassword: string, newPassword: string) => {
            const response = await fetch(`${API_URL}/api/profile/change-password`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ oldPassword, newPassword })
            });
            return response.json();
        },
        toggle2FA: async () => {
            const response = await fetch(`${API_URL}/api/profile/2fa/toggle`, {
                method: 'POST',
                headers: getHeaders()
            });
            return response.json();
        }
    },

    // AI
    ai: {
        getSuggestion: async (prompt: string) => {
            const response = await fetch(`${API_URL}/api/ai/suggestion`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ prompt })
            });
            return response.json();
        },
        chat: async (message: string, context?: any) => {
            const response = await fetch(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ message, context })
            });
            return response.json();
        },
        getSettings: async () => {
            const response = await fetch(`${API_URL}/api/settings/ai`, {
                headers: getHeaders()
            });
            return response.json();
        },
        saveSettings: async (config: any) => {
            const response = await fetch(`${API_URL}/api/settings/ai`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(config)
            });
            return response.json();
        }
    },

    // Orçamentos e Arquivos (mantido para compatibilidade)
    files: {
        upload: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Falha no upload');
            return response.json();
        }
    },

    whatsapp: {
        saveConfig: async (config: { phoneNumberId: string; accountId: string; accessToken: string }) => {
            const response = await fetch(`${API_URL}/api/whatsapp/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // TODO: Add auth token
                },
                body: JSON.stringify(config),
            });
            return response.json();
        },
        getConfig: async () => {
            const response = await fetch(`${API_URL}/api/whatsapp/config`);
            return response.json();
        },
        sendTest: async (to: string) => {
            const response = await fetch(`${API_URL}/api/whatsapp/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ to, type: 'test' }),
            });
            return response.json();
        }
    },

    // Kanban Settings
    kanban: {
        stages: {
            list: async () => {
                const response = await fetch(`${API_URL}/api/kanban/stages`, { headers: getHeaders() });
                if (!response.ok) throw new Error('Erro ao buscar etapas');
                return response.json();
            },
            create: async (data: { name: string; order_position: number; color?: string; icon?: string }) => {
                const response = await fetch(`${API_URL}/api/kanban/stages`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Erro ao criar etapa');
                return response.json();
            },
            update: async (id: number, data: any) => {
                const response = await fetch(`${API_URL}/api/kanban/stages/${id}`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Erro ao atualizar etapa');
                return response.json();
            },
            delete: async (id: number) => {
                const response = await fetch(`${API_URL}/api/kanban/stages/${id}`, {
                    method: 'DELETE',
                    headers: getHeaders()
                });
                if (!response.ok) throw new Error('Erro ao excluir etapa');
                return response.json();
            }
        },
        checklist: {
            list: async (stageId: number) => {
                const response = await fetch(`${API_URL}/api/kanban/stages/${stageId}/checklist`, { headers: getHeaders() });
                if (!response.ok) throw new Error('Erro ao buscar checklist');
                return response.json();
            },
            create: async (data: { stage_id: number; item_label: string; order_position: number; is_required?: boolean }) => {
                const response = await fetch(`${API_URL}/api/kanban/checklist`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Erro ao criar item');
                return response.json();
            },
            update: async (id: number, data: any) => {
                const response = await fetch(`${API_URL}/api/kanban/checklist/${id}`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Erro ao atualizar item');
                return response.json();
            },
            delete: async (id: number) => {
                const response = await fetch(`${API_URL}/api/kanban/checklist/${id}`, {
                    method: 'DELETE',
                    headers: getHeaders()
                });
                if (!response.ok) throw new Error('Erro ao excluir item');
                return response.json();
            }
        }
    },

    // Generic Helper (used by Inventory)
    get: async (endpoint: string) => {
        const response = await fetch(`${API_URL}/api${endpoint}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },
    post: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_URL}/api${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    },
    put: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_URL}/api${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('API Error');
        return response.json();
    }
};