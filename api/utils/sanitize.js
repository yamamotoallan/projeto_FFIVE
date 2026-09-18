// Utilitário para sanitizar dados sensíveis em logs
// Previne vazamento de senhas, tokens e outros dados sensíveis

/**
 * Remove campos sensíveis de um objeto antes de logar
 * @param {Object} obj - Objeto a ser sanitizado
 * @returns {Object} - Objeto sem dados sensíveis
 */
export function sanitizeForLog(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    // Clonar objeto para não mutar o original
    const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

    // Lista de campos sensíveis que devem ser removidos/mascarados
    const sensitiveKeys = [
        'password',
        'password_hash',
        'passwordHash',
        'senha',
        'smtp_pass',
        'smtpPass',
        'token',
        'accessToken',
        'access_token',
        'refreshToken',
        'refresh_token',
        'secret',
        'apiKey',
        'api_key',
        'privateKey',
        'private_key',
        'authorization',
        'auth'
    ];

    // Remover/mascarar campos sensíveis
    for (const key in sanitized) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
            sanitized[key] = '***REDACTED***';
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            // Recursivo para objetos aninhados
            sanitized[key] = sanitizeForLog(sanitized[key]);
        }
    }

    return sanitized;
}

/**
 * Versão para usar em logs de erro
 * @param {string} message - Mensagem de erro
 * @param {Error} error - Objeto de erro
 * @param {Object} context - Contexto adicional (req.body, etc)
 */
export function logError(message, error, context = {}) {
    console.error(message, {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        context: sanitizeForLog(context)
    });
}

/**
 * Versão para logs de auditoria
 */
export function logAudit(action, details = {}) {
    console.log(`[AUDIT] ${action}`, sanitizeForLog(details));
}
