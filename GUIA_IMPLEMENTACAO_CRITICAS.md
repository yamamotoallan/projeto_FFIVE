# 🚀 GUIA DE IMPLEMENTAÇÃO - Correções Críticas

**Tempo Total**: ~2 horas  
**Risco**: Baixo (todas as mudanças são additive)  
**Rollback**: Git revert simples

---

## 1️⃣ Corrigir Memory Leak no Rate Limiting

**Arquivo**: `src/server/rateLimit.js`

**Antes**:
```javascript
const rateLimit = new Map();

// Limpar entradas antigas (ineficiente)
for (const [key, data] of rateLimit.entries()) {
  if (now - data.windowStart > WINDOW_MS) {
    rateLimit.delete(key);
  }
}
```

**Depois** (substituir todo o arquivo):

```javascript
// Middleware de Rate Limiting com proteção contra memory leak
// Implementa limpeza agressiva e limite máximo de entradas

const rateLimit = new Map();
const loginAttempts = new Map();

const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 100; // 100 requisições por minuto
const MAX_RATE_LIMIT_ENTRIES = 5000; // ✅ NOVO: Proteção contra memory leak

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_LOGIN_ENTRIES = 1000; // ✅ NOVO

export function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.connection.remoteAddress;
  const now = Date.now();

  // ✅ NOVO: Limpeza agressiva se Map fica muito grande
  if (rateLimit.size > MAX_RATE_LIMIT_ENTRIES) {
    const entries = Array.from(rateLimit.entries());
    entries.sort((a, b) => a[1].windowStart - b[1].windowStart);
    const toDelete = Math.floor(entries.length * 0.3); // Delete 30% das mais antigas
    entries.slice(0, toDelete).forEach(([key]) => {
      rateLimit.delete(key);
    });
    console.warn(`[RATE_LIMIT] Cleanup: removed ${toDelete} entries to prevent memory leak`);
  }

  // Limpar entradas expiradas
  for (const [key, data] of rateLimit.entries()) {
    if (now - data.windowStart > WINDOW_MS) {
      rateLimit.delete(key);
    }
  }

  // Obter ou criar entrada
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
    console.warn(`[RATE_LIMIT] Exceeded for IP: ${ip}`);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Você excedeu o limite de requisições. Tente novamente em 1 minuto.',
      retryAfter: Math.ceil((ipData.windowStart + WINDOW_MS - now) / 1000)
    });
  }

  next();
}

export function loginRateLimitMiddleware(req, res, next) {
  const ip = req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.connection.remoteAddress;
  const now = Date.now();

  // ✅ NOVO: Proteção contra memory leak
  if (loginAttempts.size > MAX_LOGIN_ENTRIES) {
    const entries = Array.from(loginAttempts.entries());
    entries.sort((a, b) => a[1].windowStart - b[1].windowStart);
    const toDelete = Math.floor(entries.length * 0.3);
    entries.slice(0, toDelete).forEach(([key]) => {
      loginAttempts.delete(key);
    });
    console.warn(`[LOGIN_LIMIT] Cleanup: removed ${toDelete} entries`);
  }

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
    console.error(`[BRUTE_FORCE] Attempt from IP: ${ip}`);
    return res.status(429).json({
      error: 'Too Many Login Attempts',
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      retryAfter: Math.ceil((ipData.windowStart + LOGIN_WINDOW_MS - now) / 1000)
    });
  }

  next();
}

export function resetLoginAttempts(ip) {
  loginAttempts.delete(ip);
}
```

**Teste**: `npm start` e verificar logs não aparecem "Cleanup" infinitamente

---

## 2️⃣ Aumentar Connection Pool do Banco

**Arquivo**: `src/server/db.js`

**Antes**:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});
```

**Depois**:
```javascript
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  
  // ✅ NOVO: Otimizado para produção
  max: 20,              // Aumentado de 5 para 20
  min: 5,               // Manter 5 conexões quentes
  idleTimeoutMillis: 30000,     // 30s (aumentado)
  connectionTimeoutMillis: 5000, // 5s (reduzido para falhar mais rápido)
  statement_timeout: 30000,      // 30s timeout em queries
  query_timeout: 30000,
  
  // ✅ NOVO: Aguardar conexão disponível
  waitForAvailableConnectionTimeoutMillis: 5000,
});

// Connection established
pool.on('connect', () => {
  console.log('✅ Connected to Neon.tech successfully!');
});

// Handle pool errors without crashing
pool.on('error', (err) => {
  console.error('❌ Unexpected database client error:', err.message);
});

// ✅ NOVO: Ping periódico para evitar cold connections
let lastPingTime = Date.now();
const PING_INTERVAL = 60 * 1000; // A cada 60 segundos

