// Utilitário para obter token JWT do localStorage
export const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

// Utilitário para headers com autenticação
export const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};
