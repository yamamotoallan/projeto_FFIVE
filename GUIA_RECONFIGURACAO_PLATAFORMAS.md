# 🎛️ GUIA: Reconfiguração Completa de Plataformas

**Depois de consolidar GitHub, reconfigurar tudo com:**
- ✅ Vercel (Frontend)
- ✅ Render (Backend - substituindo Railway)
- ✅ Neon.tech (Database)
- ✅ Cloudinary (Storage)

---

## 🎯 ARQUITETURA FINAL

```
┌─────────────────────┐
│  GitHub Único       │
│  seu-usuario/       │
│  marcenaria-pro     │
└──────────┬──────────┘
           │
    ┌──────┼──────┐
    │      │      │
    ▼      ▼      ▼
┌────┐ ┌──────┐ ┌──────┐
│Ver │ │Rend  │ │Neon  │
│cel │ │er    │ │.tech │
└────┘ └──────┘ └──────┘
  │       │        │
  └───────┴────────┘
         │
    ┌────▼─────┐
    │Cloudinary│
    └──────────┘
```

---

## 📋 PRÉ-REQUISITOS

Você deve ter:
- [ ] Repositório consolidado no GitHub principal
- [ ] Acesso à conta GitHub (2FA resolvido)
- [ ] Emails válidos para cada plataforma
- [ ] SMS/App para 2FA (se necessário)
- [ ] ~30 minutos para configuração

---

## ⚙️ PASSO 1: VERCEL (Frontend)

### 1.1 Conectar Repositório

```
1. Acessar https://vercel.com
2. Login com GitHub
3. Clicar "New Project"
4. Selecionar: seu-usuario-principal/marcenaria-pro
5. Clicar "Import"
```

### 1.2 Configurar Build

Vercel deve auto-detectar, mas verificar:

```
Framework Preset: Vite
Build Command:    npm run build
Output Directory: dist
Install Command:  npm install
```

### 1.3 Adicionar Variáveis de Ambiente

```
Settings → Environment Variables

VITE_API_URL = https://ffive-backend-xxx.onrender.com
(Você pegará a URL do Render depois)

NODE_ENV = production
```

### 1.4 Deploy

```
Clicar "Deploy"
Esperar ~5-10 minutos
Verificar em Deployments se passou
```

**Resultado**: `https://seu-site.vercel.app` rodando ✅

---

## 🚀 PASSO 2: RENDER (Backend)

### 2.1 Criar Web Service

```
1. Acessar https://render.com
2. Clicar "New +"
3. Selecionar "Web Service"
4. Conectar GitHub (será pedido autorização)
5. Selecionar: seu-usuario-principal/marcenaria-pro
6. Clicar "Connect"
```

### 2.2 Configurar Serviço

```
Name:             ffive-backend
Environment:      Node
Build Command:    npm install
Start Command:    node api/start.js
Instance Type:    Standard
```

Deixar checkboxes default.

### 2.3 Adicionar Environment Variables

Clicar "Environment"

```
DATABASE_URL = postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
(Você pegará do Neon depois)

JWT_SECRET = gerar com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

NODE_ENV = production

CLOUDINARY_CLOUD_NAME = xxxxxx
CLOUDINARY_API_KEY = xxxxxx
CLOUDINARY_API_SECRET = xxxxxx

GROQ_API_KEY = gsk_xxxxx (se usar)
SMTP_HOST = smtp.gmail.com (se usar email)
SMTP_PORT = 587
SMTP_USER = seu-email@gmail.com
SMTP_PASSWORD = app-password
```

### 2.4 Deploy

```
Clicar "Create Web Service"
Aguardar build (2-3 minutos)
Verificar logs se passou
```

### 2.5 Pegar URL para Vercel

```
No dashboard do serviço:
Settings → Custom Domain

Copiar URL gerada:
https://ffive-backend-xxxx.onrender.com

Voltar ao Vercel:
Settings → Environment Variables
VITE_API_URL = colar aqui
Redeploy Vercel
```

**Resultado**: Backend rodando em Render ✅

---

## 🗄️ PASSO 3: NEON.TECH (Database)

### 3.1 Criar Projeto PostgreSQL

