import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    return (
        <div
            className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin ${className}`}
            role="status"
            aria-label="Carregando"
        />
    );
};

interface SkeletonProps {
    width?: string;
    height?: string;
    className?: string;
    rounded?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '1rem',
    className = '',
    rounded = false
}) => {
    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-neutral-700 ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
            style={{ width, height }}
        />
    );
};

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}) => {
    return (
        <button
            disabled={disabled || loading}
            className={`flex items-center justify-center gap-2 ${className}`}
            {...props}
        >
            {loading && <Spinner size="sm" />}
            {children}
        </button>
    );
};

interface LoadingOverlayProps {
    loading: boolean;
    children: React.ReactNode;
    text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    loading,
    children,
    text = 'Carregando...'
}) => {
    return (
        <div className="relative">
            {children}
            {loading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 flex flex-col items-center justify-center gap-3 rounded-lg z-50">
                    <Spinner size="lg" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{text}</p>
                </div>
            )}
        </div>
    );
};
