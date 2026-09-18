import React from 'react';
import { useTheme } from '../src/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm flex items-center justify-center hover:scale-105 transition-transform group"
            aria-label="Alternar tema"
        >
            {theme === 'light' ? (
                <span className="material-symbols-outlined text-text-muted dark:text-gold group-hover:text-primary dark:group-hover:text-gold-light transition-colors">
                    dark_mode
                </span>
            ) : (
                <span className="material-symbols-outlined text-gold group-hover:text-gold-light transition-colors">
                    light_mode
                </span>
            )}
        </button>
    );
};

export default ThemeToggle;