```
1. Acessar https://neon.tech
2. Clicar "Create project"
3. Name: marcenaria-pro
4. Database name: neondb
5. PostgreSQL version: 14 (ou mais recente)
6. Region: us-east-1 (ou mais próximo)
7. Clicar "Create project"
```

### 3.2 Copiar Connection String

```
No dashboard:
Dashboard → Your projects → marcenaria-pro

Clicar em "Connection string"
Copiar URL (formato pooled é melhor):

postgresql://neon_user:password@ep-xxxxx-pooler.region.neon.tech/neondb?sslmode=require
```

### 3.3 Restaurar Dados (se tinha backup)

```bash
# Se tiver backup da database anterior:
psql postgresql://neon_user:password@ep-xxxxx.region.neon.tech/neondb < backup.sql

# Ou usar Neon CLI:
# brew install neon-cli (ou npm install -g neon-cli)
# neon login
# neon database create-branch ...
```

### 3.4 Criar Tabelas (se novo)

```
Executar SQL do seu script de criação:
No Neon → SQL Editor

Copiar conteúdo de:
CRIAR_INDICES_ATUALIZADO.md

E colar no SQL Editor
```

### 3.5 Adicionar ao Render

```
Voltar ao Render → Web Service
Settings → Environment → DATABASE_URL

Colar:
postgresql://neon_user:password@ep-xxxxx-pooler.region.neon.tech/neondb?sslmode=require

Salvar (auto-redeploy)
```

**Resultado**: Database configurado em Neon ✅

---

## 📦 PASSO 4: CLOUDINARY (Storage)

### 4.1 Criar Conta (se não tiver)

```
1. Acessar https://cloudinary.com
2. Sign up → Free Plan
3. Completar dados
4. Confirmar email
```

### 4.2 Pegar Credenciais

```
No Dashboard:
Account → Account Details

Você verá:
Cloud Name: xxxxxx
API Key: xxxxxx
API Secret: xxxxxx (clicar "View" se não ver)
```

### 4.3 Criar Upload Preset (Opcional, para upload client-side)

```
Settings → Upload
Clicar "Add upload preset"

Name: marcenaria
Folder: uploads/
Unsigned: No (mais seguro com secret)
```

### 4.4 Adicionar ao Render

```
Render → Web Service
Settings → Environment

CLOUDINARY_CLOUD_NAME = seu-cloud-name
CLOUDINARY_API_KEY = seu-api-key
CLOUDINARY_API_SECRET = seu-api-secret

Salvar (auto-redeploy)
```

**Resultado**: Cloudinary configurado ✅

---

## ✅ PASSO 5: TESTAR TUDO

### 5.1 Health Check

```bash
# Backend está rodando?
curl https://ffive-backend-xxxx.onrender.com/health

# Resposta esperada:
{
  "status": "healthy",
  "uptime": 120,
  "services": {
    "database": "connected",
    "cloudinary": "configured"
  }
}
```

### 5.2 Frontend Carrega

```
1. Acessar https://seu-site.vercel.app
2. Deve carregar sem erros
3. Abrir DevTools → Network
4. Verificar se /health dá 200 ✅
```

### 5.3 Login

```bash
curl -X POST https://ffive-backend-xxxx.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"sua-senha"}'

# Resposta esperada:
{
  "success": true,
  "user": {...},
  "token": "eyJ..."
}
```

### 5.4 Listar Dados

```bash
TOKEN="cole-o-token-do-login-acima"

curl -H "Authorization: Bearer $TOKEN" \
  https://ffive-backend-xxxx.onrender.com/api/leads

# Resposta esperada:
[{...}, {...}]
```

### 5.5 Upload

```bash
# Se tiver funcionalidade de upload

TOKEN="seu-token"

curl -F "file=@teste.pdf" \
  -H "Authorization: Bearer $TOKEN" \
  https://ffive-backend-xxxx.onrender.com/api/upload

# Deve retornar URL do arquivo no Cloudinary
```

---

## 📊 VERIFICAÇÃO FINAL

### Checklist de Deploy

- [ ] Vercel mostra "Ready"
- [ ] Render mostra "Live"
- [ ] Neon mostra "Active"
- [ ] Cloudinary API responde

### Checklist de Funcionalidade

