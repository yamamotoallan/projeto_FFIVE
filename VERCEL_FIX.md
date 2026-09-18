# ✅ Solução: Erro de Limite de Functions na Vercel

## Problema
```
Error: No more than 12 Serverless Functions can be added to a Deployment
```

## Causa
A Vercel estava tentando deployar a pasta `api/` como serverless functions, mas o **backend já está rodando no Google Cloud Run**.

## Solução Aplicada

### 1. Criado `.vercelignore`
Configurado para ignorar:
- ✅ Pasta `api/` (backend)
- ✅ Dockerfile e configs de servidor
- ✅ Scripts de deploy
- ✅ Arquivos de ambiente

### 2. Simplificado `vercel.json`
Removidas rotas de API proxy e mantido apenas configuração de build do frontend.

### 3. Push para GitHub
Mudanças commitadas e enviadas para o repositório.

---

## Próximos Passos na Vercel

### Opção A: Redeploy Automático (Recomendado)
A Vercel vai detectar o push e fazer novo deploy automaticamente em 2-3 minutos.

1. Acesse o dashboard da Vercel
2. Vá no projeto
3. Aguarde o novo deploy aparecer
4. Deve completar com sucesso ✅

### Opção B: Forçar Novo Deploy (Alternativa)
Se não iniciar automaticamente:

1. No dashboard da Vercel, vá no projeto
2. Clique em **"Deployments"**
3. Clique nos **3 pontos** (⋮) do deploy falhado
4. Selecione **"Redeploy"**

---

## Validação Pós-Deploy

Quando o deploy concluir:

```powershell
# Copie a URL da Vercel e teste
curl https://[SUA-URL].vercel.app
```

Deve retornar o HTML do frontend (não erro de functions).

---

## Configuração Final

### Variáveis de Ambiente (ainda necessário)
1. Vercel → Seu projeto → **Settings** → **Environment Variables**
2. Adicionar:
   - `VITE_API_URL` = `https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app`

### Teste de Integração
1. Acesse o frontend
2. Faça login
3. Navegue pelas páginas
4. Crie um lead/orçamento
5. Tudo deve funcionar ✅

---

*Correção aplicada em: 2026-01-13 10:56*
