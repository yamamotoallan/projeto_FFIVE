import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string | number;
    icon?: React.ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'info';
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    trend,
    trendValue,
    icon,
    color = 'primary'
}) => {
    // Cores sutis para os ícones/fundos dos ícones
    const colorClasses = {
        primary: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-primary' },
        success: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
        warning: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
        info: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' }
    };

    const currentColors = colorClasses[color];

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp size={16} className="text-green-500" />;
        if (trend === 'down') return <TrendingDown size={16} className="text-red-500" />;
        return <Minus size={16} className="text-gray-400" />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600 dark:text-green-400';
        if (trend === 'down') return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    // Ajustamos o ícone recebido para herdar a cor correta se possível,
    // mas como ele vem instanciado, vamos envolver num container estilizado.

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-6 shadow-sm hover:border-primary/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-text-muted dark:text-text-dark-muted font-medium text-sm uppercase tracking-wide">
                        {title}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h2 className="text-2xl font-bold text-text-main dark:text-white">
                            {value}
                        </h2>
                    </div>
                </div>
                {icon && (
                    <div className={`p-3 rounded-lg ${currentColors.bg} ${currentColors.text}`}>
                        {/* Clonando o elemento para forçar a cor, ou apenas renderizando dentro do container com cor de texto definida */}
                        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6', size: 24 })}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-2">
                {subtitle && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {subtitle}
                    </p>
                )}
                {trend && trendValue && (
                    <div className={`flex items-center gap-1 ${getTrendColor()} text-xs font-semibold bg-gray-50 dark:bg-neutral-800 px-2 py-1 rounded-full`}>
                        {getTrendIcon()}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetricCard;
