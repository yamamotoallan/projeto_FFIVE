# 🚀 GUIA DE MIGRAÇÃO: Railway → Render.com

**Tempo Estimado**: 1-2 horas  
**Downtime**: ~5 minutos (durante o switch de DNS)  
**Risco**: Baixo (mantém mesma configuração do banco de dados)  
**Custo**: De R$20-40/mês (Railway) → R$7/mês (Render)

---

## 🎯 Por que Render.com?

| Critério | Railway | Render.com | Vencedor |
|----------|---------|-----------|---------|
| **Free tier** | Não | Sim (2 instances) | Render ✅ |
| **Preço (paid)** | $5-50/mês | $7/mês | Render ✅ |
| **Performance** | Bom | Excelente | Render ✅ |
| **Node.js support** | Nativo | Nativo | Empate |
| **Auto-deploy GitHub** | Sim | Sim | Empate |
| **Database hosting** | Sim (caro) | Neon (barato) | Empate |
| **Startup time** | Rápido | Mais rápido | Render ✅ |

**Recomendação**: **Usar Render para backend + Neon para DB** = Máxima economia + Performance

---

## 📋 PRÉ-REQUISITOS

- [ ] Conta GitHub com repositório `marcenaria-pro`
- [ ] Acesso ao Railway (para cópia de variáveis de ambiente)
- [ ] Acesso ao Vercel (para atualizar VITE_API_URL)
- [ ] Neon.tech com DATABASE_URL já funcional ✅

---

## 🔄 PASSO A PASSO

### FASE 1: PREPARAÇÃO (30 min)

#### 1.1 Copiar Variáveis de Ambiente do Railway

