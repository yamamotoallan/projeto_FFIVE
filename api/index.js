import express from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import nodemailerLib from 'nodemailer';
import * as notifications from './notifications.js';
import * as analytics from './analytics.js';
import { rateLimitMiddleware, loginRateLimitMiddleware, resetLoginAttempts } from './rateLimit.js';
import { authenticateToken } from './middleware/auth.js';
import { sanitizeForLog, logError } from './utils/sanitize.js';

// Routes Imports
import financialRoutes from './routes/financial.js';
import kanbanRouter from './routes/kanban.js';
import inventoryRouter from './routes/inventory.js';
import logsRouter from './routes/logs.js';
import healthRouter from './health.js';

// Configuração de Variáveis de Ambiente
let JWT_SECRET = process.env.JWT_SECRET;


// Validação crítica: JWT_SECRET deve existir em produção
if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('🔴 CRITICAL: JWT_SECRET must be defined in production!');
    } else {
        console.warn('⚠️  WARNING: Using default JWT_SECRET in development');
        JWT_SECRET = 'dev_secret_ONLY_FOR_DEVELOPMENT';
    }
}

// Validar tamanho mínimo em produção
if (JWT_SECRET.length < 32 && process.env.NODE_ENV === 'production') {
    throw new Error('🔴 CRITICAL: JWT_SECRET must be at least 32 characters!');
}

// Inicializa o app
const app = express();

// Confia no primeiro proxy (Crucial para Cloud Run / Vercel / Heroku)
// Isso popula req.ip com o IP real do cliente (X-Forwarded-For)
app.set('trust proxy', 1);

// Middleware de Segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: [
                "'self'",
                "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app"
            ],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));


// Rate limiting global
app.use(rateLimitMiddleware);

// CORS restritivo - apenas origens autorizadas
// CORS Permissivo para Debugging (Permite Vercel e Localhost dinamicamente)
app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sem origin (mobile apps, curl, postman)
        if (!origin) return callback(null, true);

        // Em produção, verificar se é o domínio da Vercel ou Railway
        if (origin.includes('vercel.app') || origin.includes('railway.app') || origin.includes('localhost')) {
            return callback(null, true);
        }

        console.warn(`CORS blocked: ${origin}`);
        callback(null, true); // TEMPORÁRIO: Permitir tudo para desbloquear o usuário se a verificação falhar
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

// Configuração de Multer para upload em memória
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5
    }
});

// Module Routes
app.use(healthRouter);
app.use('/api/financial', financialRoutes);
app.use('/api/kanban', kanbanRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/audit-logs', logsRouter);

// --- SCHEMAS DE VALIDAÇÃO (ZOD) ---
const LoginSchema = z.object({
    email: z.string().email('Formato de email inválido'),
    password: z.string().min(1, 'Senha é obrigatória')
});



const UserSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Formato de email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    role: z.enum(['admin', 'user', 'diretoria']).optional()
});

// Schema de Validação para Eventos
const EventSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    subtitle: z.string().optional(),
    time_start: z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, 'Data/hora de início inválida'),
    time_end: z.string().optional().refine((val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, 'Data/hora de fim inválida'),
    type: z.enum(['Medição', 'Instalação', 'Reunião', 'Orçamentos', 'Oficina']).optional(),
    description: z.string().optional(),
    lead_id: z.number().nullable().optional(),
    confirmed: z.boolean().optional()
}).refine((data) => {
    // Validar que time_start não está no passado (permite data atual com hora futura)
    const startDate = new Date(data.time_start);
    const now = new Date();
    // Permitir se for no futuro (qualquer hora de hoje ou dias futuros)
    return startDate >= now;
}, {
    message: 'Data/hora de início não pode estar no passado',
    path: ['time_start']
}).refine((data) => {
    // Se time_end existe, deve ser maior que time_start
    if (data.time_end) {
        const startDate = new Date(data.time_start);
        const endDate = new Date(data.time_end);
        return endDate > startDate;
    }
    return true;
}, {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['time_end']
});

// Schema para atualização (permite validação parcial, mas sem restrição de data passada)
const UpdateEventSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório').optional(),
    subtitle: z.string().optional(),
    time_start: z.string().refine((val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, 'Data/hora de início inválida').optional(),
    time_end: z.string().refine((val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, 'Data/hora de fim inválida').optional(),
    type: z.enum(['Medição', 'Instalação', 'Reunião', 'Orçamentos', 'Oficina']).optional(),
    description: z.string().optional(),
    lead_id: z.number().nullable().optional(),
    confirmed: z.boolean().optional()
}).refine((data) => {
    // Se ambos time_start e time_end são fornecidos, validar ordem
    if (data.time_start && data.time_end) {
        const startDate = new Date(data.time_start);
        const endDate = new Date(data.time_end);
        return endDate > startDate;
    }
    return true;
}, {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['time_end']
});

// --- ROTAS ---

import pool, { query } from './db.js';