setInterval(() => {
  pool.query('SELECT 1').then(() => {
    lastPingTime = Date.now();
    console.log('[DB Ping] ✅ Connection pool healthy');
  }).catch(err => {
    console.warn('[DB Ping] ⚠️ Connection pool error:', err.message);
  });
}, PING_INTERVAL);

export const query = (text, params) => pool.query(text, params);
export default pool;
```

**Teste**: 
```bash
npm start
# Verificar logs: "Connection pool healthy" a cada 60s
```

---

## 3️⃣ Adicionar Global Error Handler

**Novo Arquivo**: `src/server/utils/errorHandler.js`

```javascript
import { logError } from './sanitize.js';

/**
 * Wrapper para rotas async para capturar erros
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Error handling middleware - deve ser o ÚLTIMO middleware
 */
export function errorHandlerMiddleware(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Log estruturado
  console.error(JSON.stringify({
    level: 'ERROR',
    timestamp: new Date().toISOString(),
    errorId,
    status,
    message,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  }));

  // Registrar no banco de dados (audit)
  if (req.user) {
    logError(message, err, {
      userId: req.user.id,
      path: req.path,
      method: req.method,
      errorId
    }).catch(dbErr => {
      console.error('Failed to log error to database:', dbErr.message);
    });
  }

  // Resposta padronizada
  const response = {
    success: false,
    message,
    errorId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(status).json(response);
}

/**
 * Unhandled Promise Rejection Handler
 */
export function setupUnhandledRejectionHandler() {
  process.on('unhandledRejection', (reason, promise) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      type: 'UNHANDLED_REJECTION',
      timestamp: new Date().toISOString(),
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined
    }));
  });
}

/**
 * Uncaught Exception Handler
 */
export function setupUncaughtExceptionHandler() {
  process.on('uncaughtException', (error) => {
    console.error(JSON.stringify({
      level: 'CRITICAL',
      type: 'UNCAUGHT_EXCEPTION',
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack
    }));
    // Shutdown após alguns segundos
    setTimeout(() => process.exit(1), 5000);
  });
}
```

**Arquivo**: `src/server/app.js` (modificar)

Adicionar ao início:
```javascript
import { errorHandlerMiddleware, setupUnhandledRejectionHandler, setupUncaughtExceptionHandler } from './utils/errorHandler.js';
```

Adicionar ao final do arquivo (antes de `export default app`):
```javascript
// ✅ NOVO: Setup de handlers globais
setupUnhandledRejectionHandler();
setupUncaughtExceptionHandler();

// ✅ NOVO: Global Error Handler (DEVE ser o último middleware)
app.use(errorHandlerMiddleware);

