-- Script SEGURO de Índices para Performance
-- Cria apenas em tabelas E colunas que EXISTEM
-- Ignora erros silenciosamente

-- ============================================
-- VERIFICAR TABELAS EXISTENTES
-- ============================================
DO $$
BEGIN
    -- Leads
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'source') THEN
            CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'name') THEN
            CREATE INDEX IF NOT EXISTS idx_leads_name ON leads(name);
        END IF;
    END IF;

    -- Quotes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'date') THEN
            CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date DESC);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'client') THEN
            CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'value') THEN
            CREATE INDEX IF NOT EXISTS idx_quotes_value ON quotes(value);
        END IF;
    END IF;

    -- Projects
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'stage') THEN
            CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'lead_id') THEN
            CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'quote_id') THEN
            CREATE INDEX IF NOT EXISTS idx_projects_quote_id ON projects(quote_id);
        END IF;
    END IF;

    -- Events
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'date' AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'time')) THEN
            CREATE INDEX IF NOT EXISTS idx_events_date ON events(date, time);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'type') THEN
            CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'date') THEN
            CREATE INDEX IF NOT EXISTS idx_events_date_only ON events(date);
        END IF;
    END IF;

    -- Audit Logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id' AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'action')) THEN
            CREATE INDEX IF NOT EXISTS idx_audit_user_action ON audit_logs(user_id, action);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'timestamp') THEN
            CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'entity_type' AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'entity_id')) THEN
            CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
            CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
        END IF;
    END IF;

    -- Notifications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') THEN
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read') THEN
            CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id' AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read')) THEN
            CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
        END IF;
    END IF;

    -- Users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
            CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        END IF;
    END IF;

    RAISE NOTICE 'Índices criados com sucesso!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar índices: %', SQLERRM;
END $$;

-- Verificar índices criados
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
