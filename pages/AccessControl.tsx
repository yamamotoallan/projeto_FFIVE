import React, { useState, useEffect } from 'react';
import { Profile, Permission, User } from '../types';
import { api } from '../src/services/api';
import { useToast } from '../src/contexts/ToastContext';

const AccessControl: React.FC = () => {
    const { success, error } = useToast();
    const [selectedProfile, setSelectedProfile] = useState<string>('admin');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial State moved inside component to be editable
    const [profiles, setProfiles] = useState<Profile[]>([
        {
            id: 'admin',
            name: 'admin',
            displayName: 'Administrador',
            permissions: [
                { id: '1', name: 'Dashboard', module: 'dashboard', actions: ['view', 'create', 'edit', 'delete'] },
                { id: '2', name: 'Leads', module: 'leads', actions: ['view', 'create', 'edit', 'delete'] },
                { id: '3', name: 'Orçamentos', module: 'quotes', actions: ['view', 'create', 'edit', 'delete'] },
                { id: '4', name: 'Agenda', module: 'agenda', actions: ['view', 'create', 'edit', 'delete'] },
                { id: '5', name: 'Scripts', module: 'scripts', actions: ['view', 'create', 'edit', 'delete'] },
                { id: '6', name: 'Configuração IA', module: 'ai-settings', actions: ['view', 'create', 'edit', 'delete'] },
                { id: '7', name: 'Usuários', module: 'users', actions: ['view', 'create', 'edit', 'delete'] },
                { id: '8', name: 'Controle de Acesso', module: 'access-control', actions: ['view', 'create', 'edit', 'delete'] },
            ],
        },
        // ... (other profiles kept same in memory for visual representation)
        {
            id: 'diretoria',
            name: 'diretoria',
            displayName: 'Diretoria',
            permissions: [
                { id: '1', name: 'Dashboard', module: 'dashboard', actions: ['view', 'create', 'edit', 'delete'] },
                { id: '2', name: 'Leads', module: 'leads', actions: ['view', 'create', 'edit', 'delete'] },
                { id: '3', name: 'Orçamentos', module: 'quotes', actions: ['view', 'create', 'edit', 'delete'] },
                { id: '4', name: 'Agenda', module: 'agenda', actions: ['view', 'create', 'edit', 'delete'] },
                { id: '5', name: 'Scripts', module: 'scripts', actions: ['view', 'create', 'edit', 'delete'] },
                { id: '6', name: 'Configuração IA', module: 'ai-settings', actions: ['view', 'edit'] },
                { id: '8', name: 'Controle de Acesso', module: 'access-control', actions: ['view', 'edit'] },
            ],
        },
        {
            id: 'user',
            name: 'user',
            displayName: 'Usuário',
            permissions: [
                { id: '1', name: 'Dashboard', module: 'dashboard', actions: ['view'] },
                { id: '2', name: 'Leads', module: 'leads', actions: ['view', 'create'] },
                { id: '3', name: 'Orçamentos', module: 'quotes', actions: ['view', 'create'] },
                { id: '4', name: 'Agenda', module: 'agenda', actions: ['view', 'create', 'edit'] },
                { id: '5', name: 'Scripts', module: 'scripts', actions: ['view'] },
            ],
        },
    ]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.users.list();
            setUsers(data);
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId: number, newRole: string) => {
        try {
            await api.users.updateRole(userId, newRole);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
            success('Perfil atualizado com sucesso');
        } catch (err) {
            console.error('Erro ao atualizar perfil:', err);
            error('Erro ao atualizar perfil');
        }
    };

    const handlePermissionChange = (permId: string, action: string) => {
        setProfiles(prevProfiles => prevProfiles.map(profile => {
            if (profile.id !== selectedProfile) return profile;

            return {
                ...profile,
                permissions: profile.permissions.map(perm => {
                    if (perm.id !== permId) return perm;

                    const hasAction = perm.actions.includes(action as any);
                    let newActions = hasAction
                        ? perm.actions.filter(a => a !== action)
                        : [...perm.actions, action as any];

                    return { ...perm, actions: newActions };
                })
            };
        }));
    };

    const profile = profiles.find((p) => p.id === selectedProfile);

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'view': return 'Visualizar';
            case 'create': return 'Criar';
            case 'edit': return 'Editar';
            case 'delete': return 'Excluir';
            default: return action;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
            case 'diretoria':
                return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
            case 'user':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-600';
        }
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in w-full p-4 md:p-6 overflow-y-auto">
            {/* Header */}
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Controle de Acesso</h1>
                <p className="text-text-muted dark:text-text-dark-muted text-sm">
                    Gerencie perfis de acesso e permissões de usuários
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Selection */}
                <div className="lg:col-span-1">
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary dark:text-gold">shield</span>
                            Perfis de Acesso
                        </h3>
                        <div className="space-y-2">
                            {profiles.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProfile(p.id)}
                                    className={`w-full text-left p-4 rounded-lg border transition-all ${selectedProfile === p.id
                                        ? 'border-primary dark:border-gold bg-primary/5 dark:bg-gold/5'
                                        : 'border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-neutral-900'
                                        }`}
                                >
                                    <p className="font-bold text-sm">{p.displayName}</p>
                                    <p className="text-xs text-text-muted dark:text-text-dark-muted mt-1">
                                        {p.permissions.length} módulos configurados
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Permissions Table */}
                <div className="lg:col-span-2">
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border-light dark:border-border-dark">
                            <h3 className="font-bold text-lg">
                                Permissões - {profile?.displayName}
                            </h3>
                            <p className="text-sm text-text-muted dark:text-text-dark-muted mt-1">
                                Configure quais módulos e ações cada perfil pode acessar
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-background-light dark:bg-background-dark">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase">
                                            Módulo
                                        </th>
                                        <th className="text-center px-4 py-4 text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase">
                                            Visualizar
                                        </th>
                                        <th className="text-center px-4 py-4 text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase">
                                            Criar
                                        </th>
                                        <th className="text-center px-4 py-4 text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase">
                                            Editar
                                        </th>
                                        <th className="text-center px-4 py-4 text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase">
                                            Excluir
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                    {profiles.find(p => p.id === selectedProfile)?.permissions.map((permission) => (
                                        <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
                                            <td className="px-6 py-4 font-medium min-w-[140px]">{permission.name}</td>
                                            {['view', 'create', 'edit', 'delete'].map(action => (
                                                <td key={action} className="px-4 py-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        readOnly // Make read-only for now as per plan
                                                        checked={permission.actions.includes(action as any)}
                                                        className={`w-4 h-4 rounded border-gray-300 text-primary dark:text-gold focus:ring-primary dark:focus:ring-gold focus:ring-offset-0 cursor-default opacity-60`}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark">
                            <p className="text-xs text-text-muted dark:text-text-dark-muted italic">
                                * As permissões individuais são gerenciadas através dos perfis de acesso acima.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users with Roles */}
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border-light dark:border-border-dark">
                    <h3 className="font-bold text-lg">Usuários e Perfis</h3>
                    <p className="text-sm text-text-muted dark:text-text-dark-muted mt-1">
                        Atribua perfis de acesso aos usuários do sistema
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-background-light dark:bg-background-dark">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase">
                                    Usuário
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase">
                                    E-mail
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase">
                                    Perfil de Acesso
                                </th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-text-muted dark:text-text-dark-muted uppercase">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
                                    <td className="px-6 py-4 font-medium">{user.name}</td>
                                    <td className="px-6 py-4 text-text-muted dark:text-text-dark-muted">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                                            {profiles.find(p => p.id === user.role)?.displayName || user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                            className="text-sm border border-border-light dark:border-border-dark rounded-md bg-transparent px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-gold"
                                        >
                                            <option value="user">Usuário</option>
                                            <option value="diretoria">Diretoria</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-text-muted dark:text-text-dark-muted">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AccessControl;
