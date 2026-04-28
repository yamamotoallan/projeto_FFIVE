# 🔄 GUIA COMPLETO: Consolidação de Repositórios GitHub + Reconfiguração Plataformas

**Data**: 28 de Abril de 2026  
**Objetivo**: Unificar múltiplas contas GitHub em uma conta principal  
**Resultado Final**: Um repositório único pronto para Vercel + Render + Neon + Cloudinary

---

## 📋 SITUAÇÃO ATUAL

Você tem:
- [ ] Múltiplas contas GitHub (com projetos descentralizados)
- [ ] Múltiplos Vercel projects
- [ ] Múltiplos Railway projects
- [ ] Múltiplas instâncias Neon.tech
- [ ] Múltiplas contas Cloudinary
- [ ] Problemas de acesso (2FA via SMS de outro país)

Você quer:
- ✅ Um repositório único na conta principal
- ✅ Consolidar código de todos os projetos
- ✅ Reconfiguar com Vercel + Render + Neon + Cloudinary
- ✅ Sem problemas de 2FA

---

## 🎯 PLANO DE AÇÃO

```
FASE 1: Preparação & Acesso (30 min)
  ├─ Verificar acesso à conta principal GitHub
  ├─ Resolver problema 2FA
  └─ Listar todos os repositórios para consolidar

FASE 2: Backup & Consolidação (1 hora)
  ├─ Fazer backup de todos os repositórios
  ├─ Merge local em um repositório
  └─ Organizar estrutura de diretórios

FASE 3: Push para GitHub Principal (30 min)
  ├─ Criar repositório novo (se necessário)
  ├─ Push do código consolidado
  └─ Verificar acesso

FASE 4: Deletar Contas Antigas (30 min)
  ├─ Listar recursos em contas antigas
  ├─ Documentar IDs/keys importantes
  └─ Deletar ou desativar contas

FASE 5: Reconfigurar Plataformas (2-3 horas)
  ├─ Vercel: Reconectar repositório principal
  ├─ Render: Criar nova instância
  ├─ Neon: Provisionar novo banco
  └─ Cloudinary: Manter ou reorganizar

FASE 6: Validação Final (1 hora)
  ├─ Testar endpoints
  ├─ Verificar deploys
  └─ Documentar nova arquitetura
```

**TEMPO TOTAL**: ~5-6 horas de trabalho

---

## 🔑 FASE 1: PREPARAÇÃO & ACESSO

### 1.1 Resolver Problema 2FA (CRÍTICO!)

Como você está fora do país e não recebe SMS, temos estas opções:

#### Opção A: Usar Backup Codes (Se tiver guardado)
```
1. GitHub Settings → Security
2. Se vir "Two-factor authentication codes", salvou lá
3. Use um código para fazer login
4. Depois disable 2FA temporariamente
```

#### Opção B: Disable 2FA (Mais fácil)
```
1. Acessar https://github.com/login
2. Se pedir código SMS que não chegará:
   - Clicar "Can't access your code?"
   - GitHub pode oferecer:
     • Usar backup code
     • Contatar support
     • Verify with recovery email
3. Usar email de recuperação (isso funciona!)
```

#### Opção C: GitHub Support (Last Resort)
```
Se não conseguir fazer login:
1. Acessar https://support.github.com/
2. Clicar "Contact us"
3. Explicar situação:
   - Mudei de país
   - SMS 2FA não funciona mais
   - Posso verificar via email
4. GitHub resolve em 24-48h
```

**⭐ RECOMENDAÇÃO**: Use Opção B com email de recuperação (rápido!)

---

### 1.2 Verificar Acesso à Conta Principal

```bash
# Terminal
git config --global user.name
# Resultado: Seu nome GitHub

git config --global user.email
# Resultado: Seu email GitHub

# Testar acesso
git ls-remote https://github.com/seu-usuario/seu-repo.git
# Se funcionar, acesso OK ✅
```

Se não funcionar:

```bash
# Gerar SSH key novo
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar em GitHub:
# Settings → SSH and GPG keys → New SSH key
```

---

### 1.3 Listar Todos os Repositórios para Consolidar

**Documentar** (substitua pelos seus valores):

```
CONTA 1 (Principal):
  Username: seu-usuario-principal
  Repos:
    - [ ] marcenaria-pro
    - [ ] outro-repo-1
    - [ ] outro-repo-2

CONTA 2 (Secundária):
  Username: usuario-secundario
  URL: https://github.com/usuario-secundario
  Repos:
    - [ ] projeto-api
    - [ ] projeto-frontend
    - [ ] projeto-mobile

CONTA 3 (Terceira):
  Username: usuario-terciario
  Repos:
    - [ ] repo-antigo-1
    - [ ] repo-antigo-2
```

