# Guia de Segurança - Sistema FIVE Ambientes

**Versão**: 2.0  
**Data**: Janeiro de 2026

---

## 🔒 Medidas de Segurança Implementadas

### 1. Rate Limiting

**Proteção contra**: DDoS, brute force, abuso de API

**Configuração**:
- **API Global**: 100 requisições/minuto por IP
- **Login**: 5 tentativas/15 minutos por IP
- **Headers**: `X-RateLimit-*` informam limites
- **Resposta**: 429 Too Many Requests quando excedido

**Como funciona**:
```javascript
// Exemplo de resposta quando limite excedido
{
  "error": "Too Many Requests",
  "message": "Você excedeu o limite de requisições",
  "retryAfter": 45 // segundos
}
```

**Configurar limites** (api/rateLimit.js):
```javascript
const MAX_REQUESTS = 100; // Requisições por minuto
const MAX_LOGIN_ATTEMPTS = 5; // Tentativas de login
```

---

### 2. Content Security Policy (CSP)

**Proteção contra**: XSS, clickjacking, code injection

**Headers configurados**:
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self';
  frame-src 'none';
  object-src 'none';
```

**O que isso previne**:
- ❌ Scripts maliciosos de terceiros
- ❌ Iframes não autorizados
- ❌ Plugins inseguros
- ❌ Conexões a URLs suspeitas

---

### 3. HSTS (HTTP Strict Transport Security)

**Proteção contra**: Man-in-the-middle, downgrade attacks

**Configuração**:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**O que faz**:
- Força HTTPS por 1 ano
- Aplica a subdomínios
- Browser nunca tenta HTTP

---

### 4. Autenticação e Autorização

#### JWT (JSON Web Tokens)

**Configuração**:
- Algoritmo: HS256
- Expiração: 8 horas
- Secret: 256 bits (variável de ambiente)

**Payload**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "iat": 1640000000,
  "exp": 1640028800
}
```

**Headers de requisição**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Senha com Bcrypt

**Configuração**:
- Rounds: 10 (2^10 = 1024 iterações)
- Salt: Automático e único por senha

**Exemplo**:
```javascript
// Hash ao criar usuário
const hashedPassword = await bcrypt.hash(password, 10);

// Verificação no login
const isValid = await bcrypt.compare(password, hashedPassword);
```

**NUNCA**:
- ❌ Armazenar senhas em texto plano
- ❌ Usar hash MD5 ou SHA-1
- ❌ Usar salt global

---

### 5. Validação de Inputs

**Biblioteca**: Zod

**Exemplo de schema**:
```javascript
const leadSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(20),
  source: z.string().max(100).optional()
});

// Validar
try {
  const validData = leadSchema.parse(req.body);
} catch (error) {
  return res.status(400).json({ errors: error.errors });
}
```

**Previne**:
- SQL Injection
- XSS
- Buffer Overflow
- Dados malformados

---

### 6. Google Cloud Security

#### Service Account

**Permissões mínimas**:
- Cloud SQL Client
- Storage Object Admin (apenas bucket específico)
- Cloud Run Invoker

**Nunca**:
- ❌ Usar Owner/Editor
- ❌ Compartilhar chave JSON
- ❌ Commitar credenciais no Git

#### Cloud SQL

**Configuração**:
- ✅ SSL obrigatório
- ✅ IP whitelist
- ✅ Senha forte (16+ caracteres)
- ✅ Backup automático diário
- ✅ Point-in-time recovery

#### Cloud Storage

**Configuração**:
- ✅ Signed URLs (15 min expiration)
- ✅ CORS configurado
- ✅ Versioning habilitado
- ✅ Lifecycle rules (delete após 365 dias)

---

## 🚨 Sistema de Alertas

### Logs Críticos

**Eventos monitorados**:
1. Múltiplas tentativas de login falhadas
2. Rate limit excedido
3. Erros 500 frequentes
4. Queries SQL lentas (>1s)
5. Upload de arquivo grande (>10MB)

**Como acessar logs**:
```bash
# Cloud Run
gcloud logging read "resource.type=cloud_run_revision" --limit 100

# Cloud SQL
gcloud sql operations list --instance=marcenaria-db

# Filtrar por erro
gcloud logging read "severity>=ERROR" --limit 50
```

