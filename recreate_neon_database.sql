-- ====================================
-- SCRIPT COMPLETO PARA RECRIAR BANCO NO NEON.TECH
-- Sistema: Gestão de Marcenaria
-- Data: 2026-01-21
-- ====================================

-- IMPORTANTE: Execute este script em ordem!
-- Conexão: psql "postgresql://user:pass@host/db?sslmode=require" -f recreate_neon_database.sql

BEGIN;

-- ====================================
-- 1. TABELA DE USUÁRIOS (USERS)
-- ====================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- 2. TABELA DE LEADS
-- ====================================
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    project VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    source VARCHAR(50) DEFAULT 'Indicação',
    status VARCHAR(50) DEFAULT 'Novo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avatar_initials VARCHAR(5),
    avatar_color VARCHAR(20)
);

-- ====================================
-- 3. TABELA DE ORÇAMENTOS (QUOTES)
-- ====================================
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    client VARCHAR(255) NOT NULL,
    project VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    value DECIMAL(15, 2) DEFAULT 0.00,
    date DATE DEFAULT CURRENT_DATE,
    validity DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- 4. TABELA DE DADOS FINANCEIROS DOS ORÇAMENTOS
-- ====================================
CREATE TABLE IF NOT EXISTS quote_financials (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    installments INTEGER DEFAULT 1,
    down_payment DECIMAL(15, 2) DEFAULT 0.00,
    first_installment_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quote_id)
);

-- ====================================
-- 5. TABELA DE ARQUIVOS DE ORÇAMENTOS
-- ====================================
CREATE TABLE IF NOT EXISTS quote_files (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- 6. TABELA DE PROJETOS (KANBAN)
-- ====================================
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    value DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Refinamento',
    deadline DATE,
    priority VARCHAR(20) DEFAULT 'Média',
    responsible VARCHAR(255),
    description TEXT,
    start_date DATE,
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    quote_id INTEGER REFERENCES quotes(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- 7. TABELA DE CHECKLISTS DE PROJETOS
-- ====================================
CREATE TABLE IF NOT EXISTS project_checklists (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- 8. TABELA DE AGENDA (EVENTS)
-- ====================================
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    time_start TIMESTAMP NOT NULL,
    time_end TIMESTAMP,
    type VARCHAR(50) NOT NULL,
    confirmed BOOLEAN DEFAULT FALSE,
    description TEXT,
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- 9. TABELA DE INTERAÇÕES/COMENTÁRIOS
-- ====================================
CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,  -- 'lead', 'quote', 'project'
    entity_id VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'note',  -- 'note', 'call', 'email'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- 10. TABELA DE NOTIFICAÇÕES
-- ====================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- 11. TABELA DE CONFIGURAÇÕES DO SISTEMA
-- ====================================
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- 12. TABELA DE LOG DE AUDITORIA
-- ====================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ====================================

-- Índices para LEADS
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Índices para QUOTES
CREATE INDEX IF NOT EXISTS idx_quotes_lead_id ON quotes(lead_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date DESC);

-- Índices para PROJECTS
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_quote_id ON projects(quote_id);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);

-- Índices para EVENTS
CREATE INDEX IF NOT EXISTS idx_events_time_start ON events(time_start);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_lead_id ON events(lead_id);

-- Índices para INTERACTIONS
CREATE INDEX IF NOT EXISTS idx_interactions_entity ON interactions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at DESC);

-- Índices para AUDIT_LOGS
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

COMMIT;

-- ====================================
-- INSERIR DADOS INICIAIS
-- ====================================
BEGIN;

-- Usuário Admin (senha: 123)
-- Hash bcrypt para '123': $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO users (name, email, password_hash, role)
VALUES ('Administrador', 'admin@marcenaria.pro', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Configurações iniciais
INSERT INTO settings (key, value) VALUES ('business_name', 'Marcenaria Pro') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('business_phone', '(11) 99999-9999') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('business_email', 'contato@marcenaria.pro') ON CONFLICT (key) DO NOTHING;

COMMIT;

-- ====================================
-- VERIFICAR CRIAÇÃO DAS TABELAS
-- ====================================
SELECT 
    schemaname,
    tablename,
    (SELECT count(*) FROM pg_catalog.pg_class c 
     WHERE c.relname = t.tablename) as exists
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- FIM DO SCRIPT
-- Executado com sucesso? Verificar saída acima.
-- Todas as tabelas devem aparecer listadas.
