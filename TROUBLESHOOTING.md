# Guia de Troubleshooting - Sistema FIVE Ambientes

Soluções para problemas comuns no sistema.

---

## 🔐 Problemas de Login

### Não consigo fazer login

**Sintomas**: Erro "Credenciais inválidas"

**Soluções**:
1. Verifique email e senha
2. Email deve ser: `admin@marcenaria.pro`
3. Senha padrão: `123`
4. Limpe cache do navegador (Ctrl+Shift+Del)
5. Tente em aba anônima

**Se persistir**:
```bash
# Resetar senha via backend
node api/reset-password.js
```

### Token expirou

**Sintomas**: Redirecionamento para login após algum tempo

**Causa**: JWT expira em 8 horas

**Solução**: Fazer login novamente (comportamento normal)

---

## 🌐 Problemas com Frontend

### Página em branco

**Sintomas**: Tela branca, nada aparece

**Diagnóstico**:
1. Abrir DevTools (F12)
2. Verificar Console tab
3. Procurar por erros em vermelho

**Soluções comuns**:
- Erro de CORS/Network: Verificar `VITE_API_URL` (não deve ter barra `/` no final).
- Erro 404: Verificar roteamento
- Erro de módulo: `npm install` e rebuild

### Gráficos não carregam

**Sintomas**: Área de gráficos vazia ou infinito loading

**Causas**:
- Sem dados no banco
- API não respondendo
- Erro de formato de dados

**Soluções**:
1. Verificar se há leads/orçamentos cadastrados
2. Testar endpoint diretamente: `/api/analytics/summary`
3. Verificar console para erros

### Notificações não aparecem

**Sintomas**: Sino sem badge, nenhuma notificação

**Soluções**:
1. Atualizar página (F5)
2. Verificar conexão SSE no Network tab
3. Criar novo lead para gerar notificação
4. Verificar se backend está rodando

---

## 🔧 Problemas com Backend

### API não responde

**Sintomas**: Erro de rede, timeout

**Diagnóstico**:
```bash
# Testar se está no ar
curl https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app/api

# Deve retornar: {"status":"API Online"}
```

**Soluções**:
1. Verificar Cloud Run no console Google Cloud
2. Ver logs: `gcloud logging read "resource.type=cloud_run_revision"`
3. Verificar se deploy foi bem-sucedido
4. Reiniciar serviço se necessário

### Erro 500 (Internal Server Error)

**Sintomas**: Requisição falha com código 500

**Causas comuns**:
- Erro no código
- Banco de dados offline
- Variável de ambiente faltando

**Diagnóstico**:
1. Ver logs do Cloud Run
2. Buscar por stack trace
3. Identificar linha do erro

**Soluções**:
- Corrigir código
- Verificar conexão com banco
- Validar todas variáveis de ambiente

### Contas a Receber/Pagar com Erro 500

**Sintomas**: Página "Contas a Receber" ou "Contas a Pagar" não carrega, mostra erro de servidor.

**Causas**:
- Incompatibilidade de schema entre Frontend e Backend (ex: `customer_name` vs `client`, `document_number` vs `bill_number`).
- Tabelas ausentes ou colunas renomeadas no banco de dados.

**Soluções**:
1. Verificar logs do backend para erro SQL específico (ex: `column does not exist`).
2. Garantir que `api/routes/financial.js` usa os aliases corretos (`q.client as client_name`, `b.bill_number`).
3. Verificar se tabelas `installments` e `bills` existem e têm as colunas esperadas.

### Erro 404 (Not Found)

**Sintomas**: Endpoint não encontrado

**Causas**:
- URL errada
- Rota não implementada
- Typo no endpoint

**Solução**: Verificar documentação da API (`API_DOCUMENTATION.md`)

---

## 💾 Problemas com Banco de Dados

### Conexão recusada

**Sintomas**: `ECONNREFUSED` ou timeout

**Soluções**:
1. Verificar se Cloud SQL está ativo
2. Verificar IP whitelist
3. Testar conexão:
```bash
psql -h 34.39.207.255 -U marcenaria_user -d marcenaria_db
```

### Query lenta

**Sintomas**: Endpoint demora muito para responder

**Soluções**:
1. Verificar se índices foram criados
2. Otimizar query SQL
3. Limitar quantidade de dados retornados

---

## 📁 Problemas com Upload

### Upload falha

**Sintomas**: Arquivo não sobe, erro de upload

