import React, { useState, useEffect } from 'react';
import { api } from '../src/services/api';

const WhatsappSettings: React.FC = () => {
    const [config, setConfig] = useState({
        phoneNumberId: '',
        accountId: '',
        accessToken: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');
    const [testPhone, setTestPhone] = useState('');
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Mock fetch config on load
    useEffect(() => {
        // In a real scenario, fetch existing config
        // const loadConfig = async () => { ... }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        setNotification(null);

        try {
            await api.whatsapp.saveConfig(config);
            setStatus('connected');
            setNotification({ type: 'success', message: 'Configurações salvas e conexão verificada com sucesso!' });
        } catch (error) {
            setNotification({ type: 'error', message: 'Erro ao salvar configurações. Verifique suas credenciais.' });
            setStatus('disconnected');
        } finally {
            setLoading(false);
        }
    };

    const handleTestSend = async () => {
        if (!testPhone) return;
        setLoading(true);
        setNotification(null);

        try {
            await api.whatsapp.sendTest(testPhone);
            setNotification({ type: 'success', message: `Mensagem de teste enviada para ${testPhone}!` });
        } catch (error) {
            setNotification({ type: 'error', message: 'Falha ao enviar mensagem de teste.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-[#e7dbcf] dark:border-neutral-800">
                    <div>
                        <h1 className="text-3xl font-bold text-text-main dark:text-gray-100 flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500 text-4xl">chat</span>
                            Integração Whatsapp
                        </h1>
                        <p className="text-text-muted mt-2">Configure a API Oficial do WhatsApp Business (Meta) para enviar alertas automáticos.</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${status === 'connected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {status === 'connected' ? 'Serviço Ativo' : 'Não Conectado'}
                    </div>
                </div>

                {notification && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                        <span className="material-symbols-outlined">{notification.type === 'success' ? 'check_circle' : 'error'}</span>
                        <span className="font-medium text-sm">{notification.message}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Settings Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-[#e7dbcf] dark:border-neutral-800">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">settings_suggest</span>
                                Credenciais da API
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Phone Number ID</label>
                                    <input
                                        type="text"
                                        name="phoneNumberId"
                                        value={config.phoneNumberId}
                                        onChange={handleChange}
                                        placeholder="Ex: 10593..."
                                        className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono"
                                    />
                                    <p className="text-[10px] text-text-muted mt-1.5">Encontrado no painel do Facebook Developers - Whatsapp - Getting Started.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Business Account ID</label>
                                    <input
                                        type="text"
                                        name="accountId"
                                        value={config.accountId}
                                        onChange={handleChange}
                                        placeholder="Ex: 10945..."
                                        className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Access Token (Permanente)</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            name="accessToken"
                                            value={config.accessToken}
                                            onChange={handleChange}
                                            placeholder="EAAG..."
                                            className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-800 rounded-lg p-3 pr-10 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono"
                                        />
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted cursor-pointer hover:text-primary">visibility_off</span>
                                    </div>
                                    <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[10px] text-yellow-500">warning</span>
                                        Recomendado usar System User Token para produção.
                                    </p>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <span className="material-symbols-outlined text-[18px]">save</span>}
                                        Salvar e Conectar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test & Status Panel */}
                    <div className="space-y-6">
                        {/* Test Message */}
                        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-[#e7dbcf] dark:border-neutral-800">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">send</span>
                                Teste de Envio
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Número de Destino</label>
                                    <input
                                        type="tel"
                                        value={testPhone}
                                        onChange={(e) => setTestPhone(e.target.value)}
                                        placeholder="5511999999999"
                                        className="w-full bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-text-muted mt-1">Formato: DDI + DDD + Número (apenas números).</p>
                                </div>
                                <button
                                    onClick={handleTestSend}
                                    disabled={loading || !testPhone || status !== 'connected'}
                                    className="w-full bg-white dark:bg-neutral-800 border border-border-light dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-text-main dark:text-gray-200 px-4 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">send_to_mobile</span>
                                    Disparar Teste
                                </button>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/5 p-6 rounded-2xl border border-green-100 dark:border-green-900/30">
                            <h3 className="text-sm font-bold text-green-800 dark:text-green-400 mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined">info</span>
                                Limites da API
                            </h3>
                            <ul className="text-xs text-green-700 dark:text-green-500 space-y-2 list-disc pl-4">
                                <li><strong>Tier Gratuito:</strong> 1000 conversas/mês iniciado pelo negócio.</li>
                                <li><strong>Janela de 24h:</strong> Mensagens livres se o cliente iniciar.</li>
                                <li><strong>Templates:</strong> Devem ser aprovados pela Meta antes do uso.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsappSettings;
