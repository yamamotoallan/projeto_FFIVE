# ✅ CHECKLIST EXECUTIVO: Consolidação + Reconfiguração

**Tempo Total**: ~6-8 horas de trabalho  
**Resultado**: Um repositório único pronto em produção  
**Risco**: Baixo (com backups)

---

## 📋 ANTES DE COMEÇAR

### Verificações Iniciais
- [ ] Tenho acesso à conta GitHub principal
- [ ] Problema 2FA foi resolvido (ou contornado)
- [ ] Tenho lista de todos os repositórios secundários
- [ ] Tenho acesso a Vercel, Railway/Render, Neon, Cloudinary
- [ ] Tenho 6-8 horas livres
- [ ] Tenho espaço em disco (10GB mínimo)

### Backups
- [ ] Copiei todos os .env files para lugar seguro
- [ ] Fiz backup de todos os repositórios GitHub
- [ ] Documentei todas as credenciais importantes
- [ ] Salvei em Google Drive / Dropbox (redundância)

---

## FASE 1️⃣: PREPARAÇÃO & ACESSO (30 min)

### Passo 1.1: Resolver 2FA (⏱️ 5-10 min)

**Se conseguir fazer login**: Pular para 1.2

**Se não conseguir**:
- [ ] Tentar usar backup code (se guardou)
- [ ] Tentar "Can't access your code?" → email recovery
- [ ] Se tudo falhar: GitHub Support → explicar situação

**Status**: ✅ Posso fazer login no GitHub

---

### Passo 1.2: Verificar Acesso SSH (⏱️ 5 min)

```bash
git ls-remote https://github.com/seu-usuario-principal/seu-repo.git
```

- [ ] Comando executou com sucesso (status ✅)
- [ ] Se falhou: Gerar SSH key nova (ver GUIA_CONSOLIDACAO_GITHUB.md)

**Status**: ✅ Consigo fazer operações Git

---

### Passo 1.3: Documentar Repositórios (⏱️ 10 min)

Lista de repositórios para consolidar:

```
CONTA PRINCIPAL (seu-usuario-principal):
  - [ ] marcenaria-pro
  - [ ] (outro repo: ____________)
  - [ ] (outro repo: ____________)

CONTA SECUNDÁRIA 1 (username: ______________):
  - [ ] (repo: ____________)
  - [ ] (repo: ____________)

CONTA SECUNDÁRIA 2 (username: ______________):
  - [ ] (repo: ____________)
  - [ ] (repo: ____________)
```

**Status**: ✅ Tenho lista completa de repos

---

## FASE 2️⃣: BACKUP & CONSOLIDAÇÃO LOCAL (1 hora)

### Passo 2.1: Criar Pastas de Trabalho (⏱️ 5 min)

```bash
mkdir -p ~/github-backup
mkdir -p ~/consolidado
mkdir -p ~/consolidado/marcenaria-pro-final
```

- [ ] Pastas criadas

---

### Passo 2.2: Fazer Backup de Tudo (⏱️ 15 min)

```bash
cd ~/github-backup

# Para cada repositório secundário:
git clone --mirror https://github.com/usuario-sec/repo-1.git repo-1.git
git clone --mirror https://github.com/usuario-sec/repo-2.git repo-2.git
```

- [ ] Todos os repos clonados com mirror
- [ ] Nenhum erro em clone

---

### Passo 2.3: Consolidar Código (⏱️ 30 min)

```bash
cd ~/consolidado
git clone https://github.com/seu-usuario-principal/marcenaria-pro.git
cd marcenaria-pro
```

**Para cada repositório adicional** (ver GUIA_CONSOLIDACAO_GITHUB.md Seção 2.2):

```bash
git remote add repo2 /caminho/do/repositorio-2
git fetch repo2
git merge --allow-unrelated-histories repo2/main
# Resolver conflitos se houver
git commit -m "merge: consolidate repositorio-2"
```

- [ ] Repo 1 consolidado
- [ ] Repo 2 consolidado
- [ ] Repo 3 consolidado (se houver)
- [ ] Sem conflitos importantes não resolvidos

---

### Passo 2.4: Verificar Integridade (⏱️ 10 min)

```bash
cd ~/consolidado/marcenaria-pro

git log --oneline | head -5          # Ver commits
du -sh .git                          # Ver tamanho
find . -name "*.js" | wc -l          # Ver arquivos
```

- [ ] Histórico de commits completo
- [ ] Arquivo tem tamanho razoável (50-200MB)
- [ ] Quantidade de arquivos é alta (1000+)

---

## FASE 3️⃣: PUSH PARA GITHUB PRINCIPAL (30 min)

### Passo 3.1: Configurar Git (⏱️ 5 min)

