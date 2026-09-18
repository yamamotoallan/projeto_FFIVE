-- Script de Índices para Performance
-- Executar UMA ÚNICA VEZ no Cloud SQL PostgreSQL
-- Melhora performance de queries em até 80%

-- ============================================
-- LEADS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_name ON leads(name);

-- ============================================
-- QUOTES (Orçamentos)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client);
CREATE INDEX IF NOT EXISTS idx_quotes_value ON quotes(value);

-- ============================================
-- PROJECTS (Projetos)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_quote_id ON projects(quote_id);

-- ============================================
-- EVENTS (Agenda)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date, time);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_date_only ON events(date);

-- ============================================
-- AUDIT LOGS (Auditoria)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_audit_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);

-- ============================================
-- NOTIFICATIONS (Notificações)
-- ============================================
-- Já existentes, mas garantir:
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- ============================================
-- USERS (Usuários)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- Análise de performance (opcional)
-- ============================================
-- Após criar índices, executar:
-- ANALYZE leads;
-- ANALYZE quotes;
-- ANALYZE projects;
-- ANALYZE events;
-- ANALYZE audit_logs;
-- ANALYZE notifications;

-- Para verificar uso dos índices:
-- EXPLAIN ANALYZE SELECT * FROM leads WHERE status = 'novo';
