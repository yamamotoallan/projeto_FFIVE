import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../src/services/api';

interface ProfileProps {
    user: User;
    onUpdate: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
    });
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const getAvatarUrl = () => {
        // Verifica se o usuário tem foto customizada salva no localStorage
        const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
        if (savedAvatar) return savedAvatar;

        // Usa avatar padrão local
        return "/default-avatar.jpg";
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tamanho (2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Arquivo muito grande! Máximo 2MB.');
                return;
            }

            // Validar tipo
            if (!file.type.startsWith('image/')) {
                alert('Apenas imagens são permitidas!');
                return;
            }

            setSelectedFile(file);

            // Criar preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrador';
            case 'diretoria': return 'Diretoria';
            case 'user': return 'Usuário';
            default: return role;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedUser = { ...user, ...formData };
        onUpdate(updatedUser);
        localStorage.setItem('marcenaria_user', JSON.stringify(updatedUser));
        setIsEditing(false);
    };

    const handlePhotoUpload = () => {
        if (!selectedFile) {
            alert('Selecione uma foto primeiro!');
            return;
        }

        // Salvar preview no localStorage (em produção, enviaria para o servidor)
        if (previewUrl) {
            localStorage.setItem(`avatar_${user.id}`, previewUrl);
            setIsPhotoModalOpen(false);
            setSelectedFile(null);
            setPreviewUrl(null);
            alert('Foto atualizada com sucesso!');
            // Force re-render
            window.location.reload();
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Avatar & Stats */}
            <div className="lg:col-span-1 space-y-6">
                {/* Avatar Card */}
                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm relative">
                    {isPhotoModalOpen && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm p-4">
                            <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-xl border border-border-light dark:border-border-dark w-full max-w-sm animate-scale-in">
                                <h3 className="text-lg font-bold mb-4">Atualizar Foto</h3>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors mb-4"
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-full object-cover mb-2" />
                                            <p className="text-sm font-medium text-green-600 dark:text-green-400">✓ Foto selecionada</p>
                                            <p className="text-xs text-text-muted mt-1">Clique para alterar</p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-4xl text-primary dark:text-gold mb-2">cloud_upload</span>
                                            <p className="text-sm font-medium">Clique para selecionar</p>
                                            <p className="text-xs text-text-muted mt-1">JPG, PNG ou GIF (Max. 2MB)</p>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setIsPhotoModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handlePhotoUpload}
                                        className="px-4 py-2 bg-primary dark:bg-gold text-white text-sm font-bold rounded-lg hover:bg-primary-hover shadow-md"
                                    >
                                        Salvar Foto
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col items-center text-center">
                        <div
                            className="w-32 h-32 rounded-full border-4 border-primary dark:border-gold mb-4 relative group"
                            style={{
                                backgroundImage: `url("${getAvatarUrl()}")`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            <button
                                onClick={() => setIsPhotoModalOpen(true)}
                                className="absolute bottom-0 right-0 p-2 bg-primary dark:bg-gold text-white rounded-full shadow-md hover:scale-110 transition-transform"
                            >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                        </div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-text-muted dark:text-text-dark-muted text-sm mt-1">
                            {user.email}
                        </p>
                        <span className="inline-block mt-3 px-3 py-1 bg-primary/10 dark:bg-gold/10 text-primary dark:text-gold text-xs font-bold rounded-full">
                            {getRoleLabel(user.role)}
                        </span>

                        <button
                            onClick={() => setIsPhotoModalOpen(true)}
                            className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                            <span className="text-sm font-medium">Alterar Foto</span>
                        </button>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-sm mb-4">Estatísticas</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted dark:text-text-dark-muted">Leads Criados</span>
                            <span className="font-bold text-primary dark:text-gold">48</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted dark:text-text-dark-muted">Orçamentos</span>
                            <span className="font-bold text-primary dark:text-gold">23</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted dark:text-text-dark-muted">Projetos Fechados</span>
                            <span className="font-bold text-primary dark:text-gold">12</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Information Form */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Informações Pessoais</h3>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-gold text-white rounded-lg hover:bg-primary-hover dark:hover:bg-gold-light transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                <span className="text-sm font-medium">Editar</span>
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase mb-2">
                                    Nome Completo
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-primary dark:focus:border-gold outline-none transition-all"
                                        required
                                    />
                                ) : (
                                    <p className="px-4 py-2.5 text-sm">{user.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase mb-2">
                                    E-mail
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-gold focus:border-primary dark:focus:border-gold outline-none transition-all"
                                        required
                                    />
                                ) : (
                                    <p className="px-4 py-2.5 text-sm">{user.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase mb-2">
                                    Cargo/Função
                                </label>
                                <p className="px-4 py-2.5 text-sm">{getRoleLabel(user.role)}</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase mb-2">
                                    ID do Usuário
                                </label>
                                <p className="px-4 py-2.5 text-sm font-mono text-text-muted dark:text-text-dark-muted">
                                    #{user.id.toString().padStart(4, '0')}
                                </p>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-primary dark:bg-gold text-white rounded-lg hover:bg-primary-hover dark:hover:bg-gold-light transition-colors font-medium"
                                >
                                    Salvar Alterações
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({ name: user.name, email: user.email });
                                    }}
                                    className="px-6 py-2.5 bg-transparent border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Security Section */}
                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Segurança</h3>
                    <div className="space-y-4">
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="w-full flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-text-muted dark:text-gold">lock</span>
                                <div className="text-left">
                                    <p className="font-medium text-sm">Alterar Senha</p>
                                    <p className="text-xs text-text-muted dark:text-text-dark-muted">
                                        Última alteração recomendada há cada 3 meses
                                    </p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-text-muted dark:text-gold">chevron_right</span>
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    const nextState = !user.two_factor_enabled;
                                    await api.profile.toggle2FA();
                                    onUpdate({ ...user, two_factor_enabled: nextState });
                                    alert(`2FA ${nextState ? 'ativado' : 'desativado'} com sucesso!`);
                                } catch (error) {
                                    alert('Erro ao configurar 2FA');
                                }
                            }}
                            className="w-full flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-text-muted dark:text-gold">shield</span>
                                <div className="text-left">
                                    <p className="font-medium text-sm">Autenticação de Dois Fatores</p>
                                    <p className="text-xs text-text-muted dark:text-text-dark-muted">
                                        Status: <span className={user.two_factor_enabled ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>{user.two_factor_enabled ? 'Ativado' : 'Desativado'}</span>
                                    </p>
                                </div>
                            </div>
                            <div className={`w-10 h-6 rounded-full relative transition-colors ${user.two_factor_enabled ? 'bg-primary' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.two_factor_enabled ? 'left-5' : 'left-1'}`}></div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Password Modal */}
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                                <h2 className="text-xl font-bold">Alterar Senha</h2>
                                <button onClick={() => setIsPasswordModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Senha Atual</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-background-dark"
                                        value={passwordData.current}
                                        onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Nova Senha</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-background-dark"
                                        value={passwordData.new}
                                        onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase mb-2">Confirmar Nova Senha</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-background-dark"
                                        value={passwordData.confirm}
                                        onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t bg-gray-50 dark:bg-surface-dark flex gap-3">
                                <button
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="flex-1 py-2 text-sm font-bold border rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    disabled={loading || !passwordData.current || passwordData.new !== passwordData.confirm || passwordData.new.length < 6}
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            await api.profile.changePassword(passwordData.current, passwordData.new);
                                            alert('Senha alterada com sucesso!');
                                            setIsPasswordModalOpen(false);
                                            setPasswordData({ current: '', new: '', confirm: '' });
                                        } catch (error: any) {
                                            alert(error.message || 'Falha na comunicação com o servidor');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="flex-1 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-lg hover:bg-primary-hover disabled:opacity-50"
                                >
                                    {loading ? 'Processando...' : 'Atualizar Senha'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