**Se não lembrar dos usernames**:

```bash
# No repositório local que você tem acesso
git remote -v
# Mostra URLs dos repositórios

# Exemplo output:
# origin  https://github.com/usuario-secundario/projeto-api.git
```

---

## 📦 FASE 2: BACKUP & CONSOLIDAÇÃO LOCAL

### 2.1 Fazer Backup de Tudo (IMPORTANTE!)

```bash
# Criar pasta de backup
mkdir ~/github-backup
cd ~/github-backup

# Para CADA repositório secundário:
git clone --mirror https://github.com/usuario-secundario/projeto-api.git projeto-api.git
git clone --mirror https://github.com/usuario-terciario/repo-antigo-1.git repo-antigo-1.git

# Resultado: backup completo de cada repo
ls -la
# Você verá: projeto-api.git, repo-antigo-1.git, etc
```

**Guardar esta pasta em:**
- [ ] Sua máquina local (backup)
- [ ] Google Drive / Dropbox (segurança)

---

### 2.2 Consolidar Código em Um Repositório

Vamos juntar tudo em uma estrutura única:

```bash
# 1. Clonar repositório principal (maior, ou o atual)
cd ~/consolidado
git clone https://github.com/seu-usuario-principal/marcenaria-pro.git
cd marcenaria-pro

# 2. Para cada repositório secundário, fazer merge:

# Repositório 2 (exemplo: projeto-api)
git remote add repo2 https://github.com/usuario-secundario/projeto-api.git
git fetch repo2

# Criar branch local a partir do remoto
git checkout -b import-projeto-api repo2/main

# Mover arquivos para subpasta (para não sobrescrever)
mkdir -p antigos/projeto-api
git mv src/* antigos/projeto-api/src 2>/dev/null || true
git mv api/* antigos/projeto-api/api 2>/dev/null || true
git mv package.json antigos/projeto-api/package.json 2>/dev/null || true

# Ou manualmente:
cp -r /caminho/do/projeto-api/* antigos/projeto-api/

# Voltar para main
git checkout main

# Merge
git merge --allow-unrelated-histories import-projeto-api

# 3. Resolver conflitos (se houver)
# Git vai marcar arquivos conflitantes com <<<<< =====  >>>>>
# Editar manualmente e decidir o que manter

# Depois de resolver:
git add .
git commit -m "merge: consolidate projeto-api into main repository"

# 4. Repetir para cada repositório adicional
```

**Estrutura final esperada**:

```
marcenaria-pro/
├── src/                    # Frontend React
├── api/                    # Backend Node.js
├── antigos/
│   ├── projeto-api/
│   │   ├── src/
│   │   └── api/
│   └── repo-antigo-1/
│       ├── src/
│       └── api/
├── package.json
├── README.md
└── ... (outros arquivos)
```

---

### 2.3 Verificar Integridade

```bash
# Ver log de commits
git log --oneline | head -20
# Deve mostrar commits de todos os repositórios

# Ver tamanho do repositório
du -sh .git
# Deve estar ~50-200MB

# Verificar branches
git branch -a
# Deve mostrar branches consolidadas

# Listar arquivos
find . -type f -name "*.js" -o -name "*.tsx" | wc -l
# Deve ser número elevado (todos os arquivos)
```

**Se algo estiver errado**:
```bash
# Voltar para versão anterior
git reset --hard HEAD~1
git reflog  # Ver histórico
git reset --hard <id-anterior>
```

---

## 🚀 FASE 3: PUSH PARA GITHUB PRINCIPAL

### 3.1 Configurar Git Local

```bash
# Verificar configuração
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@github.com"

# Verificar remoto atual
git remote -v
# Deve mostrar: origin  https://github.com/seu-usuario-principal/marcenaria-pro.git

# Se remoto estiver errado, corrigir:
git remote remove origin
git remote add origin https://github.com/seu-usuario-principal/marcenaria-pro.git
```

### 3.2 Push do Código

```bash
# Fazer backup local antes
git branch -a  # Listar branches
git log --oneline | head -1  # Ver último commit

# Push para GitHub
git push -u origin main --force

# ⚠️ IMPORTANTE: --force sobrescreve histórico
# Só usar se tiver certeza que é o repositório correto!

# Depois de push, verificar:
git log -1  # Verificar último commit
```

**Se tiver múltiplas branches**:

