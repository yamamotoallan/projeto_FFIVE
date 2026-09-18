# 🚀 Deploy Automático na Vercel - Guia Simplificado

## Opção 1: Script Automático (Recomendado)

### Passo Único
Execute no PowerShell:
```powershell
cd c:\Users\YF\Downloads\marcenaria-pro
powershell -ExecutionPolicy Bypass -File deploy-vercel.ps1
```

**O script vai**:
1. Instalar Vercel CLI (se necessário)
2. Fazer login na Vercel (abre navegador)
3. Configurar variáveis de ambiente
4. Fazer deploy automático

**Duração**: 3-5 minutos

---

## Opção 2: Manual (3 Comandos)

Se o script der erro, execute manualmente:

### 1. Instalar Vercel CLI
```powershell
npm install -g vercel
```

### 2. Login
```powershell
vercel login
```
(Vai abrir navegador para fazer login)

### 3. Deploy
```powershell
vercel --prod
```

Quando perguntar:
- **Set up and deploy**: `Y`
- **Which scope**: Selecione sua conta
- **Link to existing project**: `N`
- **Project name**: `marcenaria-pro` (ou o que preferir)
- **In which directory**: `./`
- **Override settings**: `N`

### 4. Configurar Variável de Ambiente
```powershell
vercel env add VITE_API_URL production
```
Valor: `https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app`

---

## Opção 3: Via Interface Web (3 minutos)

1. Acesse https://vercel.com/new
2. Conecte GitHub
3. Selecione repositório `GEST-O-AGENDA-MARCENARIA`
4. Configure:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Environment Variables:
   - `VITE_API_URL` = `https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app`
6. **Deploy**

---

## Validação

Após deploy, teste:
1. Acesse a URL fornecida
2. Login: `admin@marcenaria.pro` / `123`
3. Navegue pelas páginas
4. Teste criar lead/orçamento

---

## Troubleshooting

**Erro de build**:
- Verifique se `.vercelignore` está correto
- Confirme que `vercel.json` existe

**Página em branco**:
- Abra DevTools (F12) → Console
- Verifique se `VITE_API_URL` está definida

**Erro de CORS**:
- Backend já tem CORS habilitado
- Se persistir, verifique URL da API

---

*Atualizado: 2026-01-13*
