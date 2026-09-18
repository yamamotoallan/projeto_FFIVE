-- SQL MÍNIMO - Apenas índices BÁSICOS que CERTAMENTE existem
-- Este SQL vai funcionar porque usa apenas id, created_at, updated_at

-- LEADS - Índices básicos
CREATE INDEX IF NOT EXISTS idx_leads_id ON leads(id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- QUOTES - Índices básicos  
CREATE INDEX IF NOT EXISTS idx_quotes_id ON quotes(id);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);

-- PROJECTS - Índices básicos
CREATE INDEX IF NOT EXISTS idx_projects_id ON projects(id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- EVENTS - Índices básicos
CREATE INDEX IF NOT EXISTS idx_events_id ON events(id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- AUDIT_LOGS - Índices básicos
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(timestamp DESC);

-- NOTIFICATIONS - Índices básicos
CREATE INDEX IF NOT EXISTS idx_notifications_id ON notifications(id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- USERS - Índices básicos
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- INTERACTIONS - Índices básicos
CREATE INDEX IF NOT EXISTS idx_interactions_id ON interactions(id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at DESC);

-- Verificar índices criados
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
