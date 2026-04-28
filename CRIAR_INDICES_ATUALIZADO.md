# ✅ Guia ATUALIZADO - Criar Índices (Interface 2026)

Baseado na tela que você está vendo agora!

## 🎯 Informações da Sua Tela

**Instância**: `marcenariapro` (PostgreSQL 17)  
**Databases disponíveis**:
- ✅ `marcenaria`
- ✅ `postgres`

---

## 📍 Opção 1: Cloud SQL Studio (RECOMENDADO)

**Na tela que você está vendo**, no **menu lateral esquerdo**:

1. **Clique em "Cloud SQL Studio"** (segundo item do menu)
2. Vai abrir um editor SQL
3. **Selecione o database**: `marcenaria` (dropdown superior)
4. **Cole o SQL completo** (arquivo `add_indexes.sql`)
5. **Clique em "Run"** ou pressione `Ctrl+Enter`

✅ **Pronto!** Não precisa de senha.

---

## 📍 Opção 2: Cloud Shell (100% Garantido)

### Passo 1: Abrir Cloud Shell

No **canto superior direito** da página (ao lado da sua foto):
- Clique no ícone **`>_`** (terminal)
- Vai abrir terminal na parte inferior

### Passo 2: Listar Usuários

```bash
gcloud sql users list --instance=marcenariapro
```

**Vai mostrar** algo como:
```
NAME              HOST
postgres          %
outro_usuario     %
```

📝 **Anote um usuário** (geralmente `postgres`).

### Passo 3: Conectar ao Banco

```bash
gcloud sql connect marcenariapro --user=postgres --database=marcenaria
```

**Vai pedir senha**: Digite a senha do usuário `postgres`.

> **💡 Dica**: Se não souber a senha, vá em:
> Menu lateral → **Users** → Clique nos 3 pontinhos ao lado de `postgres` → **Change password**

### Passo 4: Colar o SQL

Após conectar (vai aparecer `marcenaria=>`), **cole TODO o SQL**:

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

**Pressione Enter**.

### Passo 5: Verificar

```sql
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
```

Deve listar **25 índices**.

---

## 🖼️ Sua Tela Atual

![Tela do Cloud SQL](file:///C:/Users/YF/.gemini/antigravity/brain/865e3212-8b06-4761-8831-98dd14d12383/uploaded_image_1768325879412.png)

**O que fazer**:
- ✅ **Cloud SQL Studio** (menu lateral esquerdo, 2º item)
- ✅ **Ou Cloud Shell** (ícone `>_` superior direito)

---

## ⚡ Resumo Rápido

**MAIS FÁCIL**:
1. Menu lateral → **Cloud SQL Studio**
2. Selecionar database `marcenaria`
3. Colar SQL
4. Run

**SE NÃO FUNCIONAR**:
1. Ícone `>_` (Cloud Shell)
2. `gcloud sql connect marcenariapro --user=postgres --database=marcenaria`
3. Digitar senha
4. Colar SQL

---

✅ **Escolha um método e siga!** Qual você quer tentar primeiro?