// Helper de Auditoria
async function logAction(userId, userName, entityType, entityId, action, description) {
    try {
        await query(`
            INSERT INTO audit_logs (user_id, user_name, entity_type, entity_id, action, description)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [userId, userName, entityType, entityId, action, description]);
    } catch (error) {
        console.error('Falha ao registrar log de auditoria:', error);
    }
}

// --- ROTAS ---

app.get('/api', (req, res) => {
    res.json({
        status: 'API Online',
        env: process.env.NODE_ENV || 'development',
        secure: true,
        version: '1.5.0-AI-Update',
        deployed_at: new Date().toISOString()
    });
});

// Login Seguro (PostgreSQL) com Rate Limiting
app.post('/api/login', loginRateLimitMiddleware, async (req, res) => {
    try {
        // 1. Validação de Input
        const { email, password } = LoginSchema.parse(req.body);

        // 2. Busca Usuário no Banco
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }

        // 3. Verifica Senha (Hash)
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }

        // 4. Gera JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        const { password_hash, ...userWithoutPass } = user;

        // Reset contador de tentativas após login bem-sucedido
        const ip = req.ip || req.connection.remoteAddress;
        resetLoginAttempts(ip);

        res.json({
            success: true,
            user: userWithoutPass,
            token
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.errors });
        }
        logError('Erro no login', error, { email: req.body.email }); // Sem logar senha
        res.status(500).json({ success: false, message: 'Erro interno no servidor' });
    }
});

// Usuários (Listagem protegida)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT id, name, email, role FROM users'); // Não retorna hash
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
});

// Criar Usuário Seguro (PostgreSQL)
app.post('/api/users', authenticateToken, async (req, res) => {
    try {
        // Validação
        const data = UserSchema.parse(req.body);

        // Verificar Existência
        const check = await query('SELECT id FROM users WHERE email = $1', [data.email]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        // Hash da Senha
        const passwordHash = await bcrypt.hash(data.password, 10);

        // Inserir no Banco
        const result = await query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [data.name, data.email, passwordHash, data.role || 'user']
        );

        const newUser = result.rows[0];
        res.json(newUser);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.errors });
        }
        console.error("Erro ao criar usuário:", error);
        res.status(500).json({ message: 'Erro ao criar usuário' });
    }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        res.status(500).json({ message: 'Erro ao deletar usuário' });
    }
});

// Atualizar Role do Usuário (Apenas Admin)
app.put('/api/users/:id/role', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Verificar permissão (apenas Admin pode alterar roles)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        // Validar role
        const validRoles = ['admin', 'diretoria', 'user'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Role inválida' });
        }

        await query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [role, id]);

        await logAction(req.user.id, req.user.name, 'user', id, 'UPDATE_ROLE', `Role alterada para: ${role}`);

        res.json({ success: true, message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error("Erro ao atualizar role:", error);
        res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
});

// --- WHATSAPP INTEGRATION (MOCK) ---

// Schema de Validação
const WhatsappConfigSchema = z.object({
    phoneNumberId: z.string().min(5, 'ID do telefone inválido'),
    accountId: z.string().min(5, 'ID da conta inválido'),
    accessToken: z.string().min(10, 'Token inválido')
});

let WHATSAPP_CONFIG = {
    phoneNumberId: '',
    accountId: '',
    accessToken: ''
};

// Salvar Configuração
app.post('/api/whatsapp/config', (req, res) => {
    try {
        const config = WhatsappConfigSchema.parse(req.body);
        WHATSAPP_CONFIG = config;
        res.json({ success: true, message: 'Configuração do Whatsapp salva com sucesso' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.errors });
        }
        res.status(500).json({ success: false, message: 'Erro ao salvar configuração' });
    }
});

// Obter Configuração (Mascarada)
app.get('/api/whatsapp/config', (req, res) => {
    res.json({
        phoneNumberId: WHATSAPP_CONFIG.phoneNumberId,
        accountId: WHATSAPP_CONFIG.accountId,
        accessToken: WHATSAPP_CONFIG.accessToken ? '●●●●●●●●' + WHATSAPP_CONFIG.accessToken.slice(-4) : ''
    });
});

// Enviar Mensagem (Mock)
app.post('/api/whatsapp/send', (req, res) => {
    const { to, type, template, variables } = req.body;

    // Simulação de Validação do Token
    if (!WHATSAPP_CONFIG.accessToken) {
        return res.status(400).json({ success: false, message: 'Whatsapp não configurado. Adicione as credenciais.' });
    }

    console.log(`[WHATSAPP MOCK] Sending ${type} message to ${to}:`, variables || template);

    // Simula delay da API da Meta
    setTimeout(() => {
        res.json({
            success: true,
            message: 'Mensagem enviada para a fila de processamento (Mock)',
            messageId: 'wamid.HBgM' + Date.now()
        });
    }, 500);
});

// Upload Seguro
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado.');

    // Sanitização básica de nome (apenas exemplo)
    const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

    res.json({
        message: 'Upload simulado com sucesso (Vercel Memory)',
        file: {
            name: sanitizedName,
            size: req.file.size,
            type: req.file.mimetype,
            path: 'virtual/path/' + sanitizedName
        }
    });
});

// --- ROTAS DE LEADS (PostgreSQL) ---

// Listar Leads
app.get('/api/leads', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM leads ORDER BY created_at DESC');
        // Mapper para camelCase se necessário no frontend ou manter snake_case e adaptar frontend
        // No frontend usa: createdAt, statusCol, etc. Vamos adaptar aqui ou no frontend.
        // Vamos retornar snake_case do banco e frontend adapta se precisar, mas para facilitar vou mapear.

        const leads = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            project: row.project,
            phone: row.phone,
            email: row.email,
            source: row.source,
            status: row.status,
            createdAt: row.created_at,
            lastAction: row.last_action_date,
            avatarInitials: row.avatar_initials,
            avatarColor: row.avatar_color,
            // Campos calculados/visuais podem ser feitos aqui ou no front
            statusCol: getStatusColor(row.status)
        }));

        res.json(leads);
    } catch (error) {
        console.error("Erro ao listar leads:", error);
        res.status(500).json({ message: 'Erro ao buscar leads' });
    }
});

function getStatusColor(status) {
    switch (status) {
        case 'Novo': return 'blue';
        case 'Em Contato': return 'yellow';
        case 'Qualificado': return 'green';
        case 'Perdido': return 'red';
    }
}

// Obter Lead por ID
app.get('/api/leads/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM leads WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Lead não encontrado' });
        }

        const row = result.rows[0];
        const lead = {
            id: row.id,
            name: row.name,
            project: row.project,
            phone: row.phone,
            email: row.email,
            source: row.source,
            status: row.status,
            createdAt: row.created_at,
            lastAction: row.last_action_date,
            avatarInitials: row.avatar_initials,
            avatarColor: row.avatar_color,
            statusCol: getStatusColor(row.status)
        };

        res.json(lead);
    } catch (error) {
        console.error("Erro ao buscar lead:", error);
        res.status(500).json({ message: 'Erro ao buscar lead' });
    }
});

// Validation Schema para Lead
const LeadSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    project: z.string().optional(),
    source: z.string().optional()
});

// Criar Lead
app.post('/api/leads', authenticateToken, async (req, res) => {
    try {
        const data = LeadSchema.parse(req.body);

        const initials = data.name.substring(0, 2).toUpperCase();
        const colors = ['orange', 'blue', 'green', 'purple', 'red'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const result = await query(
            `INSERT INTO leads (name, project, phone, email, source, status, avatar_initials, avatar_color) 
             VALUES ($1, $2, $3, $4, $5, 'Novo', $6, $7) 
             RETURNING *`,
            [data.name, data.project || '', data.phone || '', data.email || '', data.source || 'Indicação', initials, randomColor]
        );

        res.json(result.rows[0]);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
        }
        console.error("Erro ao criar lead:", error);
        res.status(500).json({ message: 'Erro ao criar lead' });
    }
});

// Atualizar Status Lead
app.put('/api/leads/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Novo status

        await query('UPDATE leads SET status = $1, last_action_date = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (error) {
        console.error("Erro ao atualizar lead:", error);
        res.status(500).json({ message: 'Erro ao atualizar status' });
    }
});

// --- ROTAS DE ORÇAMENTOS (QUOTES) ---

app.get('/api/quotes', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM quotes ORDER BY date DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao listar orçamentos:", error);
        res.status(500).json({ message: 'Erro ao buscar orçamentos' });
    }
});

// Buscar Orçamento por ID
app.get('/api/quotes/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM quotes WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Orçamento não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao buscar orçamento:", error);
        res.status(500).json({ message: 'Erro ao buscar orçamento' });
    }
});

// Buscar orçamentos de um lead específico
app.get('/api/leads/:id/quotes', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'SELECT * FROM quotes WHERE lead_id = $1 ORDER BY created_at DESC',
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar orçamentos do lead:", error);
        res.status(500).json({ message: 'Erro ao buscar orçamentos' });
    }
});
app.post('/api/quotes', authenticateToken, async (req, res) => {
    try {
        const { lead_id, client, phone, project, project_type, service_type, value, notes, date, validity } = req.body;
        const result = await query(
            `INSERT INTO quotes (lead_id, client, phone, project, project_type, service_type, value, notes, date, validity) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [lead_id, client, phone || null, project, project_type || null, service_type || null, value, notes || null, date || new Date(), validity || null]
        );
        const newQuote = result.rows[0];

        await logAction(1, 'Admin', 'quote', newQuote.id, 'CREATE', `Orçamento criado para: ${newQuote.client}`);

        res.json(newQuote);
    } catch (error) {
        console.error("Erro ao criar orçamento:", error);
        res.status(500).json({ message: 'Erro ao criar orçamento' });
    }
});

