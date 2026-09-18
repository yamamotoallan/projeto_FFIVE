# 🚨 AÇÃO NECESSÁRIA - Configurar Variável no Vercel

## Problema

A variável `VITE_API_URL` existe no código, mas **NÃO está configurada no Vercel Dashboard**.

O Vercel **NÃO lê** arquivos `.env.production` automaticamente. Você precisa configurar manualmente.

---

## ✅ Solução: Configurar Variável no Vercel (2 minutos)

### Passo 1: Acessar Vercel Dashboard

1. Acesse: https://vercel.com
2. Login com sua conta
3. Clique no projeto: **gest-o-agenda-marcenaria**

### Passo 2: Adicionar Variável de Ambiente

1. Clique em **Settings** (configurações)
2. No menu lateral, clique em **Environment Variables**
3. Clique em **Add New**

### Passo 3: Adicionar a Variável

**Preencha**:
- **Name**: `VITE_API_URL`
- **Value**: `https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app`
- **Environment**: Selecione **Production** ✅

Clique em **Save**.

### Passo 4: Forçar Novo Deploy

Depois de salvar, o Vercel vai mostrar:
> "Your changes will take effect on the next deployment"

**Opção A - Via Dashboard**:
1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em **Redeploy**

**Opção B - Via Git** (mais fácil):
```powershell
# No seu terminal
cd C:\Users\YF\Downloads\marcenaria-pro
git commit --allow-empty -m "trigger: Redeploy with environment variables"
git push origin main
```

---

## ⏱️ Tempo Total

- Configurar variável: 1 minuto
- Novo deploy: 2-3 minutos
- **TOTAL**: ~4 minutos

---

## 🔍 Como Verificar se Funcionou

Após o deploy completar:

1. Acesse: https://gest-o-agenda-marcenaria.vercel.app
2. Abra o Console do navegador (F12)
3. Na aba **Network** (Rede), tente fazer login
4. Veja se a requisição vai para:
   - ❌ ERRADO: `localhost:3001`
   - ✅ CORRETO: `https://gest-o-agenda-marcenaria-372428009665...`

---

## 📸 Guia Visual

### Tela de Environment Variables

```
Settings → Environment Variables → Add New

┌────────────────────────────────────┐
│ Name:  VITE_API_URL                │
│                                    │
│ Value: https://gest-o-agenda...    │
│                                    │
│ Environment:                       │
│ ☑ Production                       │
│ ☐ Preview                          │
│ ☐ Development                      │
│                                    │
│        [Save] [Cancel]             │
└────────────────────────────────────┘
```

---

## 🆘 Alternativa: Usar vercel.json

Se preferir automatizar, posso criar configuração no `vercel.json`, mas ainda assim precisa configurar a variável uma vez no dashboard.

---

**AÇÃO IMEDIATA**: Configure a variável no Vercel Dashboard agora!