Acesse [Railway Dashboard](https://railway.app):

1. Clique no seu projeto (marcenaria-pro)
2. Clique na aba **Variables**
3. Copie cada uma:
   - `DATABASE_URL` (do Neon.tech)
   - `DATABASE_URL_UNPOOLED` (se usar)
   - `JWT_SECRET`
   - `VITE_API_URL` (será atualizado depois)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `GROQ_API_KEY` (se usar)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` (se usar)
   - Qualquer outra variável customizada

**Salvaguardar** em um arquivo `.env.migrate` (NÃO commitar):
```
DATABASE_URL=postgresql://...
JWT_SECRET=xxxxx
CLOUDINARY_CLOUD_NAME=xxxxx
... etc
```

#### 1.2 Verificar que o Código está Pronto

```bash
# 1. Confirmar que já tem as correções críticas
git log --oneline | head -5

# 2. Build local
npm run build

# 3. Test build artifacts
npm start
# Acessar http://localhost:3000/health
# Deve retornar JSON com status "healthy"

# 4. Fazer commit de qualquer mudança
git add .
git commit -m "chore: prepare for Render.com migration"
git push
```

---

### FASE 2: CRIAR PROJETO NO RENDER.COM (20 min)

#### 2.1 Criar Conta (se ainda não tiver)

Acesse [Render.com](https://render.com) e:
1. Clique **Sign Up**
2. Use GitHub para login rápido
3. Autorize acesso aos repositórios

#### 2.2 Criar Web Service

1. Dashboard → **New +** → **Web Service**
2. Conectar repositório `marcenaria-pro`
3. Preencher formulário:

```
Name:                 ffive-backend
Environment:          Node
Build Command:        npm install
Start Command:        node api/start.js
```

4. Clicar **Create Web Service**

**⏳ Pode levar 2-3 minutos para a primeira build**

#### 2.3 Adicionar Variáveis de Ambiente

No dashboard do serviço:
1. Clicar aba **Environment**
2. Clicar **Add Environment Variable**
3. Cole cada variável do `.env.migrate`:

```
DATABASE_URL = postgresql://...
JWT_SECRET = xxxxxx
CLOUDINARY_CLOUD_NAME = xxxxxx
CLOUDINARY_API_KEY = xxxxxx
CLOUDINARY_API_SECRET = xxxxxx
NODE_ENV = production
```

Clique **Save Changes**

#### 2.4 Gerar Domain

No dashboard:
1. Ir para **Settings**
2. Procurar seção **Domains**
3. Clicar **Add Custom Domain** ou usar domain gerado automaticamente
4. Copiar URL gerada (ex: `ffive-backend-xxxx.onrender.com`)

**⏳ Domain leva 1-2 minutos para ficar ativo**

---

### FASE 3: TESTAR RENDER (30 min)

#### 3.1 Verificar Health Check

```bash
# Aguarde 2 minutos após deploy
curl https://ffive-backend-xxxx.onrender.com/health

# Resposta esperada:
{
  "status": "healthy",
  "timestamp": "2026-04-28T...",
  "uptime": 120,
  "services": {
    "database": "connected",
    "cloudinary": "configured"
  }
}
```

Se não funcionar:
- Clicar **Logs** e procurar por erros
- Verificar se todas variáveis foram adicionadas
- Garantir que DATABASE_URL está correto

#### 3.2 Testar Endpoints Críticos

```bash
# Test login
curl -X POST https://ffive-backend-xxxx.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "sua_senha"}'

# Test get leads
curl -H "Authorization: Bearer seu_token" \
  https://ffive-backend-xxxx.onrender.com/api/leads

# Test upload (se tiver teste)
curl -F "file=@test.pdf" \
  -H "Authorization: Bearer seu_token" \
  https://ffive-backend-xxxx.onrender.com/api/upload
```

#### 3.3 Monitorar Logs

No dashboard do Render:
1. Clicar aba **Logs**
2. Verificar mensagens de startup:
   - ✅ "Server running on port 3000"
   - ✅ "Connected to Neon.tech successfully!"
   - ✅ "Connection pool healthy"

Se houver erros, pode rolar para cima para ver o início do log.

---

### FASE 4: ATUALIZAR FRONTEND (10 min)

#### 4.1 Atualizar Vercel

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Clique projeto `ffive`
3. Vá em **Settings** → **Environment Variables**
4. Encontre `VITE_API_URL`
5. Altere valor para:
   ```
   https://ffive-backend-xxxx.onrender.com
   ```
   (Copiar exato da URL do Render)

6. Clique **Save**

#### 4.2 Fazer Redeploy

1. Volte para **Deployments**
2. Clique nos três pontinhos do deployment mais recente
3. Clique **Redeploy**

**⏳ Build leva ~5 minutos**

Quando terminar:
- Acessar https://ffive.vercel.app
- Fazer login
- Testar navegação (Leads, Quotes, Projects)
- Testar upload de arquivo

---

### FASE 5: MONITORAR & VALIDAR (30 min)

#### 5.1 Validação Funcional

Fazer checklist:

```
Frontend (Vercel):
- [ ] Dashboard carrega
- [ ] Login funciona
- [ ] Listar Leads funciona
- [ ] Criar Lead funciona
- [ ] Upload de arquivo funciona
- [ ] Listar Quotes funciona
- [ ] Gráficos carregam

Backend (Render):
- [ ] Logs mostram ✅ sem erros
- [ ] /health retorna "healthy"
- [ ] Rate limiting funciona (teste com 150 requisições)
- [ ] Keep-alive pinga a cada 4 min
```

#### 5.2 Monitorar Performance

No Render Dashboard:
1. Clicar **Metrics**
2. Observar gráficos de:
   - CPU usage (deve estar ~30%)
   - Memory (deve estar ~150MB)
   - Request count

Se estiverem normais, está tudo OK ✅

---

### FASE 6: DESATIVAR RAILWAY (5 min) - OPCIONAL

⚠️ Só fazer se validação passou e tudo está funcionando 100%!

#### 6.1 Manter Railway em Standby (RECOMENDADO)

Não deletar Railway imediatamente. Deixar rodando por 1 semana de "standby":
- Se Render tiver problema, pode fazer rollback rápido
- Manter variáveis de ambiente salvas
- Não perder histórico de deploys

#### 6.2 Depois de 1 Semana, Deletar Railway

Se tudo está 100% OK em Render:

1. Acesse Railway Dashboard
2. Clique projeto → **Settings**
3. Clicar **Delete Project**
4. Confirmar

---

## 🚨 TROUBLESHOOTING

### Erro: "Cannot connect to database"

**Causa**: DATABASE_URL inválida ou Neon cai

**Solução**:
```bash
# 1. Verificar em Neon.tech que DB está online
# 2. Copiar DATABASE_URL correta novamente
# 3. Atualizar no Render Environment
# 4. Clicar "Manual Deploy"
```

### Erro: "502 Bad Gateway"

**Causa**: Backend não está respondendo a tempo

**Solução**:
```bash
# 1. Clicar Logs e procurar erros
# 2. Se houver "Out of memory", aumentar RAM
#    Render Settings → Instance Type → Standard
# 3. Esperar 2 minutos para Health Check passar
```

### Erro: "CORS error" no Frontend

**Causa**: VITE_API_URL incorreta

**Solução**:
```bash
# 1. Ir a Vercel Settings → Environment Variables
# 2. Verificar VITE_API_URL:
#    - Deve estar sem barra final
#    - Ex: https://ffive-backend-xxxx.onrender.com
# 3. Redeploy Vercel
```

### Erro: "Unauthorized" em login

**Causa**: JWT_SECRET diferente entre Railway e Render

**Solução**:
```bash
# 1. Ir a Render Environment Variables
# 2. Copiar exatamente o JWT_SECRET do Railway
# 3. Salvar e fazer Manual Deploy
```

### Erro: "Connection timeout" em uploads

**Causa**: Cloudinary credentials inválidas

**Solução**:
```bash
# 1. Acessar Cloudinary Console
# 2. Copiar credenciais novamente
# 3. Atualizar no Render Environment
# 4. Manual Deploy
```

---

## 📊 COMPARAÇÃO FINAL

### Antes (Railway)

```
Backend: ffive-production.up.railway.app
Custo: ~R$30/mês
Uptime: ~98%
CPU Limit: 0.5 vCPU
RAM Limit: 512MB
Database: Neon.tech (R$15/mês)
Storage: Cloudinary (Grátis)
Total: ~R$45/mês
```

### Depois (Render)

```
Backend: ffive-backend-xxxx.onrender.com
Custo: ~R$7/mês (ou grátis se usar free tier)
Uptime: ~99.5%
CPU Limit: 0.5 vCPU (shared) → 2 vCPU (paid)
RAM Limit: 512MB (free) → 1GB (paid)
Database: Neon.tech (Grátis tier ou R$15)
Storage: Cloudinary (Grátis)
Total: ~R$7/mês (ou Grátis!)
```

**ECONOMIA**: ~R$38/mês + melhor performance! 🎉

---

## ✅ CHECKLIST FINAL

- [ ] Variáveis de ambiente copiadas e salvas
- [ ] Build local funciona (`npm run build`)
- [ ] Conta Render.com criada
- [ ] Web Service criado no Render
- [ ] Variáveis adicionadas ao Render
- [ ] Domain gerado (aguardou 2 min)
- [ ] /health endpoint retorna 200
- [ ] Login funciona no Render
- [ ] Endpoints críticos testados
- [ ] VITE_API_URL atualizado no Vercel
- [ ] Vercel redeploy realizado
- [ ] Frontend testa e funciona 100%
- [ ] Logs monitorados (sem erros críticos)
- [ ] Performance normal (CPU < 50%, RAM < 300MB)
- [ ] Railway mantido como standby por 1 semana
- [ ] Após validação, Railway deletado

---

## 🎓 DOCUMENTAÇÃO

- [Render Docs - Node.js](https://render.com/docs/deploy-node-express-app)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Neon Connection Pooling](https://neon.tech/docs/introduction/connection-pooling)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)

---

## 💬 SUPORTE

Se tiver problema durante migração:

1. **Verificar Logs no Render**: Dashboard → Logs (scroll para cima)
2. **Check Health Endpoint**: `curl https://seu-domain/health`
3. **Verificar Variáveis**: Render → Environment (copy exata de Railway)
4. **Hard Redeploy**: Settings → Manual Deploy

---

**Bom deploy! 🚀**

Após migração bem-sucedida, próximo passo:
- Implementar Monitoring (Sentry)
- Adicionar Redis Cache (Redis Cloud free tier)
- Setup CI/CD melhorado

Ver documento `RELATORIO_ESTABILIDADE_E_ARQUITETURA.md` para próximas fases.