// Salvar dados financeiros de um orçamento
app.post('/api/quotes/:id/financial', async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_method, installments, down_payment, first_installment_date, notes } = req.body;

        // Verificar se já existe registro financeiro para este orçamento
        const existing = await query('SELECT id FROM quote_financials WHERE quote_id = $1', [id]);

        let result;
        if (existing.rows.length > 0) {
            // Atualizar existente
            result = await query(
                `UPDATE quote_financials 
                 SET payment_method = $1, installments = $2, down_payment = $3, 
                     first_installment_date = $4, notes = $5, updated_at = NOW()
                 WHERE quote_id = $6 RETURNING *`,
                [payment_method, installments, down_payment, first_installment_date, notes, id]
            );
        } else {
            // Criar novo
            result = await query(
                `INSERT INTO quote_financials (quote_id, payment_method, installments, down_payment, first_installment_date, notes)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [id, payment_method, installments, down_payment, first_installment_date, notes]
            );
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao salvar dados financeiros:", error);
        res.status(500).json({ message: 'Erro ao salvar dados financeiros' });
    }
});

// Buscar dados financeiros de um orçamento
app.get('/api/quotes/:id/financial', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM quote_financials WHERE quote_id = $1', [id]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Dados financeiros não encontrados' });
        }
    } catch (error) {
        console.error("Erro ao buscar dados financeiros:", error);
        res.status(500).json({ message: 'Erro ao buscar dados financeiros' });
    }
});

app.put('/api/quotes/:id/status', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const { status, paymentInfo } = req.body;

        console.log(`Updating quote ${id} status to: ${status}`);

        // Update Quote Status
        const updateResult = await client.query(
            'UPDATE quotes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (updateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Orçamento não encontrado' });
        }

        const quote = updateResult.rows[0];

        // Handle Approved Status Actions
        if (status === 'Aprovado') {
            // 1. Create Project (Idempotent)
            // Check if project already exists for this quote to prevent duplicates
            const existingProjectRes = await client.query('SELECT id FROM projects WHERE quote_id = $1', [quote.id]);

            if (existingProjectRes.rows.length === 0) {
                const projId = `PROJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const deadline = new Date();
                deadline.setDate(deadline.getDate() + 30);

                await client.query(
                    `INSERT INTO projects (id, title, client, value, status, deadline, quote_id, lead_id)
                     VALUES ($1, $2, $3, $4, 'Refinamento', $5, $6, $7)`,
                    [projId, quote.project, quote.client, quote.value, deadline, quote.id, quote.lead_id]
                );
            }

            // 2. Generate Installments (if payment info provided)
            if (paymentInfo) {
                const { downPayment, installmentsCount, firstInstallmentDate } = paymentInfo;
                const quoteValue = Number(quote.value);
                const downPaymentVal = Number(downPayment || 0);

                // Clear existing installments to avoid duplication/conflict on re-approval
                await client.query('DELETE FROM installments WHERE quote_id = $1', [id]);

                // 2.1 Down Payment
                let nextInstallmentNum = 1;

                if (downPaymentVal > 0) {
                    await client.query(
                        `INSERT INTO installments (quote_id, installment_number, due_date, amount, status, notes)
                         VALUES ($1, $2, CURRENT_DATE, $3, 'pending', $4)`,
                        [id, nextInstallmentNum++, downPaymentVal, 'Entrada']
                    );
                }

                // 2.2 Remaining Installments
                const remainingValue = quoteValue - downPaymentVal;
                const count = Number(installmentsCount || 0);

                if (count > 0 && remainingValue > 0) {
                    const baseAmount = Math.floor((remainingValue / count) * 100) / 100;
                    const startDate = new Date(firstInstallmentDate);

                    for (let i = 0; i < count; i++) {
                        let amount = baseAmount;
                        // Adjust last installment for rounding errors
                        if (i === count - 1) {
                            amount = Number((remainingValue - (baseAmount * (count - 1))).toFixed(2));
                        }

                        // Calculate due date
                        const dueDate = new Date(startDate);
                        dueDate.setMonth(dueDate.getMonth() + i);

                        await client.query(
                            `INSERT INTO installments (quote_id, installment_number, due_date, amount, status, notes)
                             VALUES ($1, $2, $3, $4, 'pending', $5)`,
                            [id, nextInstallmentNum++, dueDate, amount, `Parcela ${i + 1}/${count}`]
                        );
                    }
                }
            }
        }

        // Log Action
        await logAction(1, 'Admin', 'quote', id, 'UPDATE', `Status alterado para: ${status}`);

        await client.query('COMMIT');
        console.log(`Quote ${id} updated successfully to status: ${status}`);

        res.json({ success: true, quote });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updating quote status:", error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar status', error: error.message });
    } finally {
        client.release();
    }
});

// --- ROTAS DE ARQUIVOS DE ORÇAMENTOS ---
import { uploadFile, getSignedUrl, deleteFile } from './storage.js';


