-- Índices para Performance - CUSTOMIZADO para estrutura real do banco
-- Baseado na análise das tabelas existentes

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
-- PROJECTS (Projetos) - Estrutura REAL
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_quote_id ON projects(quote_id);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);

-- ============================================
-- EVENTS (Agenda)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

-- ============================================
-- AUDIT LOGS (Auditoria)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- ============================================
-- NOTIFICATIONS (Notificações)
-- ============================================
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
-- INTERACTIONS (Interações)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_interactions_lead_id ON interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at DESC);

-- ============================================
-- PROJECT_CHECKLISTS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_project_checklists_project_id ON project_checklists(project_id);

-- ============================================
-- QUOTE_FILES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_quote_files_quote_id ON quote_files(quote_id);

-- ============================================
-- SETTINGS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- ============================================
-- Verificar índices criados
-- ============================================
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
