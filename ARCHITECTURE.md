# Guia de Arquitetura - Sistema FIVE Ambientes

**Versão**: 1.0  
**Data**: Janeiro de 2026

---

## 📐 Visão Geral da Arquitetura

O sistema utiliza arquitetura **cliente-servidor** com separação clara entre frontend e backend.

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│                 │        │                  │        │                 │
│  Frontend       │──HTTPS─│  Backend         │──SQL───│  PostgreSQL     │
│  (React/Vite)   │        │  (Node.js)       │        │  (Neon DB)      │
│  Vercel         │        │  Railway         │        │                 │
│                 │        │                  │        │                 │
└─────────────────┘        └──────────────────┘        └─────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
                           ┌──────────────────┐
                           │                  │
                           │  Cloudinary      │
                           │  (Storage)       │
                           │                  │
                           └──────────────────┘
```

---

## Frontend

### Tecnologias

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS
- **Roteamento**: React Router v6
- **Gráficos**: Recharts
- **Ícones**: Lucide React + Material Symbols
- **Deploy**: Vercel

### Estrutura de Pastas

```
marcenaria-pro/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component
│   └── types.ts              # TypeScript types
├── pages/
│   ├── Dashboard.tsx
│   ├── Leads.tsx
│   ├── Quotes.tsx
│   ├── Projects.tsx
│   ├── Agenda.tsx
│   ├── Scripts.tsx
│   └── Settings*.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── NotificationBell.tsx
│   ├── MetricCard.tsx
│   ├── ConversionFunnel.tsx
│   ├── RevenueChart.tsx
│   └── *Modal.tsx
└── index.css
```

### Fluxo de Dados

1. **Componente** faz requisição HTTP
2. **API** retorna JSON
3. **Estado React** (useState) é atualizado
4. **Re-render** atualiza UI

**Exemplo**:
```typescript
const [leads, setLeads] = useState([]);

useEffect(() => {
  fetch('/api/leads')
    .then(r => r.json())
    .then(data => setLeads(data));
}, []);
```

---

## Backend

### Tecnologias

- [x] **Runtime**: Node.js 20+
- [x] **Framework**: Express.js (Arquitetura Modular)
- [x] **Linguagem**: JavaScript (ES Modules)
- [x] **Validação**: Zod
- [x] **Autenticação**: JSON Web Token (JWT)
- [x] **Email**: Nodemailer
- [x] **Upload**: Cloudinary via Multer
- [x] **Deploy**: Railway

### Estrutura de Arquivos

```
src/server/
├── app.js                    # Express App (Centralizador)
├── server.js                 # Entry point (Listen)
├── db.js                     # Neon Database connection
├── storage.js                # Cloudinary integration
├── routes/                   # Módulos de Rota
│   ├── users.js
│   ├── leads.js
│   ├── quotes.js
│   ├── projects.js
│   └── ...
├── middleware/               # Middlewares (Auth, etc.)
└── services/                 # Lógica de Negócio (Analytics, etc.)
```

### Módulos Principais

#### 1. Database (db.js)

Conexão com PostgreSQL (Neon) usando `pg`:

```javascript
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const query = (text, params) => pool.query(text, params);
```

#### 2. Storage (storage.js)

Cloudinary para gestão de mídia:

```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadFile(fileBuffer, options) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }).end(fileBuffer);
  });
}
```

#### 3. Notifications (notifications.js)

Sistema de notificações com SSE:

```javascript
export async function createNotification({ userId, type, title, message, link }) {
  await query(`
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES ($1, $2, $3, $4, $5)
  `, [userId, type, title, message, link]);
}
```

#### 4. Analytics (analytics.js)

Métricas de negócio:

```javascript
export async function getConversionRate() {
  const result = await query(`
    SELECT 
      COUNT(DISTINCT l.id) as total_leads,
      COUNT(DISTINCT p.id) as total_projects,
      ROUND((COUNT(DISTINCT p.id)::DECIMAL / COUNT(DISTINCT l.id)::DECIMAL) * 100, 2) as conversion_rate
    FROM leads l
    LEFT JOIN projects p ON l.id = p.lead_id
  `);
  return result.rows[0];
}
```

---

## Banco de Dados

### Tecnologia

- **SGBD**: PostgreSQL 14
- **Hospedagem**: Google Cloud SQL
- **Conexão**: SSL obrigatório

### Schema Principal

#### Tabela: users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: leads
```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'novo',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: quotes
```sql
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  client VARCHAR(255) NOT NULL,
  project VARCHAR(255) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'rascunho',
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: projects
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  stage VARCHAR(50) DEFAULT 'novo',
  lead_id INT REFERENCES leads(id),
  quote_id INT REFERENCES quotes(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: notifications
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  link VARCHAR(500),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

### Relacionamentos

```
leads (1) ──────> (N) quotes
  │
  └──────────────> (N) projects
                      │
                      └> (N) project_checklists

