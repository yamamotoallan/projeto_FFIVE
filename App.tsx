import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ToastProvider } from './src/contexts/ToastContext';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import NotificationCenter from './components/NotificationCenter';
import CopilotDrawer from './components/CopilotDrawer';
import { User } from './src/types/types';

// Lazy Load Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Agenda = lazy(() => import('./pages/Agenda'));
const Leads = lazy(() => import('./pages/Leads'));
const Quotes = lazy(() => import('./pages/Quotes'));
const Scripts = lazy(() => import('./pages/Scripts'));
const SettingsAI = lazy(() => import('./pages/SettingsAI'));
const ProjectsKanban = lazy(() => import('./pages/ProjectsKanban'));
const AccessControl = lazy(() => import('./pages/AccessControl'));
const WhatsappSettings = lazy(() => import('./pages/WhatsappSettings'));
const Profile = lazy(() => import('./pages/Profile'));
const NewProject = lazy(() => import('./pages/NewProject'));
const Login = lazy(() => import('./pages/Login'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const BusinessRules = lazy(() => import('./pages/BusinessRules'));
const SettingsMail = lazy(() => import('./pages/SettingsMail'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const KanbanChecklistSettings = lazy(() => import('./pages/settings/KanbanChecklistSettings'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Goals = lazy(() => import('./pages/Goals'));
const Employees = lazy(() => import('./pages/Employees'));
const Training = lazy(() => import('./pages/Training'));
const PurchaseRequisitions = lazy(() => import('./pages/PurchaseRequisitions'));
const BankReconciliation = lazy(() => import('./pages/BankReconciliation'));
const Contracts = lazy(() => import('./pages/Contracts'));
const Registrations = lazy(() => import('./pages/Registrations'));

const Financial = lazy(() => import('./pages/Financial'));
const Receivables = lazy(() => import('./pages/Receivables'));
const Payables = lazy(() => import('./pages/Payables'));
const BankMovements = lazy(() => import('./pages/BankMovements'));
const FinancialReports = lazy(() => import('./pages/FinancialReports'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex h-full w-full items-center justify-center bg-transparent">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('marcenaria_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('marcenaria_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('marcenaria_user');
  };

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">Carregando...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ThemeProvider>
          <HashRouter>
            <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-text-main dark:text-text-dark-main">

              {/* Render Sidebar only if logged in */}
              {user && <Sidebar user={user} onLogout={handleLogout} />}

              {/* Main Content Area with Scroll */}
              <div className="flex-1 h-full flex flex-col min-w-0 bg-background-light dark:bg-background-dark">
                {user && (
                  <header className="h-16 px-8 flex items-center justify-between border-b border-border-light dark:border-border-dark bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md sticky top-0 z-30 shrink-0">
                    <div className="flex items-center gap-4">
                      {/* Placeholder for breadcrumbs or page title if needed */}
                      <span className="text-sm font-bold opacity-0 md:opacity-100 transition-opacity">FFIVE System</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <NotificationCenter />
                      <ThemeToggle />
                      <div className="w-[1px] h-6 bg-border-light dark:bg-border-dark mx-1" />
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold leading-none">{user.name}</span>
                          <span className="text-[10px] text-text-muted dark:text-text-dark-muted uppercase font-bold tracking-wider">{user.role}</span>
                        </div>
                      </div>
                    </div>
                  </header>
                )}

                <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public Route */}
                      <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />

                      {/* Protected Routes */}
                      <Route path="/" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
                      <Route path="/agenda" element={user ? <Agenda /> : <Navigate to="/login" />} />
                      <Route path="/leads" element={user ? <Leads /> : <Navigate to="/login" />} />
                      <Route path="/orcamentos" element={user ? <Quotes /> : <Navigate to="/login" />} />
                      <Route path="/projetos" element={user ? <ProjectsKanban /> : <Navigate to="/login" />} /> {/* Added ProjectsKanban route */}
                      <Route path="/financeiro" element={user ? <Financial /> : <Navigate to="/login" />} />
                      <Route path="/financeiro/recebiveis" element={user ? <Receivables /> : <Navigate to="/login" />} />
                      <Route path="/financeiro/pagar" element={user ? <Payables /> : <Navigate to="/login" />} />
                      <Route path="/financeiro/movimentacoes" element={user ? <BankMovements /> : <Navigate to="/login" />} />
                      <Route path="/financeiro/relatorios" element={user ? <FinancialReports /> : <Navigate to="/login" />} />
                      <Route path="/regras" element={user ? <BusinessRules /> : <Navigate to="/login" />} />
                      <Route path="/metas" element={user ? <Goals /> : <Navigate to="/login" />} />
                      <Route path="/scripts" element={user ? <Scripts /> : <Navigate to="/login" />} />
                      <Route path="/settings" element={user ? <SettingsAI /> : <Navigate to="/login" />} />
                      <Route path="/settings/mail" element={user?.role === 'admin' || user?.role === 'diretoria' ? <SettingsMail /> : <Navigate to="/" />} />
                      <Route path="/financeiro/movimentacoes" element={user ? <BankMovements /> : <Navigate to="/login" />} />
                      <Route path="/financeiro/relatorios" element={user ? <FinancialReports /> : <Navigate to="/login" />} />
                      <Route path="/estoque" element={user ? <Inventory /> : <Navigate to="/login" />} />
                      <Route path="/regras" element={user ? <BusinessRules /> : <Navigate to="/login" />} />
                      <Route path="/perfil" element={user ? <Profile user={user} onUpdate={setUser} /> : <Navigate to="/login" />} />
                      <Route path="/perfil" element={user ? <Profile user={user} onUpdate={setUser} /> : <Navigate to="/login" />} />

                      {/* Admin & Diretoria Routes */}
                      <Route path="/admin/users" element={user?.role === 'admin' ? <AdminUsers /> : <Navigate to="/" />} />
                      <Route path="/admin/audit" element={user?.role === 'admin' || user?.role === 'diretoria' ? <AuditLogs /> : <Navigate to="/" />} />
                      <Route path="/admin/access-control" element={user?.role === 'admin' || user?.role === 'diretoria' ? <AccessControl /> : <Navigate to="/" />} />
                      <Route path="/whatsapp" element={user?.role === 'admin' || user?.role === 'diretoria' ? <WhatsappSettings /> : <Navigate to="/" />} />
                      <Route path="/settings/kanban-checklist" element={user?.role === 'admin' || user?.role === 'diretoria' ? <KanbanChecklistSettings /> : <Navigate to="/" />} />
                      <Route path="/settings/employees" element={user?.role === 'admin' || user?.role === 'diretoria' ? <Employees /> : <Navigate to="/" />} />
                      <Route path="/treinamento" element={user ? <Training /> : <Navigate to="/login" />} />
                      <Route path="/requisicoes" element={user ? <PurchaseRequisitions /> : <Navigate to="/login" />} />
                      <Route path="/conciliacao" element={user?.role === 'admin' || user?.role === 'diretoria' ? <BankReconciliation /> : <Navigate to="/" />} />
                      <Route path="/contratos" element={user ? <Contracts /> : <Navigate to="/login" />} />
                      <Route path="/cadastros" element={user ? <Registrations /> : <Navigate to="/login" />} />
                    </Routes>
                  </Suspense>
                </div>
              </div>

              {/* AI Copilot Drawer */}
              {user && <CopilotDrawer />}
            </div>
          </HashRouter>
        </ThemeProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;