```bash
# Listar branches locais
git branch -a

# Push de cada branch
git push -u origin branch-name

# Ou push tudo
git push -u origin '*:*'
```

### 3.3 Verificar no GitHub

```
1. Acessar https://github.com/seu-usuario-principal/marcenaria-pro
2. Verificar:
   - [ ] Código aparece
   - [ ] Branches aparecem
   - [ ] Commits aparecem
   - [ ] README.md visível
```

---

## 🗑️ FASE 4: DELETAR CONTAS ANTIGAS

### 4.1 Documentar IDs Importantes

**Antes de deletar, SALVAR**:

```
CONTA 2 - usuario-secundario:
  ├─ Neon Project ID: ____________________
  ├─ Neon Database URL: postgresql://...
  ├─ Cloudinary Cloud Name: ____________________
  ├─ Cloudinary API Key: ____________________
  ├─ Railway Project ID: ____________________
  └─ Qualquer SSH key importante? __________

CONTA 3 - usuario-terciario:
  ├─ Neon Project ID: ____________________
  └─ (repetir acima)
```

**Como recuperar estes dados**:

```bash
# Se tiver acesso aos repositórios:
git log --all --grep="Neon\|CLOUDINARY\|RAILWAY" 
# Procura em histórico de commits

# Se tiver .env local:
cat .env | grep -E "NEON|CLOUDINARY|RAILWAY"

# Se tiver GitHub Actions:
# Settings → Secrets and variables
# Copiar todas as variáveis
```

### 4.2 Deletar Repositórios Secundários (do GitHub)

```
Para CADA repositório secundário:

1. Acessar: https://github.com/usuario-secundario/projeto-api
2. Settings → Danger Zone → Delete this repository
3. Digitar nome do repositório para confirmar
4. Clicar Delete

OBS: Seus backups em ~/github-backup estão salvo!
```

### 4.3 Deletar Contas (Opcional, se não usar mais)

```
AVISO: Isto é PERMANENTE e irrevogável!

1. Acessar https://github.com/settings/account
2. Scroll para "Delete account"
3. Se tiver repositórios, você precisa:
   - Deletar os repos primeiro, OU
   - Transferir para outra conta
4. Seguir instruções de confirmação
```

**Se não quiser deletar conta**:
- Deixar como backup
- Apenas não usar mais
- Remover 2FA para não travar

---

## 🎯 FASE 5: RECONFIGURAR PLATAFORMAS

### 5.1 Vercel - Reconectar Repositório Principal

```
1. Acessar https://vercel.com
2. Clicar seu projeto (ou criar novo se não existir)
3. Settings → Git Repository
4. Desconectar repositório antigo (se houver)
5. Conectar novo:
   - GitHub → seu-usuario-principal/marcenaria-pro
6. Aguardar deploy automático
7. Verificar em "Deployments" se passou
```

**Se tiver erro de acesso**:
```
1. Settings → Connected Integrations
2. GitHub → Reauthorize
3. Aprovar acesso ao novo repositório
4. Tentar novamente
```

---

### 5.2 Render - Criar Nova Instância

(Seguir `GUIA_MIGRACAO_RENDER.md`)

```
1. Acessar https://render.com
2. New → Web Service
3. Conectar GitHub:
   - seu-usuario-principal/marcenaria-pro
4. Configurar:
   - Name: ffive-backend
   - Environment: Node
   - Build: npm install
   - Start: node api/start.js
5. Adicionar Environment Variables (do .env)
6. Deploy
7. Copiar domain: ffive-xxx.onrender.com
```

**Variáveis necessárias**:

```
DATABASE_URL=postgresql://...            (Neon)
JWT_SECRET=xxxxx
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
NODE_ENV=production
```

---

### 5.3 Neon.tech - Provisionar Nova Instância

```
1. Acessar https://neon.tech
2. Create Project → PostgreSQL 14
3. Copiar CONNECTION STRING
4. Salvar em local seguro

Formato:
postgresql://username:password@ep-xxxxx.region.neon.tech/neondb?sslmode=require
```

**Se tiver dados no Neon antigo**:

```bash
# Fazer backup
pg_dump "postgresql://old-user:old-pass@old-host/old-db" > backup.sql

# Restaurar em novo
psql "postgresql://new-user:new-pass@new-host/new-db" < backup.sql
```

---

### 5.4 Cloudinary - Organizar Conta

