import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, FileText, ArrowLeftRight } from 'lucide-react';

const FinancialNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'overview', label: 'Cadastro Financeiro', path: '/financeiro', icon: Wallet },
        { id: 'movements', label: 'Movimentações Bancárias', path: '/financeiro/movimentacoes', icon: ArrowLeftRight },
    ];

    const currentTab = tabs.find(tab => location.pathname === tab.path)?.id || 'overview';

    return (
        <div className="bg-white dark:bg-surface-dark border-b border-[#e7dbcf] dark:border-neutral-800 mb-6">
            <div className="flex gap-2 p-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                                ${isActive
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                                }
                            `}
                        >
                            <Icon size={18} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FinancialNav;
