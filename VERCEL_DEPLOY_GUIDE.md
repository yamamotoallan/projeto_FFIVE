# 🚀 Deploy do Frontend na Vercel - Guia Passo-a-Passo

## Pré-requisitos
✅ Conta GitHub (já tem)  
✅ Repositório: https://github.com/yamamotoallan/GEST-O-AGENDA-MARCENARIA  
✅ Backend rodando no Cloud Run

---

## Passo 1: Criar Conta na Vercel

1. Acesse: https://vercel.com/signup
2. Clique em **"Continue with GitHub"**
3. Autorize o acesso ao GitHub
4. Confirme o email (se necessário)

---

## Passo 2: Importar Projeto do GitHub

1. No dashboard da Vercel, clique em **"Add New..."** → **"Project"**
2. Clique em **"Import Git Repository"**
3. Se o repositório não aparecer:
   - Clique em **"Adjust GitHub App Permissions"**
   - Autorize acesso ao repositório `GEST-O-AGENDA-MARCENARIA`
4. Encontre o repositório na lista e clique em **"Import"**

---

## Passo 3: Configurar o Projeto

### Framework Preset
- **Framework Preset**: Vite
- **Root Directory**: ./
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables (Variáveis de Ambiente)

Clique em **"Environment Variables"** e adicione:

| Nome | Valor |
|------|-------|
| `VITE_API_URL` | `https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app` |

> **IMPORTANTE**: Cole a URL exata do Cloud Run sem barra final

---

## Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-5 minutos (build + deploy)
3. Quando concluir, você verá: **"Congratulations! Your project has been deployed"**

---

## Passo 5: Obter URL do Frontend

1. Copie a URL (ex: `https://marcenaria-pro.vercel.app`)
2. Clique em **"Visit"** para testar

---

## Passo 6: Teste de Integração

### 6.1 Testar Login
1. Acesse a URL do frontend
2. Vá para a tela de login
3. Use: `admin@marcenaria.pro` / `123`
4. Deve logar com sucesso ✅

### 6.2 Testar API
1. Após login, vá em **Leads**
2. Deve carregar a lista de leads
3. Tente criar um novo lead
4. Deve salvar no banco de dados

### 6.3 Testar Upload
1. Vá em **Orçamentos**
2. Crie um orçamento com arquivo anexado
3. O arquivo deve ser enviado para o GCS

---

## Passo 7: Configurar Domínio Personalizado (Opcional)

1. No dashboard da Vercel, clique no projeto
2. Vá em **"Settings"** → **"Domains"**
3. Adicione seu domínio (ex: `app.marcenariapro.com.br`)
4. Siga as instruções para configurar DNS

---

## Passo 8: Deploy Automático

Para deploys futuros:
1. Faça alterações no código local
2. Commit: `git add . && git commit -m "Descrição"`
3. Push: `git push origin main`
4. Vercel faz deploy automático! 🚀

---

## Troubleshooting

### Build Falha
**Erro**: `Dependencies not found`  
**Solução**: Certificar que `package.json` tem todas dependências

**Erro**: `VITE_API_URL is undefined`  
**Solução**: Adicionar variável de ambiente na Vercel

### Página em Branco
**Problema**: Frontend carrega mas tela branca  
**Solução**: Abrir DevTools (F12) → Console → Ver erros

### Erro de CORS
**Problema**: `CORS policy blocked`  
**Solução**: Verificar se backend tem CORS habilitado para domínio da Vercel

---

## Configuração Avançada (Opcional)

### vercel.json
Criar arquivo `vercel.json` na raiz:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## Validação Pós-Deploy

Execute localmente:
```powershell
# Testar frontend
curl https://[SUA-URL-VERCEL].vercel.app

# Testar login via frontend
# (Use o navegador para isso)
```

---

## URLs Finais

**Frontend**: https://[projeto].vercel.app  
**Backend**: https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app  
**GitHub**: https://github.com/yamamotoallan/GEST-O-AGENDA-MARCENARIA

---

*Tempo estimado total: 30-45 minutos*  
*Última atualização: 2026-01-13*
