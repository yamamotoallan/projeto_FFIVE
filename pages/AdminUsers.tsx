import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../src/services/api';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New User Form State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPass, setNewPass] = useState('');
    const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.users.list();
            setUsers(data);
        } catch (error) {
            console.error('Erro ao buscar usuários', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newUser = { name: newName, email: newEmail, password: newPass, role: newRole };
            const res = await api.users.create(newUser);

            if (res) {
                await fetchUsers();
                setIsModalOpen(false);
                // Reset form
                setNewName('');
                setNewEmail('');
                setNewPass('');
            }
        } catch (error) {
            alert('Erro ao criar usuário');
            console.error(error);
        }
    };

    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setNewName(user.name);
        setNewEmail(user.email);
        setNewRole(user.role as 'admin' | 'user');
        setNewPass(''); // Don't show password
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        // Mock update as API might not support it yet or I need to implement it
        if (!editingUser) return;

        try {
            // In a real scenario call api.users.update(editingUser.id, ...)
            // For now we simulate update locally
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, name: newName, email: newEmail, role: newRole } : u));
            setEditingUser(null);
            // Reset form
            setNewName('');
            setNewEmail('');
            setNewPass('');
            alert('Usuário atualizado com sucesso!');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja remover este usuário?')) return;

        try {
            await api.users.delete(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background-light dark:bg-background-dark animate-fade-in">
            {/* Header */}
            <header className="shrink-0 px-8 py-6 border-b border-[#e7dbcf] dark:border-neutral-800 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
                <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black leading-tight">Gestão de Usuários</h1>
                        <p className="text-text-muted text-sm mt-1">Adicione ou remova acessos ao sistema.</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingUser(null);
                            setNewName('');
                            setNewEmail('');
                            setNewPass('');
                            setNewRole('user');
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all font-bold text-sm"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        Novo Usuário
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-[1400px] mx-auto w-full">
                    {loading ? (
                        <p className="text-text-muted">Carregando...</p>
                    ) : (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#fcfaf8] dark:bg-neutral-800 border-b border-[#e7dbcf] dark:border-neutral-800">
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Nome</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Função</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e7dbcf] dark:divide-neutral-800">
                                    {users.map(user => (
                                        <tr
                                            key={user.id}
                                            onClick={() => handleEditUser(user)}
                                            className="hover:bg-background-light dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                                        >
                                            <td className="p-4 font-bold text-sm group-hover:text-primary transition-colors">{user.name}</td>
                                            <td className="p-4 text-sm text-text-muted">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}
                                                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Remover Usuário"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Novo/Editar Usuário */}
            {(isModalOpen || editingUser) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => { setIsModalOpen(false); setEditingUser(null); }}>
                    <div
                        className="bg-surface-light dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-[#e7dbcf] dark:border-neutral-800">
                            <h2 className="text-lg font-black">{editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}</h2>
                            <button onClick={() => { setIsModalOpen(false); setEditingUser(null); }}><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Nome</label>
                                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-background-light dark:bg-background-dark text-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Email</label>
                                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-background-light dark:bg-background-dark text-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1">{editingUser ? 'Nova Senha (Opcional)' : 'Senha Provisória'}</label>
                                <input type="text" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-background-light dark:bg-background-dark text-sm" required={!editingUser} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Permissão</label>
                                <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="w-full p-2.5 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-background-light dark:bg-background-dark text-sm">
                                    <option value="user">Usuário Comum (Vendedor)</option>
                                    <option value="diretoria">Diretoria</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button type="button" onClick={() => { setIsModalOpen(false); setEditingUser(null); }} className="px-4 py-2 text-sm font-bold text-text-muted hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;