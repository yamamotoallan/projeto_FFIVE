-- Verificar estrutura de TODAS as tabelas principais
-- Execute este SQL e me mostre TODO o resultado

-- LEADS
SELECT 'LEADS' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'leads'
UNION ALL

-- QUOTES
SELECT 'QUOTES' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'quotes'
UNION ALL

-- PROJECTS
SELECT 'PROJECTS' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'projects'
UNION ALL

-- EVENTS
SELECT 'EVENTS' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'events'
UNION ALL

-- AUDIT_LOGS
SELECT 'AUDIT_LOGS' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'audit_logs'
UNION ALL

-- NOTIFICATIONS
SELECT 'NOTIFICATIONS' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'notifications'
UNION ALL

-- USERS
SELECT 'USERS' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
UNION ALL

-- INTERACTIONS
SELECT 'INTERACTIONS' as tabela, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'interactions'

ORDER BY tabela, column_name;