```bash
cd ~/consolidado/marcenaria-pro

git config user.name "Seu Nome"
git config user.email "seu-email@github.com"
git remote -v  # Verificar
```

- [ ] User name configurado
- [ ] Email configurado
- [ ] Remote aponta para GitHub certo

---

### Passo 3.2: Push para GitHub (⏱️ 10 min)

```bash
git push -u origin main --force

# Se tiver múltiplas branches:
git branch -a  # Listar
git push -u origin '*:*'  # Push tudo
```

- [ ] Push main completado com sucesso
- [ ] Sem erros de permissão

**⏰ Aguardar ~2-5 minutos para GitHub processar**

---

### Passo 3.3: Verificar no GitHub (⏱️ 5 min)

Acessar: https://github.com/seu-usuario-principal/marcenaria-pro

- [ ] Código aparece na página
- [ ] Commits aparecem
- [ ] Branches aparecem
- [ ] README.md é visível

---

## FASE 4️⃣: DELETAR CONTAS ANTIGAS (30 min)

### Passo 4.1: Documentar Credenciais (⏱️ 10 min)

Antes de deletar, copiar para arquivo seguro:

```
CONTA SECUNDÁRIA 1:
  DATABASE_URL: ____________________
  JWT_SECRET: ____________________
  CLOUDINARY_CLOUD_NAME: ____________________
  CLOUDINARY_API_KEY: ____________________
  CLOUDINARY_API_SECRET: ____________________
  
CONTA SECUNDÁRIA 2:
  (repetir acima)
```

- [ ] Todas credenciais salvas
- [ ] Arquivo guardado em local seguro (Google Drive)

---

### Passo 4.2: Deletar Repositórios (⏱️ 10 min)

**Para cada repositório secundário**:

```
1. Acessar: https://github.com/usuario-sec/repo-name
2. Settings → Danger Zone → Delete this repository
3. Digitar nome do repo para confirmar
4. Clicar Delete
```

- [ ] Repositório secundário 1 deletado
- [ ] Repositório secundário 2 deletado
- [ ] (outros deletados)

---

### Passo 4.3: Desativar/Deletar Contas (⏱️ 10 min - OPCIONAL)

**Se tiver certeza que não vai usar mais:**

```
1. Acessar https://github.com/settings/account
2. Deletar account (se os repos já foram deletados)
```

**Ou deixar inativa** (melhor para segurança):
- Apenas não usar
- Desabilitar 2FA

- [ ] Decisão tomada (deletar ou desativar)
- [ ] Ação executada

---

## FASE 5️⃣: RECONFIGURAR PLATAFORMAS (2-3 horas)

**Seguir**: `GUIA_RECONFIGURACAO_PLATAFORMAS.md`

### Passo 5.1: Vercel (⏱️ 20 min)

```bash
1. Acessar https://vercel.com
2. New Project → seu-usuario-principal/marcenaria-pro
3. Build settings: Vite
4. Environment: VITE_API_URL = https://render-url (copiar depois)
5. Deploy
```

- [ ] Projeto criado no Vercel
- [ ] Deploy iniciado
- [ ] URL Vercel: https://____________________.vercel.app

**Status**: Aguardando URL do Render para VITE_API_URL

---

### Passo 5.2: Neon (⏱️ 15 min)

```bash
1. Acessar https://neon.tech
2. Create project → PostgreSQL 14
3. Copiar Connection String
4. Salvar em arquivo seguro
```

- [ ] Projeto Neon criado
- [ ] Connection string copiada
- [ ] DATABASE_URL: postgresql://____________________

---

### Passo 5.3: Render (⏱️ 20 min)

```bash
1. Acessar https://render.com
2. New Web Service → seu-usuario-principal/marcenaria-pro
3. Configure:
   - Name: ffive-backend
   - Build: npm install
   - Start: node api/start.js
4. Environment Variables:
   - DATABASE_URL (do Neon)
   - JWT_SECRET (gerar novo)
   - CLOUDINARY_* (copiar do doc seguro)
5. Deploy
```

- [ ] Web Service criado
- [ ] Variáveis adicionadas
- [ ] Deploy iniciado
- [ ] Render URL: https://______________________.onrender.com

---

### Passo 5.4: Cloudinary (⏱️ 10 min)

```bash
1. Acessar https://cloudinary.com
2. Pegar credenciais do dashboard
3. Adicionar em Render Environment
```

- [ ] Cloud Name copiado
- [ ] API Key copiado
- [ ] API Secret copiado
- [ ] Adicionado em Render Environment

---

### Passo 5.5: Completar Vercel (⏱️ 5 min)

```bash
1. Volta ao Vercel
2. Settings → Environment Variables
3. VITE_API_URL = https://seu-render-url.onrender.com
4. Redeploy
```

