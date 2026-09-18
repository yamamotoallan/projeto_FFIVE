// Middleware de Rate Limiting
// Protege contra ataques DDoS e uso abusivo da API

const rateLimit = new Map();

// Configuração
const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 100; // 100 requisições por minuto por IP

export function rateLimitMiddleware(req, res, next) {
    const ip = req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.connection.remoteAddress;
    const now = Date.now();

    // Limpar entradas antigas
    for (const [key, data] of rateLimit.entries()) {
        if (now - data.windowStart > WINDOW_MS) {
            rateLimit.delete(key);
        }
    }

    // Obter ou criar entrada para este IP
    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, {
            count: 0,
            windowStart: now
        });
    }

    const ipData = rateLimit.get(ip);

    // Resetar janela se expirou
    if (now - ipData.windowStart > WINDOW_MS) {
        ipData.count = 0;
        ipData.windowStart = now;
    }

    // Incrementar contador
    ipData.count++;

    // Headers informativos
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - ipData.count));
    res.setHeader('X-RateLimit-Reset', new Date(ipData.windowStart + WINDOW_MS).toISOString());

    // Verificar limite
    if (ipData.count > MAX_REQUESTS) {
        console.warn(`Rate limit exceeded for IP: ${ip}`);
        return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Você excedeu o limite de requisições. Tente novamente em 1 minuto.',
            retryAfter: Math.ceil((ipData.windowStart + WINDOW_MS - now) / 1000)
        });
    }

    next();
}

// Rate limit mais restritivo para login (prevenir brute force)
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_LOGIN_ATTEMPTS = 5;

export function loginRateLimitMiddleware(req, res, next) {
    const ip = req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.connection.remoteAddress;
    const now = Date.now();

    // Limpar entradas antigas
    for (const [key, data] of loginAttempts.entries()) {
        if (now - data.windowStart > LOGIN_WINDOW_MS) {
            loginAttempts.delete(key);
        }
    }

    if (!loginAttempts.has(ip)) {
        loginAttempts.set(ip, {
            count: 0,
            windowStart: now
        });
    }

    const ipData = loginAttempts.get(ip);

    if (now - ipData.windowStart > LOGIN_WINDOW_MS) {
        ipData.count = 0;
        ipData.windowStart = now;
    }

    ipData.count++;

    if (ipData.count > MAX_LOGIN_ATTEMPTS) {
        console.error(`Login brute force attempt from IP: ${ip}`);
        return res.status(429).json({
            error: 'Too Many Login Attempts',
            message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
            retryAfter: Math.ceil((ipData.windowStart + LOGIN_WINDOW_MS - now) / 1000)
        });
    }

    next();
}

// Resetar tentativas de login após sucesso
export function resetLoginAttempts(ip) {
    loginAttempts.delete(ip);
}
