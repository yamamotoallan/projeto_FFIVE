import React, { useState, useEffect } from 'react';
import { api } from '../src/services/api';

const SettingsMail: React.FC = () => {
    const [config, setConfig] = useState({
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_pass: '',
        smtp_secure: 'TLS',
        from_name: 'FIVE Ambientes Planejados',
        from_email: ''
    });
    const [loading, setLoading] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await api.settings.getMail();
                if (data) setConfig(data);
            } catch (error) {
                console.error('Erro ao buscar settings:', error);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setStatus(null);
        try {
            await api.settings.saveMail(config);
            setStatus({ type: 'success', msg: 'Configurações salvas com sucesso!' });
        } catch (error) {
            setStatus({ type: 'error', msg: 'Erro de conexão com o servidor.' });
        } finally {
            setLoading(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) return;
        setLoading(true);
        try {
            await api.settings.testEmail(testEmail);
            alert('Email de teste enviado com sucesso!');
        } catch (error) {
            alert('Erro ao tentar enviar email de teste.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-black">Configurações de E-mail</h1>
                <p className="text-text-muted">Configure o servidor SMTP para envio de propostas e convites.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm space-y-4">
                    <h2 className="font-bold text-lg mb-4">Servidor SMTP</h2>

                    <div>
                        <label className="block text-sm font-bold mb-1">Host SMTP</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border-gray-300 dark:border-neutral-700 bg-background-light dark:bg-neutral-800"
                            placeholder="smtp.exemplo.com"
                            value={config.smtp_host}
                            onChange={e => setConfig({ ...config, smtp_host: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Porta</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border-gray-300 dark:border-neutral-700 bg-background-light dark:bg-neutral-800"
                                placeholder="587"
                                value={config.smtp_port}
                                onChange={e => setConfig({ ...config, smtp_port: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Segurança</label>
                            <select
                                className="w-full rounded-lg border-gray-300 dark:border-neutral-700 bg-background-light dark:bg-neutral-800"
                                value={config.smtp_secure}
                                onChange={e => setConfig({ ...config, smtp_secure: e.target.value })}
                            >
                                <option value="TLS">STARTTLS (Recomendado)</option>
                                <option value="SSL">SSL/TLS</option>
                                <option value="NONE">Nenhuma</option>
                            </select>
                        </div>
                    </div>

                    <h2 className="font-bold text-lg mt-8 mb-4">Autenticação</h2>

                    <div>
                        <label className="block text-sm font-bold mb-1">Usuário / Email</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border-gray-300 dark:border-neutral-700 bg-background-light dark:bg-neutral-800"
                            placeholder="email@empresa.com"
                            value={config.smtp_user}
                            onChange={e => setConfig({ ...config, smtp_user: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Senha</label>
                        <input
                            type="password"
                            className="w-full rounded-lg border-gray-300 dark:border-neutral-700 bg-background-light dark:bg-neutral-800"
                            placeholder="********"
                            value={config.smtp_pass}
                            onChange={e => setConfig({ ...config, smtp_pass: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm space-y-4">
                        <h2 className="font-bold text-lg mb-4">Remetente Padrão</h2>
                        <div>
                            <label className="block text-sm font-bold mb-1">Nome Exibido</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border-gray-300 dark:border-neutral-700 bg-background-light dark:bg-neutral-800"
                                value={config.from_name}
                                onChange={e => setConfig({ ...config, from_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Email de Resposta</label>
                            <input
                                type="email"
                                className="w-full rounded-lg border-gray-300 dark:border-neutral-700 bg-background-light dark:bg-neutral-800"
                                placeholder="contato@empresa.com"
                                value={config.from_email}
                                onChange={e => setConfig({ ...config, from_email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 space-y-4">
                        <h2 className="font-bold text-lg text-primary">Testar Configuração</h2>
                        <input
                            type="email"
                            className="w-full rounded-lg border-primary/30 bg-white dark:bg-neutral-900"
                            placeholder="Email para teste..."
                            value={testEmail}
                            onChange={e => setTestEmail(e.target.value)}
                        />
                        <button
                            onClick={handleTestEmail}
                            disabled={loading || !testEmail}
                            className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : 'Enviar Email de Teste'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
                {status && (
                    <p className={`text-sm font-bold ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {status.msg}
                    </p>
                )}
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="ml-auto bg-text-main dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                </button>
            </div>
        </div>
    );
};

export default SettingsMail;