**Causas**:
- Arquivo muito grande (>10MB)
- Formato não suportado
- Permissões GCS

**Soluções**:
1. Verificar tamanho do arquivo
2. Formatos aceitos: PDF, JPG, PNG, XLSX
3. Verificar Service Account do GCS

### Download não funciona

**Sintomas**: Link de download não abre

**Causas**:
- Signed URL expirada (15min)
- Arquivo deletado do GCS
- Permissões incorretas

**Soluções**:
1. Gerar nova signed URL (recarregar página)
2. Verificar se arquivo existe no bucket
3. Verificar permissões do Service Account

---

## 📧 Problemas com Email

### Email não envia

**Sintomas**: "Erro ao enviar email"

**Diagnóstico**:
1. Testar configuração: Configurações → Email → Testar
2. Ver erro específico

**Causas comuns**:
- App Password incorreto
- Porta errada (usar 587 para TLS)
- Gmail bloqueando

**Soluções Gmail**:
1. Verificar se 2FA está ativo
2. Gerar novo App Password
3. Usar porta 587 com TLS
4. Não usar senha normal, apenas App Password

### Email vai para spam

**Sintomas**: Emails chegam em spam/lixo eletrônico

**Soluções**:
1. Adicionar remetente aos contatos
2. Marcar como "Não é spam"
3. Configurar SPF/DKIM (avançado)

---

## 🔔 Problemas com Notificações

### SSE desconecta

**Sintomas**: Notificações param de atualizar

**Causas**:
- Conexão de internet instável
- Timeout do servidor
- Browser limitando conexões

**Soluções**:
1. Recarregar página
2. Verificar console para erros
3. SSE reconecta automaticamente após 30s

---

## 🎨 Problemas de Layout

### Tema escuro não funciona

**Sintomas**: Cores não mudam ao alternar tema

**Solução**:
1. Limpar localStorage
2. Recarregar página
3. Verificar se TailwindCSS está compilado

### Responsividade quebrada

**Sintomas**: Layout desalinhado no mobile

**Soluções**:
1. Testar em diferentes tamanhos
2. Verificar breakpoints TailwindCSS
3. Abrir DevTools → Device Toolbar

---

## 🚀 Problemas de Deploy

### Build falha na Vercel

**Sintomas**: Deploy failed, erro de build

**Diagnóstico**: Ver logs do deploy na Vercel

**Causas comuns**:
- Dependência faltando
- Erro de TypeScript
- Variável de ambiente não definida

**Soluções**:
1. Verificar todas dependências em `package.json`
2. Testar build local: `npm run build`
3. Adicionar variáveis de ambiente na Vercel

### Cloud Run não inicia

**Sintomas**: Container não sobe, erro de start

**Diagnóstico**: Ver logs do Cloud Run

**Causas**:
- Erro no Dockerfile
- Porta incorreta
- Dependências faltando

**Soluções**:
1. Verificar `Dockerfile`
2. Porta deve ser $PORT (variável de ambiente)
3. `npm install` completo

---

## 📊 Problemas de Performance

### Sistema lento

**Sintomas**: Tudo demora para carregar

**Soluções**:
1. Verificar conexão de internet
2. Limpar cache do navegador
3. Verificar CPU/memória do Cloud Run
4. Otimizar queries SQL

### Gráficos demoram

**Sintomas**: Analytics leva muito tempo

**Causa**: Muito dado para processar

**Soluções**:
1. Limitar período de análise
2. Adicionar índices no banco
3. Implementar cache

---

## 🆘 Comandos Úteis

### Verificar status geral
```powershell
powershell -ExecutionPolicy Bypass -File test-all-endpoints.ps1
```

### Limpar cache
```powershell
# Frontend
Remove-Item -Path "$env:APPDATA\npm-cache" -Recurse -Force

# Navegador
# Chrome: Ctrl+Shift+Del → Limpar tudo
```

### Logs do Cloud Run
```bash
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

### Testar conexão DB
```bash
psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME>
# Senha quando solicitado
```

---

## 📞 Quando Chamar Suporte

Entre em contato se:
- ❌ Sistema completamente inacessível por >30min
- ❌ Perda de dados
- ❌ Erro de segurança crítico
- ❌ Nenhuma solução acima funcionou

**Informações para fornecer**:
1. Descrição do problema
2. Passos para reproduzir
3. Screenshots do erro
4. Console log (se aplicável)
5. Timestamp (quando ocorreu)

---

*Guia atualizado em: 31/01/2026*
