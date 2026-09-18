// Módulo de Notificações
import { query } from './db.js';

// Criar notificação
export async function createNotification({ userId, type, title, message, link }) {
    try {
        const result = await query(`
            INSERT INTO notifications (user_id, type, title, message, link)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [userId, type, title, message, link]);

        return result.rows[0];
    } catch (error) {
        console.error('Erro ao criar notificação:', error);
        throw error;
    }
}

// Listar notificações do usuário
export async function getUserNotifications(userId, limit = 20) {
    try {
        const result = await query(`
            SELECT * FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        `, [userId, limit]);

        return result.rows;
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        throw error;
    }
}

// Contar notificações não lidas
export async function getUnreadCount(userId) {
    try {
        const result = await query(`
            SELECT COUNT(*) as count
            FROM notifications
            WHERE user_id = $1 AND read = FALSE
        `, [userId]);

        return parseInt(result.rows[0].count);
    } catch (error) {
        console.error('Erro ao contar não lidas:', error);
        throw error;
    }
}

// Marcar como lida
export async function markAsRead(notificationId, userId) {
    try {
        const result = await query(`
            UPDATE notifications
            SET read = TRUE
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `, [notificationId, userId]);

        return result.rows[0];
    } catch (error) {
        console.error('Erro ao marcar como lida:', error);
        throw error;
    }
}

// Marcar todas como lidas
export async function markAllAsRead(userId) {
    try {
        await query(`
            UPDATE notifications
            SET read = TRUE
            WHERE user_id = $1 AND read = FALSE
        `, [userId]);

        return true;
    } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error);
        throw error;
    }
}

// Deletar notificação
export async function deleteNotification(notificationId, userId) {
    try {
        await query(`
            DELETE FROM notifications
            WHERE id = $1 AND user_id = $2
        `, [notificationId, userId]);

        return true;
    } catch (error) {
        console.error('Erro ao deletar notificação:', error);
        throw error;
    }
}

// Triggers para criar notificações automaticamente

// Notificação: Novo Lead
export async function notifyNewLead(leadId, leadName) {
    return createNotification({
        userId: 1, // Admin
        type: 'new_lead',
        title: '👤 Novo Lead Cadastrado',
        message: `${leadName} foi adicionado ao sistema.`,
        link: `/leads?highlight=${leadId}`
    });
}

// Notificação: Orçamento Aprovado
export async function notifyQuoteApproved(quoteId, clientName) {
    return createNotification({
        userId: 1,
        type: 'quote_approved',
        title: '✅ Orçamento Aprovado',
        message: `Orçamento #${quoteId} de ${clientName} foi aprovado!`,
        link: `/quotes?highlight=${quoteId}`
    });
}

// Notificação: Evento Próximo
export async function notifyEventSoon(eventId, eventTitle, minutesBefore) {
    return createNotification({
        userId: 1,
        type: 'event_soon',
        title: '⏰ Compromisso Próximo',
        message: `"${eventTitle}" em ${minutesBefore} minutos.`,
        link: `/agenda?highlight=${eventId}`
    });
}

// Notificação: Projeto Atualizado
export async function notifyProjectUpdate(projectId, projectName, newStage) {
    return createNotification({
        userId: 1,
        type: 'project_update',
        title: '📋 Projeto Atualizado',
        message: `"${projectName}" movido para: ${newStage}`,
        link: `/projects?highlight=${projectId}`
    });
}
