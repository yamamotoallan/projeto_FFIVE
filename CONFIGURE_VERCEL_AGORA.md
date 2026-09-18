# ✅ CHECKLIST: Fazer Backend Funcionar no Vercel

## O que foi configurado automaticamente:

✅ `vercel.json` atualizado com rewrites para `/api`  
✅ `api/api.js` criado (entry point do Vercel)  
✅ Documentação completa criada

---

## 🚀 O QUE VOCÊ PRECISA FAZER AGORA:

### Passo 1: Configurar Variáveis no Vercel (OBRIGATÓRIO)

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto **marcenaria-pro**
3. Vá em **Settings** → **Environment Variables**
4. **Adicione estas 3 variáveis:**

```
DATABASE_URL = <sua connection string do Neon.tech>
JWT_SECRET = <gere uma chave segura - veja abaixo>
NODE_ENV = production
```

**Como obter DATABASE_URL:**
- Neon.tech Dashboard → Seu Projeto → Connection Details → Copiar connection string

**Como gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Passo 2: Aguardar Deploy Automático

O Vercel detectará o novo push do GitHub e fará deploy automaticamente.

**Acompanhe:**
- Dashboard do Vercel → Deployments
- Aguarde concluir (geralmente 1-2 minutos)

### Passo 3: Testar

Após deploy concluir:

**Teste 1 - Backend rodando:**
```
https://seu-app.vercel.app/api
```
Deve retornar: `{"status":"API Online","env":"production","secure":true}`

**Teste 2 - Frontend conectando:**
- Abra `https://seu-app.vercel.app`
- Tente fazer login com: `admin@marcenaria.pro` / `123`
- Deve funcionar!

---

## 🔥 Como Funciona Agora:

**ANTES:**
```
Frontend: https://app.vercel.app
Backend: ??? (não configurado)
❌ Frontend não consegue chamar API
```

**AGORA:**
```
Frontend: https://app.vercel.app
Backend:  https://app.vercel.app/api/*
✅ Tudo na mesma URL, sem problemas de CORS!
```

---

## ⚠️ Problemas Comuns:

### Se aparecer erro 500 no backend:

**Causa:** Variáveis de ambiente não configuradas

**Solução:** Configure DATABASE_URL e JWT_SECRET no Vercel (Passo 1)

### Se aparecer erro 404 no /api:

**Causa:** Deploy não completou ou rewrites não aplicados

**Solução:** 
1. Verificar no Vercel Dashboard se deploy completou
2. Ver logs do deployment
3. Se precisar, fazer redeploy manual

### Se login não funcionar:

**Causa:** Usuário admin não existe no banco Neon

**Solução:**
```bash
# Rodar localmente para criar o usuário:
node api/fix_admin_user.js
```

---

## 📊 Status Atual:

- ✅ Código configurado e commitado
- ✅ Push feito para GitHub
- ⏳ **AGUARDANDO:** Você configurar variáveis no Vercel
- ⏳ **AGUARDANDO:** Deploy automático do Vercel

---

## 📚 Documentação Completa:

Veja `VERCEL_BACKEND_SETUP.md` para detalhes técnicos e troubleshooting avançado.

---

**Pronto! Depois de configurar as variáveis, o sistema estará 100% funcional em produção! 🎉**
