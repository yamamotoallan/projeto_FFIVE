# Guia de Configuração: Railway + Neon.tech + Cloudinary

Este guia detalha o passo a passo para configurar a arquitetura ideal solicitada:
- **Frontend**: Vercel (Já configurado)
- **Backend**: Railway
- **Banco de Dados**: Neon.tech
- **Arquivos**: Cloudinary

---

## Passo 1: Configurar Cloudinary (Arquivos)

O Cloudinary substituirá o Google Cloud Storage para armazenamento de imagens.

1. Acesse o [Console do Cloudinary](https://console.cloudinary.com).
2. No Dashboard, localize a seção **"Product Environment Credentials"**.
3. Copie os seguintes valores (você precisará deles no Passo 3):
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## Passo 2: Configurar Banco de Dados (Neon.tech)

1. Acesse o [Neon.tech](https://neon.tech) e faça login.
2. Crie um novo projeto (se ainda não tiver).
3. No Dashboard do seu projeto, localize a string de conexão (Connection String).
4. Certifique-se de selecionar a opção **"Pooled connection"** (se disponível) ou copie a string padrão.
   - Ela se parece com: `postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require`
5. **Copie esta URL**.

---

## Passo 3: Configurar Backend (Railway)

Agora vamos subir o código da API para o Railway.

1. Acesse [Railway.app](https://railway.app).
2. Clique em **"+ New Project"** → **"GitHub Repo"**.
3. Selecione o repositório `marcenaria-pro`.
4. Clique no serviço criado e vá em **"Settings"**.
5. Em **"Service Settings"** > **"Start Command"**, insira:
   ```bash
   npm run start:api
   ```
   *(Isso garante que o backend inicie corretamente)*.

6. Vá na aba **"Variables"** e adicione as seguintes variáveis:

   | Variável | Valor / Instrução |
   |----------|-------------------|
   | `DATABASE_URL` | Cole a Connection String do **Neon.tech** (Passo 2) |
   | `CLOUDINARY_CLOUD_NAME` | Cloud Name (do Passo 1) |
   | `CLOUDINARY_API_KEY` | API Key (do Passo 1) |
   | `CLOUDINARY_API_SECRET` | API Secret (do Passo 1) |
   | `JWT_SECRET` | Gere uma senha forte (mínimo 32 caracteres) |
   | `NODE_ENV` | `production` |
   | `PORT` | Ignore (o Railway injeta automaticamente) |

7. Vá na aba **"Networking"** (ou "Public Networking").
8. Clique em **"Generate Domain"**.
9. **Copie o domínio gerado** (ex: `marcenaria-pro-production.up.railway.app`). Este é o endereço do seu Backend.

---

## Passo 4: Atualizar Frontend (Vercel)

Precisamos apontar o Frontend para o novo Backend no Railway.

1. Acesse seu projeto na [Vercel](https://vercel.com).
2. Vá em **Settings** → **Environment Variables**.
3. Edite (ou crie) a variável `VITE_API_URL`.
4. Defina o valor com o domínio do Railway:
   ```
   https://seu-dominio-no-railway.up.railway.app
   ```
   > **IMPORTANTE**: Use `https://` no início e **NÃO** coloque uma barra `/` no final.

5. Vá para **Deployments** e faça um **Redeploy** para aplicar a mudança.

---

## Troubleshooting (Erros Comuns)

### "Erro de Comunicação com Servidor"
Se aparecer esta mensagem ao tentar logar:
1. Verifique se a variável `VITE_API_URL` na Vercel está correta.
2. Certifique-se de ter feito um **Redeploy** na Vercel APÓS adicionar a variável.
3. Abra o Console do Navegador (F12) → Network, tente logar e veja para onde a requisição vai. Ela deve ir para o domínio do Railway. Se estiver indo para o próprio domínio da Vercel (ex: `/api/login`), a variável não foi aplicada.

### Aviso "Builds" no Log da Vercel
Se vir avisos sobre configurações de build ignoradas:
- Nós limpamos o arquivo `vercel.json` para resolver isso. Certifique-se de que suas alterações de código foram enviadas para o GitHub (push).

---

## Verificação Final

1. **Teste de Login**: Tente logar no sistema. Se funcionar, o Backend (Railway) conectou com sucesso no Banco (Neon).
2. **Teste de Arquivos**: Crie um novo Orçamento e anexe um arquivo. Se funcionar, o Backend conectou com sucesso no Cloudinary.
