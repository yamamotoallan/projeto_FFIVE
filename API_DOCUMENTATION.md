# Documentação da API - Sistema FIVE Ambientes

**Base URL**: `https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app`  
**Versão**: 1.0  
**Autenticação**: JWT Bearer Token

---

## 📑 Índice

1. [Autenticação](#autenticação)
2. [Leads](#leads)
3. [Orçamentos](#orçamentos)
4. [Projetos](#projetos)
5. [Agenda](#agenda)
6. [Notificações](#notificações)
7. [Analytics](#analytics)
8. [Configurações](#configurações)
9. [Auditoria](#auditoria)
10. [Arquivos](#arquivos)

---

## Autenticação

### POST /api/login

Realiza login e retorna token JWT.

**Request Body**:
```json
{
  "email": "admin@marcenaria.pro",
  "password": "123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@marcenaria.pro",
    "role": "admin"
  }
}
```

**Headers para requisições autenticadas**:
```
Authorization: Bearer {token}
```

---

## Leads

### GET /api/leads

Lista todos os leads.

**Response** (200):
```json
[
  {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 98765-4321",
    "source": "Instagram",
    "status": "novo",
    "notes": "Interessado em cozinha planejada",
    "created_at": "2026-01-10T10:00:00Z"
  }
]
```

### POST /api/leads

Cria novo lead.

**Request Body**:
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "(11) 98765-4321",
  "source": "Instagram",
  "notes": "Interessado em cozinha planejada"
}
```

**Response** (200):
```json
{
  "id": 1,
  "name": "João Silva",
  ...
}
```

### PUT /api/leads/:id

Atualiza lead existente.

### PUT /api/leads/:id/status

Atualiza apenas o status do lead.

**Request Body**:
```json
{
  "status": "convertido"
}
```

---

## Orçamentos

### GET /api/quotes

Lista todos os orçamentos.

**Query Parameters**:
- `status` - Filtrar por status (opcional)

**Response** (200):
```json
[
  {
    "id": 1,
    "client": "João Silva",
    "project": "Cozinha Planejada",
    "value": 15000,
    "status": "aprovado",
    "date": "2026-01-10",
    "description": "Cozinha completa em MDF"
  }
]
```

### POST /api/quotes

Cria novo orçamento.

**Request Body**:
```json
{
  "client": "João Silva",
  "project": "Cozinha Planejada",
  "value": 15000,
  "date": "2026-01-10",
  "description": "Cozinha completa em MDF"
}
```

### PUT /api/quotes/:id

Atualiza orçamento.

### DELETE /api/quotes/:id

Deleta orçamento.

---

## Projetos

### GET /api/projects

Lista todos os projetos.

**Response** (200):
```json
[
  {
    "id": 1,
    "name": "Cozinha - João Silva",
    "stage": "producao",
    "lead_id": 5,
    "quote_id": 3,
    "created_at": "2026-01-05T00:00:00Z"
  }
]
```

### POST /api/projects

Cria novo projeto.

**Request Body**:
```json
{
  "name": "Cozinha - João Silva",
  "stage": "novo",
  "lead_id": 5,
  "quote_id": 3
}
```

### PUT /api/projects/:id

Atualiza projeto (incluindo stage).

**Request Body**:
```json
{
  "stage": "montagem"
}
```

---

## Agenda

### GET /api/events

Lista todos os eventos da agenda.

**Response** (200):
```json
[
  {
    "id": 1,
    "title": "Reunião com João",
    "date": "2026-01-15",
    "time": "14:00",
    "type": "reuniao",
    "location": "Rua Exemplo, 123",
    "notes": "Discutir projeto"
  }
]
```

### POST /api/events

Cria novo evento.

**Request Body**:
```json
{
  "title": "Reunião com João",
  "date": "2026-01-15",
  "time": "14:00",
  "type": "reuniao",
  "location": "Rua Exemplo, 123",
  "notes": "Discutir projeto"
}
```

### PUT /api/events/:id

Atualiza evento.

### DELETE /api/events/:id

Deleta evento.

### POST /api/events/:id/send-invite

Envia convite .ics por email.

**Request Body**:
```json
{
  "email": "cliente@example.com"
}
```

---

## Notificações

### GET /api/notifications

Lista notificações do usuário.

**Query Parameters**:
- `userId` - ID do usuário (padrão: 1)
- `limit` - Limite de resultados (padrão: 20)

**Response** (200):
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "new_lead",
      "title": "👤 Novo Lead Cadastrado",
      "message": "João Silva foi adicionado ao sistema.",
      "link": "/leads?highlight=5",
      "read": false,
      "created_at": "2026-01-13T10:30:00Z"
    }
  ],
  "unreadCount": 3
}
```

### POST /api/notifications/:id/mark-read

Marca notificação como lida.

### POST /api/notifications/mark-all-read

Marca todas como lidas.

### DELETE /api/notifications/:id

Deleta notificação.

### GET /api/notifications/stream

Server-Sent Events stream para notificações em tempo real.

**Response** (Event Stream):
```
data: {"unreadCount": 3, "timestamp": "2026-01-13T10:30:00Z"}
```

---

## Analytics

### GET /api/analytics/conversion

Retorna taxa de conversão.

**Response** (200):
```json
{
  "total_leads": 150,
  "total_projects": 45,
  "conversion_rate": 30.00
}
```

### GET /api/analytics/avg-time

Tempo médio de fechamento.

**Response** (200):
```json
{
  "avgDays": 12.5,
  "completedProjects": 45
}
```

### GET /api/analytics/ticket

Ticket médio dos projetos.

**Response** (200):
```json
{
  "avgValue": 18500,
  "minValue": 5000,
  "maxValue": 50000,
  "totalProjects": 45
}
```

### GET /api/analytics/revenue

Faturamento mensal.

**Query Parameters**:
- `months` - Número de meses (padrão: 6)

**Response** (200):
```json
[
  {
    "month": "2026-01",
    "total": 150000,
    "count": 8
  }
]
```

### GET /api/analytics/funnel

Funil de vendas.

**Response** (200):
```json
{
  "leads": 150,
  "quotes": 100,
  "approved": 50,
  "projects": 45
}
```

### GET /api/analytics/comparison

Comparativo de períodos.

**Response** (200):
```json
{
  "current": 45,
  "previous": 38,
  "change": 18.4,
  "trend": "up"
}
```

### GET /api/analytics/summary

Resumo completo (todas métricas em uma chamada).

**Response** (200):
```json
{
  "conversion": {...},
  "closingTime": {...},
  "ticket": {...},
  "funnel": {...},
  "comparison": {...}
}
```

---

## Configurações

### GET /api/settings/mail

Busca configurações de email.

**Response** (200):
```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": "587",
  "smtp_user": "email@example.com",
  "smtp_secure": "TLS",
  "from_name": "FIVE Ambientes",
  "from_email": "contato@example.com"
}
```

### POST /api/settings/mail

Salva configurações de email.

**Request Body**:
```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": "587",
  "smtp_user": "email@example.com",
  "smtp_pass": "app-password-here",
  "smtp_secure": "TLS",
  "from_name": "FIVE Ambientes",
  "from_email": "contato@example.com"
}
```

### POST /api/test-email

Envia email de teste.

**Request Body**:
```json
{
  "to": "destinatario@example.com"
}
```

---

## Auditoria

### GET /api/audit/logs

Lista logs de auditoria.

**Query Parameters**:
- `user` - Filtrar por usuário
- `type` - Filtrar por tipo de ação
- `startDate` - Data inicial
- `endDate` - Data final

**Response** (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "user_name": "Admin",
    "action_type": "CREATE",
    "entity_type": "lead",
    "entity_id": 5,
    "description": "Novo lead: João Silva",
    "timestamp": "2026-01-13T10:30:00Z"
  }
]
```

---

## Arquivos

### POST /api/quotes/:id/upload

Upload de arquivo para orçamento.

**Request** (multipart/form-data):
- `file` - Arquivo (max 10MB)

**Response** (200):
```json
{
  "success": true,
  "file": {
    "id": 1,
    "filename": "planta.pdf",
    "size": 2048576,
    "uploaded_at": "2026-01-13T10:30:00Z"
  }
}
```

### GET /api/quotes/:quoteId/files

Lista arquivos do orçamento.

**Response** (200):
```json
[
  {
    "id": 1,
    "filename": "planta.pdf",
    "size": 2048576,
    "uploaded_at": "2026-01-13T10:30:00Z"
  }
]
```

### GET /api/quotes/:quoteId/files/:filename/download

Download de arquivo.

**Response**: Signed URL redirecionada para Google Cloud Storage

### DELETE /api/quotes/:quoteId/files/:fileId

Deleta arquivo.

---

## Códigos de Status

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 500 | Erro interno |

---

## Rate Limiting

**Limite**: 1000 requisições / hora por IP

**Headers de resposta**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1640000000
```

---

## Exemplos de Uso

### cURL

```bash
# Login
curl -X POST https://api.example.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marcenaria.pro","password":"123"}'

# Listar leads (com token)
curl -X GET https://api.example.com/api/leads \
  -H "Authorization: Bearer {token}"
```

### JavaScript (Fetch)

```javascript
// Login
const response = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@marcenaria.pro',
    password: '123'
  })
});

const { token } = await response.json();

// Buscar analytics
const analytics = await fetch('/api/analytics/summary', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

---

*Documentação atualizada em: 13/01/2026*  
*Versão da API: 1.0*
