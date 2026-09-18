import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { User } from '../types';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

interface NavItem {
  name: string;
  icon: string;
  path?: string;
  roles: string[];
  children?: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(['Configurações']); // Start Settings open by default or keep closed

  const isActive = (path?: string) => path && location.pathname === path;
  const isParentActive = (item: NavItem) => item.children?.some(child => isActive(child.path));

  const toggleMenu = (name: string) => {
    setOpenMenus(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  // Função para pegar avatar do usuário (mesma lógica do Profile.tsx)
  const getUserAvatar = () => {
    if (user) {
      // Verifica se o usuário tem foto customizada salva no localStorage
      const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
      if (savedAvatar) return savedAvatar;
    }

    // Usa avatar padrão local
    return "/default-avatar.jpg";
  };

  // Define Navigation Structure
  const navStructure: NavItem[] = [
    { name: 'Dashboard Inicial', icon: 'dashboard', path: '/', roles: ['admin', 'diretoria', 'user'] },
    { name: 'Agenda', icon: 'calendar_today', path: '/agenda', roles: ['admin', 'diretoria', 'user'] },
    { name: 'Leads', icon: 'groups', path: '/leads', roles: ['admin', 'diretoria', 'user'] },
    { name: 'Orçamentos', icon: 'receipt_long', path: '/orcamentos', roles: ['admin', 'diretoria', 'user'] },
    { name: 'Projetos', icon: 'tactic', path: '/projetos', roles: ['admin', 'diretoria', 'user'] },
    { name: 'Financeiro', icon: 'payments', path: '/financeiro', roles: ['admin', 'diretoria'] },
    { name: 'Estoque', icon: 'inventory_2', path: '/estoque', roles: ['admin', 'diretoria', 'user'] },
    { name: 'Scripts', icon: 'description', path: '/scripts', roles: ['admin', 'diretoria', 'user'] },
    { name: 'Perfil', icon: 'person', path: '/perfil', roles: ['admin', 'diretoria', 'user'] },
    {
      name: 'Configurações',
      icon: 'settings',
      roles: ['admin', 'diretoria'],
      children: [
        { name: 'Prazos e Regras', icon: 'rule_settings', path: '/regras', roles: ['admin', 'diretoria'] },
        { name: 'Whatsapp', icon: 'chat', path: '/whatsapp', roles: ['admin', 'diretoria'] },
        { name: 'Configuração E-mail', icon: 'mail', path: '/settings/mail', roles: ['admin', 'diretoria'] },
        { name: 'Configuração IA', icon: 'settings_suggest', path: '/settings', roles: ['admin', 'diretoria'] },
        { name: 'Auditoria de Logs', icon: 'history', path: '/admin/audit', roles: ['admin', 'diretoria'] },
        { name: 'Controle de Acesso', icon: 'admin_panel_settings', path: '/admin/access-control', roles: ['admin', 'diretoria'] },
        { name: 'Checklist Kanban', icon: 'checklist', path: '/settings/kanban-checklist', roles: ['admin', 'diretoria'] },

        { name: 'Usuários', icon: 'manage_accounts', path: '/admin/users', roles: ['admin'] },
      ]
    }
  ];

  const hasRole = (role: string, allowedRoles: string[]) => allowedRoles.includes(role);

  const renderNavItem = (item: NavItem) => {
    if (!hasRole(user?.role || 'user', item.roles)) return null;

    if (item.children) {
      // Filter children based on role permissions (e.g. users hidden for directories)
      const visibleChildren = item.children.filter(child => hasRole(user?.role || 'user', child.roles));

      if (visibleChildren.length === 0) return null;

      const isOpen = openMenus.includes(item.name);
      const activeParent = isParentActive(item);

      return (
        <div key={item.name} className="flex flex-col gap-1">
          <button
            onClick={() => toggleMenu(item.name)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all group ${activeParent
              ? 'bg-primary/5 dark:bg-gold/5 text-primary dark:text-gold'
              : 'text-text-main dark:text-text-dark-main hover:bg-gray-100 dark:hover:bg-neutral-900'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined ${activeParent ? 'fill' : ''} ${!activeParent ? 'text-text-muted dark:text-text-dark-muted group-hover:text-primary dark:group-hover:text-gold' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-sm ${activeParent ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
            </div>
            <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {isOpen && (
            <div className="flex flex-col gap-1 pl-4 border-l-2 border-border-light dark:border-neutral-800 ml-5 my-1">
              {visibleChildren.map(child => (
                <Link
                  key={child.path}
                  to={child.path!}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${isActive(child.path)
                    ? 'bg-primary-light dark:bg-gold/10 text-primary dark:text-gold'
                    : 'text-text-muted dark:text-text-dark-muted hover:text-text-main dark:hover:text-text-dark-main hover:bg-gray-50 dark:hover:bg-neutral-900'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {child.icon}
                  </span>
                  <span className={`text-sm ${isActive(child.path) ? 'font-bold' : 'font-medium'}`}>{child.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path!}
        onClick={() => setIsMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive(item.path)
          ? 'bg-primary-light dark:bg-gold/10 text-primary dark:text-gold'
          : 'text-text-main dark:text-text-dark-main hover:bg-gray-100 dark:hover:bg-neutral-900'
          }`}
      >
        <span className={`material-symbols-outlined ${isActive(item.path) ? 'fill' : ''} ${!isActive(item.path) ? 'text-text-muted dark:text-text-dark-muted group-hover:text-primary dark:group-hover:text-gold' : ''}`}>
          {item.icon}
        </span>
        <span className={`text-sm ${isActive(item.path) ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Mobile Toggle Trigger */}
      <div id="mobile-menu-trigger" className="hidden"></div>

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        flex flex-col w-72 h-full bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark p-4 shrink-0 transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 border border-primary/20 shadow-sm"
              style={{ backgroundImage: `url("${getUserAvatar()}")` }}
            ></div>
            <div className="flex flex-col">
              <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tighter text-[#D4AF37] dark:text-[#F4C430] leading-none">FFIVE</h1>
                <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] dark:text-[#F4C430] mb-1">Ambientes Planejados</p>
                <p className="text-text-muted text-xs truncate max-w-[150px]">Olá, {user?.name || 'Visitante'}</p>
              </div>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setIsMobileOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {navStructure.map(item => renderNavItem(item))}
        </nav>

        <div className="mt-auto pt-4 border-t border-border-light dark:border-border-dark">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-bold">Sair do Sistema</span>
          </button>
          <div className="mt-2 px-3 py-2 text-[10px] text-center text-text-muted dark:text-text-dark-muted">v2.6.0</div>
        </div>
      </aside>

      <script dangerouslySetInnerHTML={{
        __html: `
        document.addEventListener('open-sidebar', () => {
            const sidebar = document.querySelector('aside');
            // Logic handled by React state/parent in full app
        });
      `}} />
    </>
  );
};

export default Sidebar;