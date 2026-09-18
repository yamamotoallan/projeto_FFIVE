
import React, { createContext, useContext, ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { AlertCircle, Info } from 'lucide-react';

interface ToastContextType {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    loading: (message: string) => string; // Added loading support mostly for future use, returns toast ID
    dismiss: (toastId?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const success = (message: string, duration?: number) => {
        toast.success(message, { duration });
    };

    const error = (message: string, duration?: number) => {
        toast.error(message, { duration });
    };

    const warning = (message: string, duration?: number) => {
        toast(message, {
            duration,
            icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
            style: {
                border: '1px solid #EAB308', // yellow-500
                background: '#FEFCE8', // yellow-50
                color: '#854D0E', // yellow-800
            },
        });
    };

    const info = (message: string, duration?: number) => {
        toast(message, {
            duration,
            icon: <Info className="w-5 h-5 text-blue-500" />,
            style: {
                border: '1px solid #3B82F6', // blue-500
                background: '#EFF6FF', // blue-50
                color: '#1E40AF', // blue-800
            },
        });
    };

    const loading = (message: string) => {
        return toast.loading(message);
    };

    const dismiss = (toastId?: string) => {
        toast.dismiss(toastId);
    };

    const value = {
        success,
        error,
        warning,
        info,
        loading,
        dismiss
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    // Default style for success/error which use default iconTheme
                    style: {
                        background: '#1F2937', // dark:bg-gray-800
                        color: '#F9FAFB', // dark:text-gray-50
                        maxWidth: '500px',
                    },
                    success: {
                        style: {
                            background: '#ECFDF5', // green-50
                            color: '#065F46', // green-800
                            border: '1px solid #10B981',
                        },
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#FFFFFF',
                        },
                    },
                    error: {
                        style: {
                            background: '#FEF2F2', // red-50
                            color: '#991B1B', // red-800
                            border: '1px solid #EF4444',
                        },
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#FFFFFF',
                        },
                    },
                    // We can also add global dark mode support if needed by checking theme context
                    // For now, let's keep it neutral or styled to match the previous implementation's aesthetics
                }}
            />
        </ToastContext.Provider>
    );
};
