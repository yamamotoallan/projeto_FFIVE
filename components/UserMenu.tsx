import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { useTheme } from '../src/contexts/ThemeContext';

interface UserMenuProps {
    user: User;
    onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMenuClick = (action: string) => {
        setIsOpen(false);

        switch (action) {
            case 'profile':
                navigate('/perfil');
                break;
            case 'settings':
                navigate('/settings');
                break;
            case 'theme':
                toggleTheme();
                break;
            case 'logout':
                onLogout();
                break;
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Administrador';
            case 'diretoria':
                return 'Diretoria';
            case 'user':
                return 'Usuário';
            default:
                return role;
        }
    };

    const getAvatarUrl = () => {
        // Verifica se o usuário tem foto customizada salva no localStorage
        const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
        if (savedAvatar) return savedAvatar;

        // Usa avatar padrão local
        return "/default-avatar.jpg";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary dark:hover:border-gold transition-all hover:scale-105"
                style={{
                    backgroundImage: `url("${getAvatarUrl()}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            ></button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-border-light dark:border-border-dark bg-gradient-to-br from-primary/5 to-transparent dark:from-gold/5">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-full border-2 border-primary dark:border-gold"
                                style={{
                                    backgroundImage: `url("${getAvatarUrl()}")`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            ></div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{user.name}</p>
                                <p className="text-xs text-text-muted dark:text-text-dark-muted truncate">
                                    {user.email}
                                </p>
                                <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 dark:bg-gold/10 text-primary dark:text-gold text-[10px] font-bold rounded-full">
                                    {getRoleLabel(user.role)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        <button
                            onClick={() => handleMenuClick('profile')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-text-muted dark:text-gold text-[20px]">
                                person
                            </span>
                            <span className="text-sm font-medium">Meu Perfil</span>
                        </button>

                        <button
                            onClick={() => handleMenuClick('settings')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-text-muted dark:text-gold text-[20px]">
                                settings
                            </span>
                            <span className="text-sm font-medium">Configurações</span>
                        </button>

                        <button
                            onClick={() => handleMenuClick('theme')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-text-muted dark:text-gold text-[20px]">
                                {theme === 'light' ? 'dark_mode' : 'light_mode'}
                            </span>
                            <span className="text-sm font-medium">
                                Tema {theme === 'light' ? 'Escuro' : 'Claro'}
                            </span>
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-border-light dark:border-border-dark">
                        <button
                            onClick={() => handleMenuClick('logout')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            <span className="text-sm font-bold">Sair do Sistema</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