### Alertas Automáticos (Configurar)

**Google Cloud Monitoring**:
1. Acesse Cloud Console → Monitoring
2. Criar alert policy:
   - **CPU > 80%**: Escalar instâncias
   - **Memory > 90%**: Possível leak
   - **Error rate > 5%**: Problema crítico
   - **Latency > 2s**: Performance degradada

**Canais de notificação**:
- Email
- SMS
- Slack/Discord webhook
- PagerDuty

---

## 🔐 Checklist de Segurança

### Aplicação

- [x] Rate limiting implementado
- [x] CSP headers configurados
- [x] HSTS habilitado
- [x] JWT com expiração
- [x] Senhas com bcrypt
- [x] Validação de inputs (Zod)
- [x] CORS restritivo
- [x] Helmet.js ativo
- [x] SQL injection prevention
- [x] XSS prevention

### Infraestrutura

- [x] HTTPS em produção
- [x] Cloud SQL com SSL
- [x] IP whitelist configurado
- [x] Service Account com permissões mínimas
- [x] Secrets em variáveis de ambiente
- [x] .env não commitado
- [x] Backup automático ativo

### Monitoramento

- [x] Logs centralizados
- [x] Erro tracking
- [x] Performance monitoring
- [ ] Alertas configurados (manual)
- [ ] Dashboard de métricas (opcional)

---

## 🛡️ Melhores Práticas

### Desenvolvimento

1. **Nunca commitar segredos**
   - Use `.gitignore` para `.env`
   - Variáveis de ambiente no deploy
   - Secret Manager para produção

2. **Validar tudo**
   - Inputs do usuário
   - Parâmetros de URL
   - Headers HTTP
   - Uploads de arquivo

3. **Princípio do menor privilégio**
   - Permissões mínimas necessárias
   - Não usar admin para tudo
   - Revisar acessos regularmente

### Deploy

1. **Separar ambientes**
   - Dev: Dados de teste
   - Staging: Dados similares a prod
   - Prod: Dados reais, máxima segurança

2. **Atualizar dependências**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Revisar código**
   - Code review antes de merge
   - Verificar vulnerabilidades
   - Testar mudanças de segurança

### Operação

1. **Backup regular**
   - Diário automático
   - Testar restore
   - Retenção de 7 dias local + 30 dias GCS

2. **Monitorar logs**
   - Revisar semanalmente
   - Buscar padrões suspeitos
   - Investigar anomalias

3. **Atualizar senhas**
   - JWT_SECRET rotação anual
   - DB password rotação semestral
   - Service Account key rotação trimestral

---

## 🔥 Resposta a Incidentes

### Se detectar ataque

1. **Identificar**:
   - IP do atacante nos logs
   - Tipo de ataque (força bruta, DDoS, etc)
   - Escopo (1 endpoint ou sistema todo)

2. **Conter**:
   - Bloquear IP manualmente:
     ```bash
     # No Cloud Armor (se configurado)
     gcloud compute security-policies rules create 1000 \
       --security-policy=marcenaria-policy \
       --expression="origin.ip == '1.2.3.4'" \
       --action=deny-403
     ```
   - Reduzir rate limits temporariamente
   - Desabilitar endpoints afetados

3. **Erradicar**:
   - Corrigir vulnerabilidade
   - Atualizar dependências
   - Deploy de fix

4. **Recuperar**:
   - Restaurar de backup se necessário
   - Validar integridade dos dados
   - Reiniciar serviços

5. **Documentar**:
   - O que aconteceu
   - Como foi detectado
   - Ações tomadas
   - Lições aprendidas

---

## 📞 Recursos Adicionais

### Ferramentas de Teste

- **OWASP ZAP**: Scanner de vulnerabilidades
- **Burp Suite**: Teste de penetração
- **npm audit**: Vulnerabilidades em dependências
- **Lighthouse**: Segurança frontend

### Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)

---

*Guia atualizado em: 13/01/2026*  
*Versão: 2.0 (com Rate Limiting e CSP)*