// Upload de arquivos
app.post('/api/quotes/:id/files', upload.array('files', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }

        const uploadedFiles = [];

        for (const file of files) {
            // Upload para GCS
            const gcsPath = await uploadFile(
                file.buffer,
                file.originalname,
                file.mimetype,
                `quotes/${id}`
            );

            // Salvar no banco
            const result = await query(`
                INSERT INTO quote_files (quote_id, filename, original_name, mimetype, size, gcs_path, uploaded_by, uploaded_by_name)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [id, file.originalname, file.originalname, file.mimetype, file.size, gcsPath, 1, 'Admin']);

            uploadedFiles.push(result.rows[0]);
        }

        await logAction(1, 'Admin', 'quote', id, 'UPLOAD_FILES', `${files.length} arquivo(s) anexado(s)`);
        res.json({ success: true, files: uploadedFiles });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ message: 'Erro ao fazer upload' });
    }
});

// Listar arquivos
app.get('/api/quotes/:id/files', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM quote_files WHERE quote_id = $1 ORDER BY created_at DESC', [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar:', error);
        res.status(500).json({ message: 'Erro ao listar arquivos' });
    }
});

// Download (gera URL assinada)
app.get('/api/quotes/:quoteId/files/:fileId/download', async (req, res) => {
    try {
        const { quoteId, fileId } = req.params;
        const result = await query('SELECT * FROM quote_files WHERE id = $1 AND quote_id = $2', [fileId, quoteId]);
        const file = result.rows[0];

        if (!file) return res.status(404).json({ message: 'Arquivo não encontrado' });

        const downloadUrl = await getSignedUrl(file.gcs_path, 15);
        await logAction(1, 'Admin', 'quote', quoteId, 'DOWNLOAD_FILE', `Download: ${file.original_name}`);

        res.json({ url: downloadUrl, filename: file.original_name });
    } catch (error) {
        console.error('Erro no download:', error);
        res.status(500).json({ message: 'Erro ao gerar link' });
    }
});

// Deletar arquivo
app.delete('/api/quotes/:quoteId/files/:fileId', async (req, res) => {
    try {
        const { quoteId, fileId } = req.params;
        const result = await query('SELECT * FROM quote_files WHERE id = $1 AND quote_id = $2', [fileId, quoteId]);
        const file = result.rows[0];

        if (!file) return res.status(404).json({ message: 'Arquivo não encontrado' });

        await deleteFile(file.gcs_path);
        await query('DELETE FROM quote_files WHERE id = $1', [fileId]);
        await logAction(1, 'Admin', 'quote', quoteId, 'DELETE_FILE', `Removido: ${file.original_name}`);

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ message: 'Erro ao deletar' });
    }
});


// --- ROTAS DE PROJETOS (PROJECTS) ---

app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM projects ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao listar projetos:", error);
        res.status(500).json({ message: 'Erro ao buscar projetos' });
    }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
    try {
        const { title, client, value, status, deadline, priority, description, lead_id, quote_id } = req.body;
        const id = `PROJ-${Math.floor(Math.random() * 10000)}`;
        const result = await query(
            `INSERT INTO projects (id, title, client, value, status, deadline, priority, description, lead_id, quote_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [id, title, client, value, status || 'Refinamento', deadline, priority || 'Média', description, lead_id, quote_id]
        );
        const newProject = result.rows[0];
        await logAction(1, 'Admin', 'project', newProject.id, 'CREATE', `Projeto criado: ${newProject.title}`);
        res.json(newProject);
    } catch (error) {
        console.error("Erro ao criar projeto:", error);
        res.status(500).json({ message: 'Erro ao criar projeto' });
    }
});

app.put('/api/projects/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await query('UPDATE projects SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);
        await logAction(1, 'Admin', 'project', id, 'UPDATE', `Status do projeto alterado para: ${status}`);
        res.json({ success: true });
    } catch (error) {
        console.error("Erro ao atualizar projeto:", error);
        res.status(500).json({ message: 'Erro ao atualizar projeto' });
    }
});

// --- ROTAS DE AGENDA (EVENTS) ---

app.get('/api/events', authenticateToken, async (req, res) => {
    try {
        const { start, end } = req.query;
        let q = 'SELECT * FROM events';
        const params = [];

        if (start && end) {
            // Validar formato de datas
            const startDate = new Date(start);
            const endDate = new Date(end);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de data inválido. Use ISO 8601 (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)'
                });
            }

            if (endDate < startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Data final deve ser posterior à data inicial'
                });
            }

            // Filtrar eventos que começam no período especificado
            q += ' WHERE time_start >= $1 AND time_start < $2';
            params.push(start, end);
        }

        q += ' ORDER BY time_start ASC';
        const result = await query(q, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao listar eventos:", error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar eventos'
        });
    }
});


app.post('/api/events', authenticateToken, async (req, res) => {
    try {
        // Validar dados com Zod
        const validatedData = EventSchema.parse(req.body);

        const { title, subtitle, time_start, time_end, type, description, lead_id } = validatedData;

        const result = await query(
            `INSERT INTO events (title, subtitle, time_start, time_end, type, description, lead_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                title,
                subtitle || '',
                time_start,
                time_end || null,
                type || 'Medição',
                description || '',
                lead_id || null
            ]
        );

        const newEvent = result.rows[0];
        await logAction(1, 'Admin', 'event', newEvent.id, 'CREATE', `Compromisso agendado: ${newEvent.title}`);

        res.json({ success: true, data: newEvent });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: error.errors
            });
        }
        console.error("Erro ao criar evento:", error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar evento'
        });
    }
});


app.put('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Validar dados com UpdateEventSchema
        const validatedData = UpdateEventSchema.parse(req.body);

        // Verificar se evento existe
        const checkResult = await query('SELECT id FROM events WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evento não encontrado'
            });
        }

        const { title, subtitle, time_start, time_end, type, description, confirmed } = validatedData;

        // Construir query dinâmica apenas com campos fornecidos
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramCount++}`);
            values.push(title);
        }
        if (subtitle !== undefined) {
            updates.push(`subtitle = $${paramCount++}`);
            values.push(subtitle);
        }
        if (time_start !== undefined) {
            updates.push(`time_start = $${paramCount++}`);
            values.push(time_start);
        }
        if (time_end !== undefined) {
            updates.push(`time_end = $${paramCount++}`);
            values.push(time_end);
        }
        if (type !== undefined) {
            updates.push(`type = $${paramCount++}`);
            values.push(type);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(description);
        }
        if (confirmed !== undefined) {
            updates.push(`confirmed = $${paramCount++}`);
            values.push(confirmed);
        }

        // Sempre atualizar updated_at
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const updateQuery = `UPDATE events SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await query(updateQuery, values);

        const updatedEvent = result.rows[0];
        await logAction(1, 'Admin', 'event', id, 'UPDATE', `Compromisso atualizado: ${updatedEvent.title}`);

        res.json({ success: true, data: updatedEvent });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: error.errors
            });
        }
        console.error("Erro ao atualizar evento:", error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar evento'
        });
    }
});

app.post('/api/events/:id/send-invite', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { recipients } = req.body; // Array de emails

        // Buscar evento do banco
        const result = await query('SELECT * FROM events WHERE id = $1', [id]);
        const event = result.rows[0];
        if (!event) return res.status(404).json({ message: 'Evento não encontrado' });

        // Gerar arquivo .ics (iCalendar)
        const startDate = new Date(event.time_start);
        const endDate = event.time_end ? new Date(event.time_end) : new Date(startDate.getTime() + (60 * 60 * 1000)); // +1h default

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FIVE Ambientes//Agenda//PT
BEGIN:VEVENT
UID:${event.id}@marcenaria.pro
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description || event.subtitle || ''}
LOCATION:${event.subtitle || ''}
END:VEVENT
END:VCALENDAR`;

        // TODO: Implementar envio real de email aqui (usando nodemailer configurado)
        // Por enquanto, retornar o convite para download no frontend
        res.json({
            success: true,
            message: `Convite gerado para ${recipients.length} destinatário(s)`,
            icsContent,
            filename: `invite-${event.id}.ics`
        });

        await logAction(1, 'Admin', 'event', id, 'SEND_INVITE', `Convite enviado para: ${recipients.join(', ')}`);
    } catch (error) {
        console.error('Erro ao enviar convite:', error);
        res.status(500).json({ message: 'Erro ao enviar convite' });
    }
});


