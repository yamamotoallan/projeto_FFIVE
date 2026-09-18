// Módulo de Analytics e Métricas
import { query } from './db.js';

// Taxa de Conversão (Lead → Projeto)
export async function getConversionRate() {
    try {
        const result = await query(`
            SELECT 
                COUNT(DISTINCT l.id) as total_leads,
                COUNT(DISTINCT p.id) as total_projects,
                CASE 
                    WHEN COUNT(DISTINCT l.id) > 0 
                    THEN ROUND((COUNT(DISTINCT p.id)::DECIMAL / COUNT(DISTINCT l.id)::DECIMAL) * 100, 2)
                    ELSE 0 
                END as conversion_rate
            FROM leads l
            LEFT JOIN projects p ON l.id = p.lead_id
            WHERE l.created_at >= NOW() - INTERVAL '30 days'
        `);

        return result.rows[0];
    } catch (error) {
        console.error('Erro ao calcular taxa de conversão:', error);
        throw error;
    }
}

// Tempo Médio de Fechamento (Lead → Projeto)
export async function getAvgClosingTime() {
    try {
        const result = await query(`
            SELECT 
                AVG(EXTRACT(EPOCH FROM (p.created_at - l.created_at)) / 86400) as avg_days,
                COUNT(*) as completed_projects
            FROM projects p
            JOIN leads l ON p.lead_id = l.id
            WHERE p.created_at >= NOW() - INTERVAL '90 days'
        `);

        const avgDays = parseFloat(result.rows[0].avg_days) || 0;

        return {
            avgDays: Math.round(avgDays * 10) / 10,
            completedProjects: parseInt(result.rows[0].completed_projects)
        };
    } catch (error) {
        console.error('Erro ao calcular tempo médio:', error);
        throw error;
    }
}

// Ticket Médio dos Projetos
export async function getAvgTicket() {
    try {
        const result = await query(`
            SELECT 
                AVG(value) as avg_value,
                MIN(value) as min_value,
                MAX(value) as max_value,
                COUNT(*) as total_projects
            FROM quotes
            WHERE status = 'approved'
            AND date >= NOW() - INTERVAL '90 days'
        `);

        return {
            avgValue: parseFloat(result.rows[0].avg_value) || 0,
            minValue: parseFloat(result.rows[0].min_value) || 0,
            maxValue: parseFloat(result.rows[0].max_value) || 0,
            totalProjects: parseInt(result.rows[0].total_projects)
        };
    } catch (error) {
        console.error('Erro ao calcular ticket médio:', error);
        throw error;
    }
}

// Faturamento Mensal
export async function getMonthlyRevenue(months = 6) {
    try {
        const result = await query(`
            SELECT 
                TO_CHAR(date, 'YYYY-MM') as month,
                SUM(value) as total,
                COUNT(*) as count
            FROM quotes
            WHERE status = 'approved'
            AND date >= NOW() - INTERVAL '${months} months'
            GROUP BY TO_CHAR(date, 'YYYY-MM')
            ORDER BY month ASC
        `);

        return result.rows.map(row => ({
            month: row.month,
            total: parseFloat(row.total) || 0,
            count: parseInt(row.count)
        }));
    } catch (error) {
        console.error('Erro ao calcular faturamento:', error);
        throw error;
    }
}

// Funil de Vendas (Pipeline)
export async function getSalesFunnel() {
    try {
        const result = await query(`
            SELECT 
                (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - INTERVAL '30 days') as leads,
                (SELECT COUNT(*) FROM quotes WHERE date >= NOW() - INTERVAL '30 days') as quotes,
                (SELECT COUNT(*) FROM quotes WHERE status = 'approved' AND date >= NOW() - INTERVAL '30 days') as approved,
                (SELECT COUNT(*) FROM projects WHERE created_at >= NOW() - INTERVAL '30 days') as projects
        `);

        return {
            leads: parseInt(result.rows[0].leads),
            quotes: parseInt(result.rows[0].quotes),
            approved: parseInt(result.rows[0].approved),
            projects: parseInt(result.rows[0].projects)
        };
    } catch (error) {
        console.error('Erro ao calcular funil:', error);
        throw error;
    }
}

// Comparativo com Período Anterior
export async function getComparison() {
    try {
        const result = await query(`
            SELECT 
                -- Período atual (últimos 30 dias)
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as current_leads,
                -- Período anterior (30-60 dias atrás)
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days' THEN 1 END) as previous_leads
            FROM leads
        `);

        const current = parseInt(result.rows[0].current_leads);
        const previous = parseInt(result.rows[0].previous_leads);
        const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

        return {
            current,
            previous,
            change: Math.round(change * 10) / 10,
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        };
    } catch (error) {
        console.error('Erro ao calcular comparativo:', error);
        throw error;
    }
}

// Leads últimos 7 dias
export async function getLeadsLast7Days() {
    try {
        const result = await query(`
            WITH days AS (
                SELECT generate_series(
                    date_trunc('day', NOW() - INTERVAL '6 days'),
                    date_trunc('day', NOW()),
                    '1 day'::interval
                ) as day
            )
            SELECT 
                TO_CHAR(days.day, 'Dy') as name,
                COUNT(l.id) as value
            FROM days
            LEFT JOIN leads l ON date_trunc('day', l.created_at) = days.day
            GROUP BY days.day
            ORDER BY days.day ASC
        `);

        // Tradução dias da semana (opcional, ou faz no front)
        const daysMap = { 'Sun': 'Dom', 'Mon': 'Seg', 'Tue': 'Ter', 'Wed': 'Qua', 'Thu': 'Qui', 'Fri': 'Sex', 'Sat': 'Sáb' };

        return result.rows.map(row => ({
            name: daysMap[row.name.trim()] || row.name,
            value: parseInt(row.value)
        }));
    } catch (error) {
        console.error('Erro ao buscar leads 7 dias:', error);
        return [];
    }
}

// Orçamentos por Status
export async function getQuotesByStatus() {
    try {
        const result = await query(`
            SELECT 
                status as name,
                COUNT(*) as value
            FROM quotes
            GROUP BY status
        `);

        const colors = {
            'Novo': '#3b82f6',
            'Em Análise': '#eab308',
            'Aprovado': '#22c55e',
            'Rejeitado': '#f87171',
            'Rascunho': '#9ca3af'
        };

        return result.rows.map(row => ({
            name: row.name,
            value: parseInt(row.value),
            color: colors[row.name] || '#6b7280'
        }));
    } catch (error) {
        console.error('Erro ao buscar status orçamentos:', error);
        return [];
    }
}

// Dashboard Resumo
export async function getDashboardSummary() {
    try {
        const [conversion, closingTime, ticket, funnel, comparison, revenue, leadsChart, statusChart] = await Promise.all([
            getConversionRate(),
            getAvgClosingTime(),
            getAvgTicket(),
            getSalesFunnel(),
            getComparison(),
            getMonthlyRevenue(),
            getLeadsLast7Days(),
            getQuotesByStatus()
        ]);

        return {
            conversion,
            closingTime,
            ticket,
            funnel,
            comparison,
            revenue,
            leadsChart,
            statusChart
        };
    } catch (error) {
        console.error('Erro ao gerar resumo:', error);
        throw error;
    }
}