quotes (1) ──────> (N) quote_files
       (1) ──────> (1) projects

users (1) ───────> (N) notifications
```

---

## Segurança

### Autenticação

**JWT (JSON Web Tokens)**:
- Gerado no login
- Expira em 8 horas
- Armazenado em `localStorage`
- Enviado como `Authorization: Bearer {token}`

```javascript
const token = jwt.sign(
  { id: user.id, email: user.email },
  JWT_SECRET,
  { expiresIn: '8h' }
);
```

### Senha

**Bcrypt** com 10 rounds:
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Validação

**Zod schemas**:
```javascript
const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1)
});

leadSchema.parse(requestBody); // Valida ou lança erro
```

### Headers de Segurança

**Helmet.js**:
```javascript
app.use(helmet());
// Define headers:
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// X-XSS-Protection: 1; mode=block
```

### CORS

Permite requisições apenas de origens autorizadas:
```javascript
app.use(cors({
  origin: ['https://ffive.vercel.app'],
  credentials: true
}));
```

---

## Deploy

### Frontend (Vercel)

**Processo**:
1. Push para GitHub (branch `main`)
2. Vercel detecta mudança
3. Build automático (`npm run build`)
4. Deploy para CDN global
5. URL atualizada em ~2 minutos

**Variáveis de Ambiente**:
- `VITE_API_URL` - URL da API backend

### Backend (Cloud Run)

**Processo**:
3. Build automático (Railway Build System)
4. Deploy em containers
5. Auto-scaling e Health Checks

**Variáveis de Ambiente**:
- `DATABASE_URL` (Neon)
- `JWT_SECRET`
- `CLOUDINARY_URL` ou API Keys

---

## Performance

### Frontend

**Otimizações**:
- Vite build com tree-shaking
- Lazy loading de rotas
- Assets servidos por CDN (Vercel)
- Gzip compressão automática

**Lighthouse Score**: ~90+

### Backend

**Otimizações**:
- Conexão pool PostgreSQL
- Índices em colunas frequentes
- Queries otimizadas (N+1 evitado)
- SSE para notificações (não polling)

**Tempo de resposta médio**: <200ms

### Banco de Dados

**Índices criados**:
```sql
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

## Monitoramento

### Logs

**Cloud Run**:
- Logs automáticos de requisições
- Erros 500 rastreados
- Performance tracking

**Acesso**:
```bash
gcloud logging read "resource.type=cloud_run_revision"
```

### Métricas

**Google Cloud Monitoring**:
- CPU usage
- Memory usage
- Request count
- Latency

---

## Backup

### Banco de Dados

**Cloud SQL Automated Backups**:
- Diário às 3h AM
- Retenção: 7 dias
- Point-in-time recovery

### Arquivos

**Google Cloud Storage**:
- Versioning habilitado
- Replicação multi-regional
- 99.999999999% durabilidade

---

## Escalabilidade

### Horizontal

**Cloud Run** escala automaticamente:
- Mínimo: 0 instâncias (cold start)
- Máximo: 10 instâncias
- Auto-scaling baseado em CPU

### Vertical

**Cloud SQL** pode crescer:
- Atual: db-f1-micro (0.6GB RAM)
- Upgrade: db-n1-standard-1 (3.75GB RAM)
- Sem downtime

---

*Documentação atualizada em: 02/03/2026*  
*Versão: 2.0 (Refatoração Modular)*
