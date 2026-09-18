// CORREÇÃO MANUAL - Leads.tsx linha 83-98

// ❌ CÓDIGO ATUAL (ERRADO):
const fetchLeadQuotes = async (leadId: string) => {
    try {
        const response = await fetch(`${await api.analytics.getSummary()}`.replace('/analytics/summary', `/leads/${leadId}/quotes`).replace('api/api', 'api'), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        const quotes = await response.json();
        setLinkedQuotes(quotes || []);
    } catch (error) {
        console.error('Erro ao buscar orçamentos do lead:', error);
        setLinkedQuotes([]);
    }
};

// ✅ CÓDIGO CORRETO:
const fetchLeadQuotes = async (leadId: string) => {
    try {
        const isProd = import.meta.env.MODE === 'production';
        const API_URL = isProd
            ? 'https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app/api'
            : '/api';
        
        const response = await fetch(`${API_URL}/leads/${leadId}/quotes`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error(`Erro ${response.status} ao buscar quotes`);
            setLinkedQuotes([]);
            return;
        }
        
        const quotes = await response.json();
        console.log(`Quotes do lead ${leadId}:`, quotes);
        setLinkedQuotes(quotes || []);
    } catch (error) {
        console.error('Erro ao buscar orçamentos do lead:', error);
        setLinkedQuotes([]);
    }
};
