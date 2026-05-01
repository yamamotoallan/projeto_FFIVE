# 🚀 PLANO DE MIGRAÇÃO OFICIAL: Marcenaria PRO

Este documento descreve a estratégia consolidada para mover o sistema para um ambiente de produção ("Oficial") com foco em estabilidade, performance e baixo custo.

---

## 🏗️ ARQUITETURA ALVO
- **Frontend**: Vercel (Hospedagem + CDN)
- **Backend**: Render.com (Web Service Node.js)
- **Database**: Neon.tech (PostgreSQL Gerenciado)
- **Storage**: Cloudinary (Imagens e Documentos)
- **Monitoring**: Sentry (Tracking de Erros)

---

## 📋 FASES DA MIGRAÇÃO

### FASE 1: Correções de Estabilidade (Critical Code Fixes)
Antes de mover para produção, corrigiremos problemas estruturais identificados:
- [ ] **Memory Leak**: Corrigir o Map de Rate Limiting que cresce infinitamente.
- [ ] **Connection Pool**: Aumentar de 5 para 20 conexões simultâneas e configurar timeouts.
- [ ] **Error Handling**: Implementar um Global Error Handler no Express para evitar crashes da API.
- [ ] **Uploads**: Adicionar timeout e limite de tamanho para uploads no Cloudinary.

### FASE 2: Infraestrutura no Render.com
- [ ] Criar Web Service no Render conectado ao repositório GitHub.
- [ ] Configurar Variáveis de Ambiente (copiadas do Railway/Neon).
- [ ] Validar Endpoint `/health` para garantir conexão com DB e Cloudinary.

### FASE 3: Cutover (Virada de Chave)
- [ ] Atualizar `VITE_API_URL` no painel da Vercel para a nova URL do Render.
- [ ] Realizar redeploy do Frontend.
- [ ] Testar fluxos críticos (Login, Leads, Upload de Projetos).

---

## 🛠️ VARIÁVEIS DE AMBIENTE NECESSÁRIAS
```env
DATABASE_URL=           # String de conexão do Neon (com pooling)
JWT_SECRET=             # Segredo para autenticação
CLOUDINARY_URL=         # Credenciais do Cloudinary
NODE_ENV=production     # Modo de execução
VITE_API_URL=           # URL do backend no Render
```

---

## ✅ CHECKLIST DE VALIDAÇÃO
- [ ] Backend retornando status "healthy".
- [ ] Frontend conectando sem erros de CORS.
- [ ] Latência de queries no banco de dados < 200ms.
- [ ] Logs estruturados aparecendo no dashboard do Render.

---
**Data de Aprovação**: 01/05/2026
**Responsável**: Antigravity (AI Assistant)
