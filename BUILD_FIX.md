# ✅ Correção do Build do Cloud Run

## Problema Identificado
O build falhou porque:
1. `npm ci --production` não instala devDependencies
2. Projeto precisa de TypeScript e Vite (que estão em devDependencies)
3. Variável `ENV PORT=8080` no Dockerfile conflitava com a PORT do Cloud Run

## Correções Aplicadas

### 1. Dockerfile Atualizado
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install  # Mudou de npm ci --production
COPY . .
EXPOSE 8080
CMD ["node", "api/index.js"]
```

### 2. .dockerignore Criado
Ignora arquivos desnecessários para otimizar build:
- node_modules/
- .env
- Chaves JSON
- Scripts de setup

### 3. Variável PORT
- **REMOVER** `PORT` das variáveis de ambiente do Cloud Run
- Cloud Run injeta `PORT=8080` automaticamente
- O código já usa `process.env.PORT || 3000`

---

## Próximos Passos

### 1. Acesse Cloud Run
https://console.cloud.google.com/run

### 2. Edite o Serviço
- Clique no serviço criado
- **EDIT & DEPLOY NEW REVISION**

### 3. Variáveis de Ambiente (SEM PORT)
Adicione apenas estas:

| Name | Value |
|------|-------|
| `GCS_BUCKET_NAME` | `marcenaria-files` |
| `GCS_PROJECT_ID` | `marcenariaPRO` |
| `DB_HOST` | `34.39.207.255` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | `@KY89aky` |
| `DB_NAME` | `marcenaria` |
| `DB_PORT` | `5432` |
| `DB_SSL` | `true` |
| `JWT_SECRET` | `super_secret_jwt_key_trocar_em_producao` |
| `NODE_ENV` | `production` |

**NÃO adicione PORT** - é automático!

### 4. Service Account
Selecionar: `marcenaria-storage@marcenariaPRO.iam.gserviceaccount.com`

### 5. Deploy
Clique em **DEPLOY** e aguarde 3-5 minutos

---

## Validação

Após deploy bem-sucedido:
1. Copiar URL do serviço
2. Testar: `https://[SUA-URL]/api` → Deve retornar `{"status":"API Online"}`
3. Testar login: `POST https://[SUA-URL]/api/login`

---

*Correção aplicada: 2026-01-13 01:10*
