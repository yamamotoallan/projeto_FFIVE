# Configuração de Deploy - Vercel

Este documento explica como o backend e frontend estão configurados para funcionar juntos no Vercel.

## Arquitetura em Produção

```
Frontend (Vercel)          Backend API (Vercel Serverless)     Database
─────────────────          ───────────────────────────────     ────────
https://app.vercel.app  →  https://app.vercel.app/api/*    →  Neon.tech
         (React)                  (Express.js)                 (PostgreSQL)
```

## Como Funciona

### 1. Frontend (React + Vite)
- Build gerado em `/dist`
- Servido como arquivos estáticos pelo Vercel
- Faz chamadas para `/api/*` 

### 2. Backend (Express.js)
- Código em `/api/index.js`
- Roda como Vercel Serverless Function
- Rotas: `/api/login`, `/api/leads`, `/api/quotes`, etc.
- Acessa Neon.tech via `DATABASE_URL`

### 3. Configuração no vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ]
}
```

**O que faz:**
- `buildCommand`: Builda o frontend (React)
- `outputDirectory`: Onde estão os arquivos estáticos
- `rewrites`: Roteia `/api/*` para a função serverless em `/api/api.js`

---

## Variáveis de Ambiente no Vercel

### Obrigatórias

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=sua_chave_secreta_minimo_32_caracteres
NODE_ENV=production
```

### Opcionais

```env
GCS_BUCKET_NAME=seu-bucket
GCS_PROJECT_ID=seu-project-id
GOOGLE_APPLICATION_CREDENTIALS=<não funciona no Vercel, use outra abordagem>
```

---

## Passo a Passo para Deploy

### 1. Configurar Variáveis no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Selecione o projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione:
   - `DATABASE_URL` (sua connection string do Neon.tech)
   - `JWT_SECRET` (gere com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `NODE_ENV` = `production`

### 2. Push para GitHub

```bash
git add .
git commit -m "feat: configurar backend para Vercel"
git push origin main
```

### 3. Deploy Automático

O Vercel detecta o push e faz deploy automaticamente!

---

## Teste em Produção

### Verificar se o Backend Está Respondendo

```bash
curl https://seu-app.vercel.app/api
```

**Resposta esperada:**
```json
{
  "status": "API Online",
  "env": "production",
  "secure": true
}
```

### Testar Login

```bash
curl -X POST https://seu-app.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marcenaria.pro","password":"123"}'
```

---

## Diferenças: Local vs Produção

| Aspecto | Desenvolvimento Local | Produção (Vercel) |
|---------|----------------------|-------------------|
| Frontend | `localhost:5173` | `app.vercel.app` |
| Backend | `localhost:3000` | `app.vercel.app/api` |
| Conexão | Proxy do Vite | Mesma origem (sem CORS) |
| Banco | Neon.tech | Neon.tech (mesmo) |
| Env Vars | `.env` local | Vercel Dashboard |

---

## Troubleshooting

### Erro 404 nas rotas /api

**Causa:** `vercel.json` não configurado corretamente

**Solução:** Verificar se tem:
```json
"rewrites": [
  { "source": "/api/(.*)", "destination": "/api" }
]
```

### Erro 500 no backend

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Vercel Dashboard → Settings → Environment Variables
2. Adicionar `DATABASE_URL` e `JWT_SECRET`
3. Redeploy

### Frontend não encontra o backend

**Causa:** Frontend está chamando URL errada

**Solução:** Em produção, frontend deve chamar `/api/login` (path relativo), NÃO `http://localhost:3000/api/login`

### Erro de CORS

**Causa:** Em produção no Vercel, não deve ter erro de CORS (mesma origem)

**Solução:** Se houver CORS em produção, verifique se o frontend está realmente chamando paths relativos (`/api/*`)

---

## Logs e Monitoring

### Ver Logs do Backend

1. Vercel Dashboard → Seu projeto
2. **Deployments** → Clique no deploy ativo
3. **Functions** → `/api`
4. Ver logs em tempo real

### Ver Logs do Neon.tech

1. [Neon Dashboard](https://console.neon.tech)
2. Seu projeto → **Operations**
3. Ver query history e métricas

---

## Performance

### Cold Starts

Serverless Functions têm "cold starts" (primeira requisição demora mais).

**Mitigação:**
- Neon.tech tem branching/connection pooling
- Vercel mantém funções "warm" com tráfego regular
- Use connection pooling no Node.js (já configurado em `api/db.js`)

### Limites do Vercel (Free Tier)

- **Execução:** 100GB-horas/mês
- **Banda:** 100GB/mês
- **Duração da função:** 10 segundos (Edge), 60s (Serverless)

Para projetos pequenos/médios, está mais que suficiente!

---

## Checklist de Deploy

- [ ] Variáveis configuradas no Vercel
- [ ] `vercel.json` com rewrites configurado
- [ ] Código commitado e no GitHub
- [ ] Deploy feito (automático ou manual)
- [ ] Testado endpoint `/api` (retorna status)
- [ ] Testado login (retorna token)
- [ ] Frontend carrega e autentica
- [ ] Logs sem erros críticos

---

**Última atualização:** Janeiro 2026