- [ ] VITE_API_URL atualizado
- [ ] Redeploy do Vercel completo

---

## FASE 6️⃣: VALIDAÇÃO FINAL (1 hora)

### Passo 6.1: Health Check (⏱️ 5 min)

```bash
# Backend
curl https://ffive-backend-xxxx.onrender.com/health

# Resposta esperada:
# {"status":"healthy","services":{"database":"connected"}}
```

- [ ] Health endpoint retorna 200
- [ ] Database aparece como "connected"

---

### Passo 6.2: Frontend (⏱️ 5 min)

```
1. Acessar https://seu-site.vercel.app
2. Verificar se carrega (DevTools → Network)
3. Procurar erros de CORS ou API
```

- [ ] Frontend carrega sem erros
- [ ] Nenhum erro de conexão com API

---

### Passo 6.3: Login (⏱️ 10 min)

```bash
curl -X POST https://ffive-backend-xxxx.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"sua-senha"}'

# Resposta esperada:
# {"success":true,"user":{...},"token":"eyJ..."}
```

- [ ] Login retorna token com sucesso
- [ ] Token é válido (jwt.io para verificar)

---

### Passo 6.4: Testar Endpoints (⏱️ 15 min)

```bash
TOKEN="cole-token-acima"

# Listar dados
curl -H "Authorization: Bearer $TOKEN" \
  https://ffive-backend-xxxx.onrender.com/api/leads

# Upload arquivo (se aplicável)
curl -F "file=@teste.pdf" \
  -H "Authorization: Bearer $TOKEN" \
  https://ffive-backend-xxxx.onrender.com/api/upload
```

- [ ] GET /api/leads retorna dados
- [ ] POST upload funciona
- [ ] Nenhum erro 500 ou 403

---

### Passo 6.5: Verificar Logs (⏱️ 10 min)

**Vercel**:
- [ ] Deployments → Status "Ready"
- [ ] Logs não mostram erros

**Render**:
- [ ] Deployments → Status "Live"
- [ ] Logs mostram "Connected to Neon" ✅

---

### Passo 6.6: Deploy Automático (⏱️ 10 min)

```bash
# Fazer commit teste
git commit --allow-empty -m "test: trigger deploy"
git push

# Verificar
# Vercel Deployments: deve ter novo deploy
# Render Deployments: deve ter novo deploy
```

- [ ] Novo commit aparece em GitHub
- [ ] Vercel cria novo deployment
- [ ] Render cria novo deployment
- [ ] Ambos terminam com sucesso

---

## 📊 RESUMO FINAL

### Consolidação ✅
- [ ] Repositórios consolidados em um
- [ ] Push para GitHub bem-sucedido
- [ ] Repositórios antigos deletados

### Reconfiguração ✅
- [ ] Vercel conectado e deployado
- [ ] Render criado e rodando
- [ ] Neon database criado
- [ ] Cloudinary configurado
- [ ] Variáveis de ambiente todas corretas

### Validação ✅
- [ ] /health retorna 200
- [ ] Frontend carrega
- [ ] Login funciona
- [ ] Endpoints respondendo
- [ ] Deploy automático funciona
- [ ] Logs sem erros críticos

---

## 🎉 VOCÊ TERMINOU!

**Próximas ações** (Não são críticas, fazer depois):

1. Implementar as 5 correções críticas (GUIA_IMPLEMENTACAO_CRITICAS.md)
2. Monitorar por 24 horas
3. Setup Sentry para monitoring
4. Adicionar Redis cache (opcional)
5. Load testing

---

## 📞 PRECISA DE AJUDA?

Se algo der errado:

1. **Verificar logs**: 
   - Vercel: Deployments → Logs
   - Render: Logs tab

2. **Rollback simples**:
   ```bash
   git revert <commit-id>
   git push
   ```

3. **Verificar variáveis**:
   - Vercel Settings → Environment Variables
   - Render Settings → Environment

4. **Contatar suporte**:
   - Vercel: https://vercel.com/help
   - Render: https://render.com/support

---

## 💾 SALVAR PARA REFERÊNCIA

Documentos importantes:
- [ ] GUIA_CONSOLIDACAO_GITHUB.md (o que foi feito)
- [ ] GUIA_RECONFIGURACAO_PLATAFORMAS.md (próximas reconfigs)
- [ ] Arquivo de credenciais (em lugar seguro!)
- [ ] Este checklist completo (completado)

---

**STATUS FINAL**: 🟢 **PRONTO PARA PRODUÇÃO**

Tempo gasto: ~6-8 horas  
Risco mitigado: ✅ Backups feitos  
Sistema estável: ✅ Testes passaram  

Bom trabalho! 🚀
