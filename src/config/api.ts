// Configuração da URL da API
// Usa variável de ambiente em produção, fallback para /api em desenvolvimento

const API_URL = import.meta.env.VITE_API_URL || '';

export default API_URL;
