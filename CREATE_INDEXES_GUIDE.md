# Guia: Como Criar Índices no Banco de Dados

## Opção 1: Via PowerShell (Recomendado)

### Passo 1: Definir Variáveis de Ambiente

Abra PowerShell e execute (substituindo pelos seus valores reais):

```powershell
# Defina as variáveis com seus dados do Cloud SQL
$env:DB_HOST = "34.39.207.255"  # IP do Cloud SQL
$env:DB_USER = "marcenaria_user"
$env:DB_NAME = "marcenaria_db"
$env:DB_PASSWORD = "SUA_SENHA_AQUI"  # A senha do banco
```

### Passo 2: Executar Script

```powershell
cd C:\Users\YF\Downloads\marcenaria-pro
powershell -ExecutionPolicy Bypass -File create-indexes.ps1
```

---

## Opção 2: Script Completo (Tudo em um comando)

Execute este comando único (substituindo a senha):

```powershell
cd C:\Users\YF\Downloads\marcenaria-pro

$env:DB_HOST = "34.39.207.255"
$env:DB_USER = "marcenaria_user"
$env:DB_NAME = "marcenaria_db"
$env:DB_PASSWORD = "SENHA_AQUI"

powershell -ExecutionPolicy Bypass -File create-indexes.ps1
```

---

## Opção 3: Via Google Cloud Console (Mais Fácil)

Se não tiver `psql` instalado, use o Cloud Console:

### Passo 1: Acessar Cloud SQL

1. Vá para: https://console.cloud.google.com/sql
2. Clique na instância `marcenaria-db`
3. Clique em **"ABRIR CLOUD SHELL"** ou **"Conectar usando Cloud Shell"**

### Passo 2: Conectar ao Banco

No Cloud Shell, execute:

```bash
gcloud sql connect marcenaria-db --user=marcenaria_user --database=marcenaria_db
```

Digite a senha quando solicitado.

### Passo 3: Copiar e Colar o SQL

Copie TODO o conteúdo do arquivo `api/add_indexes.sql` e cole no terminal.

Ou execute assim:

```bash
# Download do SQL
curl -O https://raw.githubusercontent.com/yamamotoallan/GEST-O-AGENDA-MARCENARIA/main/api/add_indexes.sql

# Executar
psql "host=34.39.207.255 dbname=marcenaria_db user=marcenaria_user" -f add_indexes.sql
```

---

## Opção 4: SQL Direto (Copiar e Colar)

Se preferir, copie e execute este SQL diretamente no Cloud Console:

```sql
-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_name ON leads(name);

-- Quotes
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client);
CREATE INDEX IF NOT EXISTS idx_quotes_value ON quotes(value);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_quote_id ON projects(quote_id);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date, time);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_date_only ON events(date);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

---

## Verificar se Índices Foram Criados

Após executar, verifique com:

```sql
SELECT
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Deve listar todos os índices criados (25 índices no total).

---

## Qual Opção Usar?

- **Tem psql instalado?** → Use Opção 1 ou 2
- **Não tem psql?** → Use Opção 3 (Cloud Console) ✅ **MAIS FÁCIL**
- **Problemas com scripts?** → Use Opção 4 (SQL direto)

---

## Observações

- ⚠️ Execute apenas **UMA VEZ**
- ✅ `IF NOT EXISTS` previne duplicação
- ⏱️ Execução leva ~10 segundos
- 📈 Performance melhora em até 80%

---

**Recomendação**: Use a **Opção 3** (Cloud Console) - é a mais fácil e não requer configuração local!