export default app;
```

**Teste**:
```bash
curl http://localhost:3000/api/invalid-endpoint
# Deve retornar JSON estruturado com errorId
```

---

## 4️⃣ Adicionar Timeout em Uploads Cloudinary

**Arquivo**: `src/server/storage.js` (modificar função `uploadFile`)

**Antes**:
```javascript
export async function uploadFile(fileBuffer, originalName, mimetype, folder = '') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', public_id: finalPublicId, type: 'authenticated' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.public_id);
      }
    );
    uploadStream.end(fileBuffer);
  });
}
```

**Depois**:
```javascript
export async function uploadFile(fileBuffer, originalName, mimetype, folder = '') {
  return new Promise((resolve, reject) => {
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalPublicId = `${timestamp()}-${sanitizedName}`;

    // ✅ NOVO: Timeout de 30 segundos
    const uploadTimeout = setTimeout(() => {
      reject(new Error('Upload timeout: arquivo levou mais de 30 segundos'));
    }, 30000);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: finalPublicId,
        type: 'authenticated',
        // ✅ NOVO: Validação de tamanho
        max_file_size: 10485760 // 10MB
      },
      (error, result) => {
        clearTimeout(uploadTimeout); // ✅ Limpar timeout
        
        if (error) {
          console.error('❌ Upload Cloudinary error:', error.message);
          return reject(new Error(`Upload failed: ${error.message}`));
        }
        
        console.log(`✅ Upload successful: ${result.public_id}`);
        resolve(result.public_id);
      }
    );

    // ✅ NOVO: Tratar erros de stream
    uploadStream.on('error', (err) => {
      clearTimeout(uploadTimeout);
      console.error('❌ Upload stream error:', err.message);
      reject(err);
    });

    // ✅ NOVO: Validar tamanho antes
    if (fileBuffer.length > 10485760) {
      clearTimeout(uploadTimeout);
      return reject(new Error('Arquivo muito grande. Máximo: 10MB'));
    }

    uploadStream.end(fileBuffer);
  });
}
```

**Teste**:
```bash
# Testar upload com arquivo pequeno
curl -F "file=@test.pdf" http://localhost:3000/api/upload
```

---

## 5️⃣ Melhorar Keep-Alive

**Arquivo**: `api/start.js`

**Antes**:
```javascript
setInterval(async () => {
  try {
    const res = await fetch(`${RAILWAY_URL}/health`);
    const data = await res.json();
    console.log(`[Keep-Alive] ${new Date().toISOString()} | Status: ${data.status} | DB: ${data.services?.database}`);
  } catch (err) {
    console.error(`[Keep-Alive] Ping failed: ${err.message}`);
  }
}, 5 * 60 * 1000);
```

**Depois**:
```javascript
import app from '../src/server/app.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Node version: ${process.version}`);

  // ✅ NOVO: Keep-Alive com lógica melhorada
  const RAILWAY_URL = process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${PORT}`;

  const PING_INTERVAL = 4 * 60 * 1000; // A cada 4 minutos
  const PING_TIMEOUT = 10000; // Timeout de 10 segundos
  let lastPingStatus = 'unknown';
  let consecutiveFailures = 0;

  setInterval(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT);
    
    try {
      const startTime = Date.now();
      const res = await fetch(`${RAILWAY_URL}/health`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'KeepAlive-Ping/1.0' }
      });
      
      const duration = Date.now() - startTime;
      
      if (!res.ok) {
        console.warn(`[Keep-Alive] ⚠️ Health check returned ${res.status}`);
        lastPingStatus = `error_${res.status}`;
        consecutiveFailures++;
      } else {
        const data = await res.json();
        console.log(`[Keep-Alive] ✅ OK (${duration}ms) | Status: ${data.status} | DB: ${data.services?.database}`);
        lastPingStatus = data.status;
        consecutiveFailures = 0;
      }
      
      // ✅ NOVO: Alerta se muitas falhas consecutivas
      if (consecutiveFailures > 3) {
        console.error(`[Keep-Alive] 🔴 CRITICAL: ${consecutiveFailures} consecutive failures`);
      }
      
    } catch (err) {
      console.warn(`[Keep-Alive] ⚠️ Ping failed (${err.message})`);
      lastPingStatus = 'error';
      consecutiveFailures++;
    } finally {
      clearTimeout(timeout);
    }
  }, PING_INTERVAL);

  console.log(`[Keep-Alive] Ativo a cada ${PING_INTERVAL / 60000} minutos → ${RAILWAY_URL}/health`);
});

// ✅ NOVO: Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('📋 SIGTERM received, initiating graceful shutdown...');
  
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    // Fechar conexões do banco
    try {
      const pool = await import('../src/server/db.js').then(m => m.default);
      await pool.end();
      console.log('✅ Database pool closed');
    } catch (err) {
      console.error('❌ Error closing database pool:', err.message);
    }
    
    console.log('✅ Shutdown complete');
    process.exit(0);
  });

  // Force shutdown após 30 segundos
  setTimeout(() => {
    console.error('❌ Forced shutdown after 30s');
    process.exit(1);
  }, 30000);
});
```

---

## 🧪 CHECKLIST DE TESTE

Após aplicar as correções:

```bash
# 1. Build
npm run build

# 2. Start local
npm start

# 3. Verificar logs
# ✅ "Server running on port 3000"
# ✅ "Connected to Neon.tech successfully!"
# ✅ "Connection pool healthy" (a cada 60s)
# ✅ "Keep-Alive OK" (a cada 4 min)

# 4. Test endpoints
curl http://localhost:3000/health
# Resposta: {"status": "healthy", ...}

# 5. Test rate limiting
for i in {1..150}; do curl http://localhost:3000/api/leads; done
# 150ª requisição deve retornar 429 (Too Many Requests)

# 6. Test error handling
curl http://localhost:3000/api/invalid
# Resposta: {"success": false, "errorId": "...", "message": "..."}

# 7. Deploy para Railway/Render
git add .
git commit -m "fix: critical stability improvements"
git push
# Observar logs no dashboard do host
```

---

## ⏱️ TEMPO POR TAREFA

| Tarefa | Tempo | Dificuldade |
|--------|-------|-----------|
| 1. Fix Rate Limit | 15 min | ⭐ Fácil |
| 2. Connection Pool | 15 min | ⭐ Fácil |
| 3. Error Handler | 30 min | ⭐⭐ Médio |
| 4. Upload Timeout | 20 min | ⭐ Fácil |
| 5. Keep-Alive | 15 min | ⭐ Fácil |
| 6. Teste e Deploy | 30 min | ⭐⭐ Médio |
| **TOTAL** | **2h 5min** | - |

---

**Próximo passo**: Implementar essas correções e depois considerar migração para **Render.com** (ver documento principal de arquitetura).