- [ ] Frontend carrega
- [ ] Backend responde /health
- [ ] Login funciona
- [ ] Listar dados funciona
- [ ] Criar registro funciona
- [ ] Upload funciona
- [ ] Gráficos carregam
- [ ] Database conecta

### Checklist de Segurança

- [ ] JWT_SECRET é único e forte
- [ ] Variáveis de ambiente não estão em .env commitado
- [ ] CORS está configurado corretamente
- [ ] HTTPS está ativo em tudo
- [ ] Não há credenciais em logs

---

## 🎛️ CONFIGURAÇÕES AVANÇADAS (Opcional)

### Auto-Deploy no GitHub Push

**Vercel**: Já ativado por padrão ✅

**Render**: 
```
1. Settings → Deploy
2. Auto-deploy: ON
3. Deploy branch: main
```

### Custom Domain (Opcional)

**Vercel**:
```
Settings → Domains
Adicionar seu domínio: seu-site.com
Seguir instruções de DNS
```

**Render**:
```
Settings → Custom Domain
Adicionar domínio
Seguir instruções de DNS
```

### Monitoramento (Opcional, Recomendado)

**Sentry**:
```
1. Criar conta em https://sentry.io
2. Create project → Node.js
3. Copiar SENTRY_DSN
4. Adicionar em Render Environment
5. Implementar em código (ver docs)
```

---

## 🚨 PROBLEMAS COMUNS

### Problema: "Database connection refused"

**Solução**:
```
1. Verificar DATABASE_URL está correto
2. Copiar novamente do Neon
3. Verificar se Neon está "Active" (não suspended)
4. Render → Manual Deploy
```

### Problema: "Vercel shows blank page"

**Solução**:
```
1. VITE_API_URL está correto? (sem barra final)
2. Vercel → Redeploy
3. DevTools → Network → veja erros
4. Aumentar build timeout em vercel.json
```

### Problema: "Upload returns 403 Unauthorized"

**Solução**:
```
1. Verificar CLOUDINARY_API_KEY está correto
2. Verificar CLOUDINARY_API_SECRET está correto
3. Usar API Key correto (não Upload Preset)
```

### Problema: "Render keeps restarting"

**Solução**:
```
1. Verificar logs (Render → Logs)
2. Procurar por erro de startup
3. Procurar por crash (memory, CPU)
4. Aumentar instance type: Settings → Instance Type
```

---

## 📝 SALVAR CREDENCIAIS

**LOCAL SEGURO** (não commitar!):

```
PRODUCTION_CREDENTIALS.txt (chmod 600)

=== VERCEL ===
Project URL: https://seu-site.vercel.app
Project ID: xxx
Token: xxxxxx (se gerar)

=== RENDER ===
Service URL: https://ffive-backend-xxxx.onrender.com
Service ID: xxx
API Key: xxxxxx (se gerar)

=== NEON ===
Project ID: proj_xxxxx
Database URL: postgresql://...
Connection pooler: enabled

=== CLOUDINARY ===
Cloud Name: seu-cloud-name
API Key: xxxxx
API Secret: xxxxx (CONFIDENCIAL)

=== GITHUB ===
Token (if generated): xxxxx
SSH key: ~/.ssh/id_ed25519

=== BACKUPS ===
GitHub backups: ~/github-backup/
Database backups: /backups/neon/
```

---

## 🎯 PRÓXIMOS PASSOS

Depois de configurar tudo:

1. **Implementar correções críticas** (do GUIA_IMPLEMENTACAO_CRITICAS.md)
2. **Monitorar por 24h** (verificar logs)
3. **Setup Sentry** (monitoramento)
4. **Adicionar Redis** (cache, opcional)
5. **Load testing** (validar capacidade)

---

## 📞 SUPORTE RÁPIDO

| Plataforma | Problema | Link |
|-----------|----------|------|
| Vercel | Build fails | https://vercel.com/docs/platform/deployments |
| Render | Deploy issues | https://render.com/docs/troubleshoot |
| Neon | Connection | https://neon.tech/docs/connect |
| Cloudinary | API | https://cloudinary.com/documentation |

---

**Tempo total**: ~30 minutos de configuração  
**Resultado**: Stack completamente reconfigurado ✅  
**Próximo**: Monitorar por 24h e implementar melhorias

Boa sorte! 🚀