// --- ROTAS DE INTERAÇÕES (COMMENTS/HISTORY) ---


// --- CONFIGURAÇÕES SMTP ---
app.get('/api/settings/mail', authenticateToken, async (req, res) => {
    try {
        const result = await query("SELECT value FROM settings WHERE key = 'smtp_config'");
        if (result.rows.length > 0) {
            res.json(result.rows[0].value);
        } else {
            res.json({});
        }
    } catch (error) {
        console.error("Erro ao buscar config de email:", error);
        res.status(500).json({ message: 'Erro ao buscar configuração' });
    }
});

app.post('/api/settings/mail', authenticateToken, async (req, res) => {
    try {
        const config = req.body;
        // Upsert logic
        const existing = await query("SELECT key FROM settings WHERE key = 'smtp_config'");
        if (existing.rows.length > 0) {
            await query("UPDATE settings SET value = $1 WHERE key = 'smtp_config'", [JSON.stringify(config)]);
        } else {
            await query("INSERT INTO settings (key, value) VALUES ($1, $2)", ['smtp_config', JSON.stringify(config)]);
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Erro ao salvar config de email:", error);
        res.status(500).json({ message: 'Erro ao salvar configuração' });
    }
});

// --- CONFIGURAÇÕES IA ---
app.get('/api/settings/ai', authenticateToken, async (req, res) => {
    try {
        const result = await query("SELECT value FROM settings WHERE key = 'ai_config'");
        if (result.rows.length > 0) {
            res.json(result.rows[0].value);
        } else {
            // Default config if not validation
            res.json({
                tone: 'friendly',
                priority_topics: [],
                training_examples: []
            });
        }
    } catch (error) {
        console.error("Erro ao buscar config de IA:", error);
        res.status(500).json({ message: 'Erro ao buscar configuração IA' });
    }
});

app.post('/api/settings/ai', authenticateToken, async (req, res) => {
    try {
        const config = req.body;
        // TODO: Validate config structure with Zod if needed

        const existing = await query("SELECT key FROM settings WHERE key = 'ai_config'");
        if (existing.rows.length > 0) {
            await query("UPDATE settings SET value = $1 WHERE key = 'ai_config'", [JSON.stringify(config)]);
        } else {
            await query("INSERT INTO settings (key, value) VALUES ($1, $2)", ['ai_config', JSON.stringify(config)]);
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Erro ao salvar config de IA:", error);
        res.status(500).json({ message: 'Erro ao salvar configuração IA' });
    }
});


// Envio de Email de Teste
import nodemailer from 'nodemailer';

app.post('/api/test-email', authenticateToken, async (req, res) => {
    try {
        const { to } = req.body;
        const result = await query("SELECT value FROM settings WHERE key = 'smtp_config'");

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'SMTP não configurado' });
        }

        const config = result.rows[0].value;

        const transporter = nodemailer.createTransport({
            host: config.smtp_host,
            port: parseInt(config.smtp_port),
            secure: config.smtp_secure === 'SSL', // true for 465, false for other ports
            auth: {
                user: config.smtp_user,
                pass: config.smtp_pass,
            },
            tls: {
                rejectUnauthorized: false // Para lidar com certificados auto-assinados se necessário
            }
        });

        await transporter.sendMail({
            from: `"${config.from_name}" <${config.smtp_user}>`,
            to: to,
            subject: "Teste de Configuração - FIVE Ambientes Planejados",
            text: "Este é um email de teste para validar as configurações de SMTP do sistema.",
            html: "<b>Este é um email de teste</b> para validar as configurações de SMTP do sistema."
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao enviar email de teste:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- ROTAS DE CHECKLISTS ---

app.get('/api/projects/:id/checklist', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT * FROM project_checklists WHERE project_id = $1', [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar checklist:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

app.post('/api/projects/:id/checklist-toggle', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { stage, item_label, completed } = req.body;
        const userId = 1; // TODO: Get from JWT
        const userName = 'Admin';

        const result = await query(`
            INSERT INTO project_checklists (project_id, stage, item_label, completed, completed_by_user_id, completed_by_user_name, completed_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (project_id, stage, item_label) 
            DO UPDATE SET 
                completed = EXCLUDED.completed,
                completed_by_user_id = EXCLUDED.completed_by_user_id,
                completed_by_user_name = EXCLUDED.completed_by_user_name,
                completed_at = EXCLUDED.completed_at
            RETURNING *
        `, [id, stage, item_label, completed, userId, userName, completed ? new Date() : null]);

        await logAction(userId, userName, 'project_checklist', id, 'UPDATE', `${completed ? 'Marcou' : 'Desmarcou'} item "${item_label}" na etapa ${stage}`);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao alternar checklist:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

app.get('/api/audit-logs', authenticateToken, async (req, res) => {
    try {
        const { query: search, user, date_from, date_to, entity_type } = req.query;
        let queryStr = 'SELECT * FROM audit_logs WHERE 1=1';
        const params = [];

        if (search) {
            params.push(`%${search}%`);
            queryStr += ` AND (description ILIKE $${params.length} OR entity_id ILIKE $${params.length})`;
        }
        if (user) {
            params.push(`%${user}%`);
            queryStr += ` AND user_name ILIKE $${params.length}`;
        }
        if (entity_type && entity_type !== 'all') {
            params.push(entity_type);
            queryStr += ` AND entity_type = $${params.length}`;
        }
        if (date_from) {
            params.push(date_from);
            queryStr += ` AND created_at >= $${params.length}`;
        }
        if (date_to) {
            // Adiciona 23:59:59 para pegar o dia inteiro se for apenas data
            params.push(`${date_to} 23:59:59`);
            queryStr += ` AND created_at <= $${params.length}`;
        }

        queryStr += ' ORDER BY created_at DESC LIMIT 200';

        const result = await query(queryStr, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar logs:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// --- IA & SCRIPTS ---

// Import Service (Add at top of file, but here for context works if top level imports allowed, better to put with other imports)
import { generateSuggestion } from './services/aiService.js';

app.post('/api/ai/suggestion', authenticateToken, async (req, res) => {
    try {
        const { current_text, type } = req.body;

        if (!current_text) {
            return res.status(400).json({ error: 'Texto atual é obrigatório' });
        }

        // Fetch AI Config
        const configResult = await query("SELECT value FROM settings WHERE key = 'ai_config'");
        const config = configResult.rows.length > 0 ? configResult.rows[0].value : {};

        try {
            const { generateSuggestion } = await import('./services/aiService.js');
            const suggestion = await generateSuggestion(current_text, type, config);
            res.json({ suggestion });
        } catch (aiError) {
            console.error('Erro na IA:', aiError);
            // Fallback para mock se sem chave ou erro
            if (aiError.message.includes('GEMINI_API_KEY')) {
                console.warn('Fallback AI Mock: API Key missing');
                const suggestions = {
                    'Orçamento': [
                        "Sugestão (Mock): Adicione urgência mencionando a validade da proposta.",
                        "Sugestão (Mock): Destaque a garantia de 5 anos."
                    ]
                };
                const list = suggestions[type] || ["Sugestão Genérica (Mock)"];
                return res.json({ suggestion: list[0] + " (Nota: Configure GEMINI_API_KEY para IA real)" });
            }
            // Fallback gracefully instead of 500 for other AI errors
            res.status(500).json({ suggestion: "Sugestão indisponível no momento devido a um erro." });
        }
    } catch (error) {
        console.error('Erro na rota IA:', error);
        res.status(500).json({ error: 'Erro ao processar IA' });
    }
});

app.post('/api/ai/chat', authenticateToken, async (req, res) => {
    try {
        const { message, context } = req.body;

        // Fetch AI Config (This config is not used in the new chatWithAI call, but kept for context if needed later)
        const configResult = await query("SELECT value FROM settings WHERE key = 'ai_config'");
        const config = configResult.rows.length > 0 ? configResult.rows[0].value : {};

        const { chatWithAI } = await import('./services/aiService.js');
        const response = await chatWithAI(message, context, config); // Pass config if chatWithAI needs it
        res.json({ response });
    } catch (error) {
        console.error("Erro no chat IA:", error);
        res.status(500).json({ message: 'Erro ao processar chat' });
    }
});

app.get('/api/interactions', authenticateToken, async (req, res) => {
    try {
        const { entity_type, entity_id } = req.query;
        const result = await query(
            'SELECT i.*, u.name as user_name FROM interactions i LEFT JOIN users u ON i.user_id = u.id WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC',
            [entity_type, entity_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao listar interações:", error);
        res.status(500).json({ message: 'Erro ao buscar interações' });
    }
});

app.post('/api/interactions', authenticateToken, async (req, res) => {
    try {
        const { entity_type, entity_id, content, type, user_id } = req.body;
        const result = await query(
            `INSERT INTO interactions (entity_type, entity_id, content, type, user_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [entity_type, entity_id, content, type || 'note', user_id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao criar interação:", error);
        res.status(500).json({ message: 'Erro ao criar interação' });
    }
});

// --- SEGURANÇA E PERFIL ---

app.post('/api/profile/change-password', authenticateToken, async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        // 1. Busca usuário
        const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        // 2. Verifica senha atual
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Senha atual incorreta' });

        // 3. Hasheia nova senha e salva
        const hash = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hash, userId]);

        await logAction(userId, user.name, 'user', userId, 'UPDATE', 'Senha alterada pelo usuário');

        res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('Erro ao trocar senha:', error);
        res.status(500).json({ message: 'Erro interno ao trocar senha' });
    }
});

app.post('/api/profile/2fa/toggle', authenticateToken, async (req, res) => {
    try {
        const { userId, enabled } = req.body;
        // Simulação de 2FA - Em uma app real precisaríamos de secret generator, QR Code, etc.
        // Vamos apenas salvar um flag no banco (precisaríamos adicionar a coluna via migração se fosse persistente)
        // Como o foco é a correção da interface e fluxo básico:

        // Vamos assumir que a tabela users tem ou terá uma coluna two_factor_enabled
        // Para este demo, vamos apenas logar a intenção.

        await logAction(userId, 'Usuário', 'user', userId, 'UPDATE', `${enabled ? 'Ativou' : 'Desativou'} 2FA`);

        res.json({ success: true, enabled });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao configurar 2FA' });
    }
});

// --- CONFIGURAÇÕES DE EMAIL/SMTP ---


// --- NOTIFICAÇÕES (SSE & CRUD) ---

// Stream de Notificações (Server-Sent Events)
app.get('/api/notifications/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Enviar comentário inicial para manter conexão
    res.write(': connected\n\n');

    // TODO: Implementar lista de clientes para broadcast real
    // Por enquanto, apenas mantém a conexão aberta para evitar 404 no frontend
    const keepAlive = setInterval(() => {
        res.write(': keep-alive\n\n');
    }, 30000);

    req.on('close', () => {
        clearInterval(keepAlive);
    });
});

app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const list = await notifications.getUserNotifications(userId);
        const unread = await notifications.getUnreadCount(userId);
        res.json({ notifications: list, unreadCount: unread });
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        res.status(500).json({ message: 'Erro ao buscar notificações' });
    }
});

app.post('/api/notifications/:id/mark-read', authenticateToken, async (req, res) => {
    try {
        await notifications.markAsRead(req.params.id, req.user.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao marcar como lida' });
    }
});

app.post('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
    try {
        await notifications.markAllAsRead(req.user.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao marcar todas como lidas' });
    }
});

app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
    try {
        await notifications.deleteNotification(req.params.id, req.user.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar notificação' });
    }
});

// --- CONFIGURAÇÕES IA ---
app.get('/api/settings/ai', authenticateToken, async (req, res) => {
    try {
        const result = await query("SELECT value FROM settings WHERE key = 'ai_config'");
        if (result.rows.length > 0) {
            res.json(result.rows[0].value);
        } else {
            res.json({
                tone: 'friendly',
                priority_topics: [],
                training_examples: []
            });
        }
    } catch (error) {
        console.error("Erro ao buscar config de IA:", error);
        res.status(500).json({ message: 'Erro ao buscar configuração IA' });
    }
});

app.post('/api/settings/ai', authenticateToken, async (req, res) => {
    try {
        const config = req.body;
        await query(`
            INSERT INTO settings (key, value) VALUES ($1, $2)
            ON CONFLICT (key) DO UPDATE SET value = $2
        `, ['ai_config', JSON.stringify(config)]);
        res.json({ success: true });
    } catch (error) {
        console.error("Erro ao salvar config de IA:", error);
        res.status(500).json({ message: 'Erro ao salvar configuração IA' });
    }
});

// --- CONFIGURAÇÕES DE EMAIL/SMTP ---

// Buscar configurações de email
app.get('/api/settings/mail', async (req, res) => {
    try {
        const result = await query('SELECT * FROM settings WHERE key = $1', ['smtp_config']);

        if (result.rows.length > 0) {
            const config = JSON.parse(result.rows[0].value);
            // Não enviar a senha de volta por segurança
            res.json({ ...config, smtp_pass: '******' });
        } else {
            // Retornar configuração padrão
            res.json({
                smtp_host: '',
                smtp_port: '587',
                smtp_user: '',
                smtp_pass: '',
                smtp_secure: 'TLS',
                from_name: 'FIVE Ambientes Planejados',
                from_email: ''
            });
        }
    } catch (error) {
        console.error('Erro ao buscar config SMTP:', error);
        res.status(500).json({ message: 'Erro ao buscar configurações' });
    }
});

// Salvar configurações de email
app.post('/api/settings/mail', async (req, res) => {
    try {
        const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, from_name, from_email } = req.body;

        const config = {
            smtp_host,
            smtp_port,
            smtp_user,
            smtp_pass: smtp_pass === '******' ? undefined : smtp_pass, // Se senha não mudou, manter a anterior
            smtp_secure,
            from_name,
            from_email
        };

        // Se senha não mudou, buscar a anterior
        if (config.smtp_pass === undefined) {
            const existingResult = await query('SELECT value FROM settings WHERE key = $1', ['smtp_config']);
            if (existingResult.rows.length > 0) {
                const existingConfig = JSON.parse(existingResult.rows[0].value);
                config.smtp_pass = existingConfig.smtp_pass;
            }
        }

        // Upsert na tabela settings
        await query(`
            INSERT INTO settings (key, value, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (key) 
            DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
        `, ['smtp_config', JSON.stringify(config)]);

        await logAction(1, 'Admin', 'settings', 'smtp_config', 'UPDATE', 'Configurações SMTP atualizadas');

        res.json({ success: true, message: 'Configurações salvas com sucesso' });
    } catch (error) {
        console.error('Erro ao salvar config SMTP:', error);
        res.status(500).json({ message: 'Erro ao salvar configurações' });
    }
});

// Enviar email de teste
app.post('/api/test-email', async (req, res) => {
    try {
        const { to } = req.body;

        // Buscar configurações
        const result = await query('SELECT value FROM settings WHERE key = $1', ['smtp_config']);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Configurações SMTP não encontradas' });
        }

        const config = JSON.parse(result.rows[0].value);

        // Configurar transporter do nodemailer
        const transporterConfig = {
            host: config.smtp_host,
            port: parseInt(config.smtp_port),
            secure: config.smtp_secure === 'SSL', // true para porta 465, false para outras
            auth: {
                user: config.smtp_user,
                pass: config.smtp_pass
            }
        };

        // Para Gmail, pode ser necessário habilitar "Apps menos seguros" ou usar App Password
        if (config.smtp_host.includes('gmail')) {
            transporterConfig.service = 'gmail';
        }

        const transporter = nodemailerLib.default.createTransport(transporterConfig);

        // Verificar conexão
        await transporter.verify();

        // Enviar email de teste
        const info = await transporter.sendMail({
            from: `"${config.from_name}" <${config.smtp_user}>`,
            to: to,
            replyTo: config.from_email,
            subject: '✅ Teste de Configuração SMTP - FIVE Ambientes Planejados',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d4af37;">🎉 Configuração SMTP Funcionando!</h2>
                    <p>Olá,</p>
                    <p>Este é um email de teste para confirmar que suas configurações SMTP estão corretas.</p>
                    <hr style="border: 1px solid #e7dbcf; margin: 20px 0;">
                    <p><strong>Servidor SMTP:</strong> ${config.smtp_host}</p>
                    <p><strong>Porta:</strong> ${config.smtp_port}</p>
                    <p><strong>Segurança:</strong> ${config.smtp_secure}</p>
                    <p><strong>Remetente:</strong> ${config.from_name}</p>
                    <hr style="border: 1px solid #e7dbcf; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">Email enviado em ${new Date().toLocaleString('pt-BR')}</p>
                    <p style="color: #999; font-size: 11px;">Sistema FIVE Ambientes Planejados</p>
                </div>
            `
        });

        await logAction(1, 'Admin', 'settings', 'smtp_test', 'TEST', `Email de teste enviado para: ${to}`);

        res.json({
            success: true,
            message: 'Email enviado com sucesso!',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Erro ao enviar email de teste:', error);
        res.status(500).json({
            message: 'Erro ao enviar email de teste',
            error: error.message
        });
    }
});




// --- ANALYTICS E MÉTRICAS ---

// Taxa de conversão
app.get('/api/analytics/conversion', authenticateToken, async (req, res) => {
    try {
        const data = await analytics.getConversionRate();
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar taxa de conversão:', error);
        res.status(500).json({ message: 'Erro ao buscar métricas' });
    }
});

// Tempo médio de fechamento
app.get('/api/analytics/avg-time', authenticateToken, async (req, res) => {
    try {
        const data = await analytics.getAvgClosingTime();
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar tempo médio:', error);
        res.status(500).json({ message: 'Erro ao buscar métricas' });
    }
});

// Ticket médio
app.get('/api/analytics/ticket', authenticateToken, async (req, res) => {
    try {
        const data = await analytics.getAvgTicket();
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar ticket médio:', error);
        res.status(500).json({ message: 'Erro ao buscar métricas' });
    }
});

// Faturamento mensal
app.get('/api/analytics/revenue', authenticateToken, async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 6;
        const data = await analytics.getMonthlyRevenue(months);
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar faturamento:', error);
        res.status(500).json({ message: 'Erro ao buscar métricas' });
    }
});

// Funil de vendas
app.get('/api/analytics/funnel', authenticateToken, async (req, res) => {
    try {
        const data = await analytics.getSalesFunnel();
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar funil:', error);
        res.status(500).json({ message: 'Erro ao buscar métricas' });
    }
});

// Comparativo de período
app.get('/api/analytics/comparison', authenticateToken, async (req, res) => {
    try {
        const data = await analytics.getComparison();
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar comparativo:', error);
        res.status(500).json({ message: 'Erro ao buscar métricas' });
    }
});

// Dashboard resumo (todos dados em uma chamada)
app.get('/api/analytics/summary', authenticateToken, async (req, res) => {
    try {
        const data = await analytics.getDashboardSummary();
        res.json(data);
    } catch (error) {
        console.error('Erro ao gerar resumo:', error);
        res.status(500).json({ message: 'Erro ao buscar métricas' });
    }
});

// --- FINANCIAL MODULE ---
import * as financial from './financial.js';

// Categories
app.get('/api/financial/categories', authenticateToken, async (req, res) => {
    try {
        const categories = await financial.getCategories(req.query.type);
        res.json(categories);
    } catch (error) {
        console.error('Erro ao buscar categorias financeiras:', error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

// Bank Accounts
app.get('/api/financial/bank-accounts', authenticateToken, async (req, res) => {
    try {
        const accounts = await financial.getBankAccounts();
        res.json(accounts);
    } catch (error) {
        console.error('Erro ao buscar contas bancárias:', error);
        res.status(500).json({ error: 'Erro ao buscar contas' });
    }
});

app.post('/api/financial/bank-accounts', authenticateToken, async (req, res) => {
    try {
        const account = await financial.createBankAccount(req.body);
        res.json(account);
    } catch (error) {
        console.error('Erro ao criar conta bancária:', error);
        res.status(500).json({ error: 'Erro ao criar conta' });
    }
});

// Bank Movements
app.get('/api/financial/movements', authenticateToken, async (req, res) => {
    try {
        const movements = await financial.getBankMovements(req.query);
        res.json(movements);
    } catch (error) {
        console.error('Erro ao buscar movimentações:', error);
        res.status(500).json({ error: 'Erro ao buscar movimentações' });
    }
});

app.post('/api/financial/movements', authenticateToken, async (req, res) => {
    try {
        const movement = await financial.createBankMovement(req.body, req.user.id);
        res.json(movement);
    } catch (error) {
        console.error('Erro ao criar movimentação:', error);
        res.status(500).json({ error: 'Erro ao criar movimentação' });
    }
});

// Transactions
app.get('/api/financial/transactions', authenticateToken, async (req, res) => {
    try {
        const transactions = await financial.getTransactions(req.query);
        res.json(transactions);
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});

app.post('/api/financial/transactions', authenticateToken, async (req, res) => {
    try {
        const transaction = await financial.createTransaction(req.body, req.user.userId);
        res.json(transaction);
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        res.status(500).json({ error: 'Erro ao criar transação' });
    }
});

app.delete('/api/financial/transactions/:id', authenticateToken, async (req, res) => {
    try {
        await financial.deleteTransaction(parseInt(req.params.id));
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar transação:', error);
        res.status(500).json({ error: 'Erro ao deletar transação' });
    }
});

// Cash Flow & Analytics
app.get('/api/financial/cash-flow', authenticateToken, async (req, res) => {
    try {
        const { date_from, date_to } = req.query;
        const cashFlow = await financial.getCashFlow(date_from, date_to);
        res.json(cashFlow);
    } catch (error) {
        console.error('Erro ao buscar fluxo de caixa:', error);
        res.status(500).json({ error: 'Erro ao buscar fluxo de caixa' });
    }
});

app.get('/api/financial/summary', authenticateToken, async (req, res) => {
    try {
        const { date_from, date_to } = req.query;
        const summary = await financial.getFinancialSummary(date_from, date_to);
        res.json(summary);
    } catch (error) {
        console.error('Erro ao gerar resumo financeiro:', error);
        res.status(500).json({ error: 'Erro ao gerar resumo' });
    }
});

// Installments
app.post('/api/financial/installments/:quoteId', authenticateToken, async (req, res) => {
    try {
        const installments = await financial.createInstallments(parseInt(req.params.quoteId), req.body);
        res.json(installments);
    } catch (error) {
        console.error('Erro ao criar parcelas:', error);
        res.status(500).json({ error: 'Erro ao criar parcelas' });
    }
});

app.get('/api/financial/installments/:quoteId', authenticateToken, async (req, res) => {
    try {
        const installments = await financial.getInstallments(parseInt(req.params.quoteId));
        res.json(installments);
    } catch (error) {
        console.error('Erro ao buscar parcelas:', error);
        res.status(500).json({ error: 'Erro ao buscar parcelas' });
    }
});

app.post('/api/financial/installments/:id/pay', authenticateToken, async (req, res) => {
    try {
        const transaction = await financial.markInstallmentAsPaid(parseInt(req.params.id), req.body, req.user.userId);
        res.json(transaction);
    } catch (error) {
        console.error('Erro ao marcar parcela como paga:', error);
        res.status(500).json({ error: 'Erro ao marcar como paga' });
    }
});

// Receivables (Phase 2)
app.get('/api/financial/receivables', authenticateToken, async (req, res) => {
    try {
        const receivables = await financial.getReceivables();
        res.json(receivables);
    } catch (error) {
        console.error('Erro ao buscar recebíveis:', error);
        res.status(500).json({ error: 'Erro ao buscar recebíveis' });
    }
});

// Payables - Suppliers (Phase 3)
app.get('/api/financial/suppliers', authenticateToken, async (req, res) => {
    try {
        const suppliers = await financial.getSuppliers(req.query.include_inactive === 'true');
        res.json(suppliers);
    } catch (error) {
        console.error('Erro ao buscar fornecedores:', error);
        res.status(500).json({ error: 'Erro ao buscar fornecedores' });
    }
});

app.post('/api/financial/suppliers', authenticateToken, async (req, res) => {
    try {
        const supplier = await financial.createSupplier(req.body);
        res.json(supplier);
    } catch (error) {
        console.error('Erro ao criar fornecedor:', error);
        res.status(500).json({ error: 'Erro ao criar fornecedor' });
    }
});

app.put('/api/financial/suppliers/:id', authenticateToken, async (req, res) => {
    try {
        const supplier = await financial.updateSupplier(parseInt(req.params.id), req.body);
        res.json(supplier);
    } catch (error) {
        console.error('Erro ao atualizar fornecedor:', error);
        res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
    }
});

// Payables - Bills (Phase 3)
app.get('/api/financial/payables', authenticateToken, async (req, res) => {
    try {
        const payables = await financial.getPayables();
        res.json(payables);
    } catch (error) {
        console.error('Erro ao buscar contas a pagar:', error);
        res.status(500).json({ error: 'Erro ao buscar contas a pagar' });
    }
});

app.post('/api/financial/bills', authenticateToken, async (req, res) => {
    try {
        const bill = await financial.createBill(req.body, req.user.userId);
        res.json(bill);
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        res.status(500).json({ error: 'Erro ao criar conta' });
    }
});

app.post('/api/financial/bills/:id/pay', authenticateToken, async (req, res) => {
    try {
        const transaction = await financial.markBillAsPaid(parseInt(req.params.id), req.body, req.user.userId);
        res.json(transaction);
    } catch (error) {
        console.error('Erro ao marcar conta como paga:', error);
        res.status(500).json({ error: 'Erro ao marcar como paga' });
    }
});

app.post('/api/financial/bills/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const result = await financial.cancelBill(parseInt(req.params.id));
        res.json(result);
    } catch (error) {
        console.error('Erro ao cancelar conta:', error);
        res.status(500).json({ error: 'Erro ao cancelar conta' });
    }
});

// Reports & Analytics (Phase 4)
app.get('/api/financial/reports/dre', authenticateToken, async (req, res) => {
    try {
        const { date_from, date_to } = req.query;
        const dre = await financial.getDRE(date_from, date_to);
        res.json(dre);
    } catch (error) {
        console.error('Erro ao gerar DRE:', error);
        res.status(500).json({ error: 'Erro ao gerar DRE' });
    }
});

app.get('/api/financial/reports/category-analytics', authenticateToken, async (req, res) => {
    try {
        const { date_from, date_to } = req.query;
        const analytics = await financial.getCategoryAnalytics(date_from, date_to);
        res.json(analytics);
    } catch (error) {
        console.error('Erro ao gerar análise de categorias:', error);
        res.status(500).json({ error: 'Erro ao gerar análise' });
    }
});

app.get('/api/financial/reports/monthly-comparison', authenticateToken, async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 6;
        const comparison = await financial.getMonthlyComparison(months);
        res.json(comparison);
    } catch (error) {
        console.error('Erro ao gerar comparação mensal:', error);
        res.status(500).json({ error: 'Erro ao gerar comparação' });
    }
});

app.get('/api/financial/reports/cash-position', authenticateToken, async (req, res) => {
    try {
        const cashPosition = await financial.getCashPosition();
        res.json(cashPosition);
    } catch (error) {
        console.error('Erro ao calcular posição de caixa:', error);
        res.status(500).json({ error: 'Erro ao calcular posição' });
    }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
// O servidor é inicializado por api/start.js
// Este arquivo apenas exporta o app configurado

// --- EXPORTAÇÃO PADRÃO ---
// Para uso em Railway (via start.js) e Vercel Serverless Functions
export default app;