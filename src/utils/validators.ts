/**
 * Sistema de Validação Centralizado
 * Fornece validadores reutilizáveis para formulários
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export const validators = {
    /**
     * Valida formato de email
     */
    email: (value: string): ValidationResult => {
        if (!value) {
            return { isValid: true }; // Email é opcional em muitos casos
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { isValid: false, error: 'Email inválido. Use formato: exemplo@email.com' };
        }

        return { isValid: true };
    },

    /**
     * Valida formato de telefone brasileiro
     * Aceita: (11) 98765-4321, 11987654321, etc
     */
    phone: (value: string): ValidationResult => {
        if (!value) {
            return { isValid: true }; // Telefone pode ser opcional
        }

        // Remove caracteres não numéricos
        const cleaned = value.replace(/\D/g, '');

        if (cleaned.length < 10 || cleaned.length > 11) {
            return {
                isValid: false,
                error: 'Telefone inválido. Use formato: (00) 00000-0000'
            };
        }

        return { isValid: true };
    },

    /**
     * Valida número positivo (para valores monetários)
     */
    positiveNumber: (value: string | number): ValidationResult => {
        const num = typeof value === 'string' ? parseFloat(value) : value;

        if (isNaN(num)) {
            return { isValid: false, error: 'Valor deve ser um número' };
        }

        if (num <= 0) {
            return { isValid: false, error: 'Valor deve ser maior que zero' };
        }

        return { isValid: true };
    },

    /**
     * Valida se data está no futuro
     */
    futureDate: (dateString: string): ValidationResult => {
        if (!dateString) {
            return { isValid: false, error: 'Data é obrigatória' };
        }

        const selectedDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera horas para comparar apenas a data

        if (selectedDate < today) {
            return { isValid: false, error: 'Data deve estar no futuro' };
        }

        return { isValid: true };
    },

    /**
     * Valida campo obrigatório
     */
    required: (value: string, fieldName: string = 'Campo'): ValidationResult => {
        if (!value || value.trim() === '') {
            return { isValid: false, error: `${fieldName} é obrigatório` };
        }

        return { isValid: true };
    },

    /**
     * Valida comprimento mínimo
     */
    minLength: (value: string, min: number, fieldName: string = 'Campo'): ValidationResult => {
        if (value.length < min) {
            return {
                isValid: false,
                error: `${fieldName} deve ter no mínimo ${min} caracteres`
            };
        }

        return { isValid: true };
    },

    /**
     * Valida se valor está dentro de um range
     */
    range: (value: number, min: number, max: number): ValidationResult => {
        if (value < min || value > max) {
            return {
                isValid: false,
                error: `Valor deve estar entre ${min} e ${max}`
            };
        }

        return { isValid: true };
    }
};

/**
 * Helper para validar múltiplos campos de uma vez
 * Retorna o primeiro erro encontrado ou null se tudo válido
 */
export const validateForm = (validations: ValidationResult[]): string | null => {
    for (const validation of validations) {
        if (!validation.isValid && validation.error) {
            return validation.error;
        }
    }
    return null;
};
