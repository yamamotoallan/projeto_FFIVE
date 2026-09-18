# 🔍 Como Descobrir Configurações do Seu Banco de Dados

## Status Atual

Baseado nos documentos do projeto, suas configurações são:

- **IP do Banco**: `34.39.207.255`
- **Usuário**: `marcenaria_user` ou `postgres`
- **Banco de Dados**: `marcenaria_db` ou `marcenaria`
- **Porta**: `5432`

**Problema**: Nome da instância Cloud SQL não está documentado.

---

## ✅ Solução: Descobrir Nome da Instância

### Opção 1: Via Cloud Console (MAIS FÁCIL)

1. **Acesse**: https://console.cloud.google.com/sql
2. **Login** com sua conta Google que tem acesso ao projeto
3. **Você verá** a lista de instâncias PostgreSQL
4. **Anote o nome** na coluna "Instance ID"

![Exemplo Cloud SQL Console](https://cloud.google.com/sql/images/postgres-instance-list.png)

---

### Opção 2: Verificar Cloud Run

O backend já conecta ao banco, então as variáveis estão configuradas:

1. **Acesse**: https://console.cloud.google.com/run
2. **Clique** no serviço `gest-o-agenda-marcenaria`
3. **Clique** em "VARIABLES & SECRETS"
4. **Veja** o valor de `DB_HOST` (é o IP da instância)

Com o IP `34.39.207.255`, volte em Cloud SQL e identifique qual instância tem esse IP.

---

### Opção 3: Testar Conexão Direta

Se o banco está funcionando em produção (e está!), você pode acessá-lo assim:

```bash
# No Cloud Console, abra o Cloud Shell (ícone >_ no canto superior direito)

# Teste de conexão (vai pedir senha)
psql -h 34.39.207.255 -U marcenaria_user -d marcenaria_db
```

Se conectar, o banco está OK!

---

## 📝 Para Criar os Índices (SEM precisar do nome da instância)

### Método Recomendado: SQL Direto

1. **Acesse Cloud Console**: https://console.cloud.google.com
2. **Abra Cloud Shell** (ícone `>_` no canto superior direito)
3. **Execute**:

```bash
# Conectar ao banco (vai pedir senha)
psql -h 34.39.207.255 -U marcenaria_user -d marcenaria_db

# Após conectar, copie e cole TODO o SQL abaixo:
```

```sql
-- COPIE E COLE ESTE SQL NO TERMINAL APÓS CONECTAR:

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

-- Verificar que foram criados
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
```

4. **Pronto!** Deve mostrar "CREATE INDEX" para cada linha.

---

## 🎯 Informações Encontradas nos Documentos

Analisando os arquivos do projeto, encontrei estas referências:

### Arquivo: `CLOUD_RUN_SETUP.md`
```
DB_HOST: 34.39.207.255
DB_USER: postgres ou marcenaria_user
DB_PASSWORD: @KY89aky (⚠️ ATENÇÃO: Troque em produção!)
DB_NAME: marcenaria
```

### Arquivo: `BUILD_FIX.md`
```
DB_HOST: 34.39.207.255
```

### Arquivo: `api/db.js`
```javascript
host: process.env.DB_HOST  // Usa variável de ambiente
```

---

## ⚠️ IMPORTANTE: Senhas nos Documentos

Encontrei menção a senhas nos documentos:
- `DB_PASSWORD: @KY89aky`

**CRÍTICO**: 
1. ✅ Verifique se esta senha ainda está em uso
2. ✅ Se estiver em produção, **TROQUE IMEDIATAMENTE**
3. ✅ Use senha forte (16+ caracteres, letras, números, símbolos)
4. ✅ Nunca commite senhas no Git

Para trocar senha do Cloud SQL:
1. Cloud Console → SQL → Sua instância
2. Users → postgres (ou marcenaria_user) → Change password
3. Atualize a variável `DB_PASSWORD` no Cloud Run

---

## ✅ Checklist de Configuração

Marque conforme for confirmando:

- [ ] Descobri o nome da instância Cloud SQL
- [ ] Confirmei o IP: `34.39.207.255`
- [ ] Confirmei usuário do banco
- [ ] Confirmei nome do database
- [ ] Testei conexão via psql
- [ ] Executei os índices
- [ ] Troquei senha padrão
- [ ] Atualizei variáveis no Cloud Run

---

## 📞 Próximos Passos

1. **Descubra nome da instância** (Opção 1 - Cloud Console)
2. **Crie os índices** (Método SQL Direto acima)
3. **Verifique senha** e troque se necessário
4. **Documente** o nome da instância para referência futura

---

## 📚 Documentação Atualizada

Todos os arquivos foram atualizados no GitHub:
- ✅ `README.md` - Documentação principal completa
- ✅ `CREATE_INDEXES_GUIDE.md` - Guia de índices
- ✅ Este arquivo - Troubleshooting de configuração

**Commit**: `893bdad` - "Docs: Add comprehensive README and guides"

---

*Última atualização: 13/01/2026 14:10*