```
1. Acessar https://cloudinary.com
2. Se tiver múltiplas contas:
   - Documentar cada uma
   - Decidir qual usar
   - Consolidar arquivos se necessário

3. Se precisar transferir imagens:
   - Cloudinary Admin API permite download
   - Depois upload em nova conta

4. Pegar credenciais:
   Cloud Name: _______________
   API Key: _______________
   API Secret: _______________

5. Adicionar em Render Environment Variables
```

---

## ✅ FASE 6: VALIDAÇÃO FINAL

### 6.1 Testar Endpoints

```bash
# Frontend (Vercel)
curl https://seu-frontend.vercel.app
# Deve retornar HTML da aplicação

# Backend Health (Render)
curl https://ffive-xxx.onrender.com/health
# Deve retornar JSON com status: "healthy"

# Login
curl -X POST https://ffive-xxx.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"sua-senha"}'
# Deve retornar token
```

### 6.2 Verificar Deploys Automáticos

```
1. Fazer commit pequeno no GitHub:
   git commit --allow-empty -m "test: trigger deploy"
   git push

2. Verificar Vercel Deployments:
   - Deve aparecer novo deployment
   - Status deve passar para "Ready"

3. Verificar Render Deployments:
   - Deve aparecer novo deployment
   - Status deve passar para "Live"
```

### 6.3 Testar Funcionalidades Críticas

- [ ] Login funciona
- [ ] Listar dados funciona
- [ ] Criar novo registro funciona
- [ ] Upload de arquivo funciona
- [ ] Gráficos carregam
- [ ] Notificações funcionam
- [ ] Database conecta

---

## 📋 CHECKLIST FINAL

### Consolidação GitHub
- [ ] Acesso à conta principal restaurado (2FA resolvido)
- [ ] Todos os repositórios clonados em backup
- [ ] Código consolidado em um repositório
- [ ] Push para GitHub bem-sucedido
- [ ] Repositórios antigos deletados (ou arquivados)

### Reconfiguração Plataformas
- [ ] Vercel conectado ao novo repositório
- [ ] Render criado e deployado
- [ ] Neon nova instância criada
- [ ] Cloudinary configurado
- [ ] Variáveis de ambiente adicionadas

### Validação
- [ ] Frontend carrega (Vercel)
- [ ] Backend responde (Render /health)
- [ ] Login funciona
- [ ] Database conecta
- [ ] Upload funciona
- [ ] Deploy automático funciona
- [ ] Nenhum erro nos logs

---

## 🚨 TROUBLESHOOTING

### Problema: "Permission denied (publickey)"

**Solução**:
```bash
# Gerar nova SSH key
ssh-keygen -t ed25519 -C "seu-email@github.com"

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar em GitHub Settings → SSH Keys
# Depois:
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

---

### Problema: "Cannot access repository"

**Solução**:
```bash
# Verificar acesso
git ls-remote https://github.com/seu-usuario-principal/marcenaria-pro.git

# Se falhar, usar HTTPS com token:
git remote set-url origin https://seu-token@github.com/seu-usuario-principal/marcenaria-pro.git

# Token: Criar em https://github.com/settings/tokens
# Escopo: repo, read:user
```

---

### Problema: "2FA is blocking login"

**Solução** (já documentada na Fase 1):
- Usar backup code
- Contatar GitHub Support
- Resetar 2FA via email

---

### Problema: "Vercel/Render não vê commits novos"

**Solução**:
```
1. Settings → Git → Disconnect
2. Esperar 1 minuto
3. Settings → Git → Reconnect
4. Autorizar GitHub novamente
5. Fazer commit novo para triggar deploy
```

---

## 📞 PRÓXIMOS PASSOS

Após completar este guia:

1. **Implementar correções críticas** (do relatório anterior)
2. **Setup monitoring** (Sentry)
3. **Adicionar Redis cache** (optional)
4. **Load testing** (validar capacidade)

---

## 📝 DOCUMENTAÇÃO IMPORTANTE

Salvar em local seguro:

```
PRODUÇÃO - Credentials (NÃO commitar!)
├─ Neon DATABASE_URL
├─ Render API Key
├─ Cloudinary credentials
├─ JWT_SECRET
└─ SSH keys backup

GITHUB
├─ Username principal
├─ Email principal
├─ SSH public key
└─ Personal Access Token (se usar)

BACKUPS
├─ ~/github-backup/ (repositórios)
├─ Backup files locais
└─ Documentação deste processo
```

---

**Pronto! Com este guia você consegue consolidar tudo.**

**Tempo estimado**: 5-6 horas  
**Risco**: Baixo (com backups)  
**Resultado**: Um repositório único, pronto para produção

Comece pela **Fase 1** e avance conforme terminar cada seção! 🚀
