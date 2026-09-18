import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../src/services/api';
import { useToast } from '../src/contexts/ToastContext';
import { LoadingButton } from '../src/components/Loading';

interface LoginProps {
    onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulando delay de rede para UX
            await new Promise(resolve => setTimeout(resolve, 600));

            const data = await api.auth.login(email, password);

            if (data.success) {
                localStorage.setItem('token', data.token);
                onLogin(data.user);
                success('✅ Login realizado com sucesso!');
                navigate('/');
            } else {
                showError(data.message || 'Email ou senha incorretos');
            }
        } catch (err) {
            showError('Erro de conexão com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        showError('Funcionalidade em desenvolvimento');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl"></div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark w-full max-w-md p-8 rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-white text-3xl">carpenter</span>
                    </div>
                    <h1 className="text-2xl font-black text-text-main dark:text-gray-100">Marcenaria Pro</h1>
                    <p className="text-text-muted text-sm mt-1">Gestão inteligente para sua oficina</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-muted uppercase">E-mail</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">mail</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                                placeholder="admin@marcenaria.pro"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-muted uppercase">Senha</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">lock</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 bg-background-light dark:bg-background-dark border border-[#e7dbcf] dark:border-neutral-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                                placeholder="123"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" onClick={handleForgotPassword} className="text-xs font-bold text-primary hover:underline">
                            Esqueci minha senha
                        </button>
                    </div>

                    <LoadingButton
                        type="submit"
                        loading={loading}
                        className="w-full py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        Acessar Sistema
                    </LoadingButton>
                </form>

                <div className="mt-8 pt-6 border-t border-[#e7dbcf] dark:border-neutral-800 text-center">
                    <p className="text-xs text-text-muted">
                        Teste: <span className="font-bold">admin@marcenaria.pro</span> | Senha: <span className="font-bold">123</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;