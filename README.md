# Marcenaria Pro 🪵

> Sistema completo de gestão para marcenarias - CRM, Orçamentos, Projetos e Agenda

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)
[![Database](https://img.shields.io/badge/Database-Neon.tech-green)](https://neon.tech)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📋 Sobre o Projeto

**Marcenaria Pro** é um sistema web moderno e completo para gestão de marcenarias, desenvolvido com React, TypeScript e Node.js. Integra todos os processos do negócio em uma única plataforma intuitiva.

### 🎯 Funcionalidades Principais

- **🎯 CRM de Leads**: Gestão completa de clientes potenciais
- **💰 Orçamentos**: Criação e acompanhamento de propostas comerciais
- **📊 Kanban de Projetos**: Visualização e controle de projetos em execução
- **📅 Agenda**: Agendamento de medições, instalações e reuniões
- **📈 Dashboard**: Métricas e indicadores de desempenho
- **👥 Multi-usuário**: Controle de acesso por perfis (Admin, Diretoria, Usuário)
- **🔒 Seguro**: Autenticação JWT e criptografia de senhas

---

## 🚀 Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build e dev server)
- **TailwindCSS** (estilização)
- **React Router** (navegação)
- **Recharts** (gráficos)
- **Lucide React** (ícones)

### Backend
- **Node.js** + **Express**
- **PostgreSQL** (banco de dados)
- **JWT** (autenticação)
- **Bcrypt** (criptografia de senhas)
- **Zod** (validação de dados)

### Infraestrutura
- **Frontend**: Vercel
- **Backend API**: Vercel Serverless Functions
- **Database**: Neon.tech (PostgreSQL serverless)
- **Storage**: Google Cloud Storage (opcional, para arquivos)

---

## 📦 Instalação e Configuração

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no [Neon.tech](https://neon.tech) (banco de dados)

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/marcenaria-pro.git
cd marcenaria-pro
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

**Variáveis obrigatórias no `.env`:**

```env
# Banco de dados Neon.tech
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Chave secreta JWT (mínimo 32 caracteres)
JWT_SECRET=sua_chave_super_secreta_aqui_64_caracteres_minimo

# Ambiente
NODE_ENV=development
```

> 💡 **Dica**: Gere um JWT_SECRET seguro com:  
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 4. Configure o Banco de Dados

#### 4.1 Criar Projeto no Neon.tech

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Crie um novo projeto
3. Escolha a região mais próxima (ex: São Paulo)
4. Copie a **Connection String**

#### 4.2 Criar Tabelas

Execute o script SQL para criar todas as tabelas:

```bash
# Se tiver psql instalado:
psql $DATABASE_URL -f recreate_neon_database.sql

# OU use o SQL Editor no dashboard do Neon
# Copie e cole o conteúdo de recreate_neon_database.sql
```

#### 4.3 Criar Usuário Admin

```bash
node api/fix_admin_user.js
```

**Credenciais padrão:**
- Email: `admin@marcenaria.pro`
- Senha: `123`

> ⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

---

## 🏃 Rodando o Projeto

### Desenvolvimento Local

Execute frontend e backend simultaneamente:

```bash
# Terminal 1: Backend (API)
node api/index.js

# Terminal 2: Frontend
npm run dev
```

Acesse: **http://localhost:5173**

### Build para Produção

```bash
npm run build
```

Os arquivos serão gerados em `dist/`.

---

## 🌐 Deploy (Vercel)

### 1. Frontend + Backend API

1. Faça push do código para GitHub
2. Importe o projeto no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente:

```env
DATABASE_URL=<sua_connection_string_neon>
JWT_SECRET=<sua_chave_secreta>
NODE_ENV=production
```

4. Deploy automático! ✅

### 2. Atualizar DATABASE_URL do Neon

No Vercel Dashboard:
1. Settings → Environment Variables
2. Adicione `DATABASE_URL` com a connection string do Neon
3. Redeploy

---

## 📚 Documentação Adicional

- **[BUSINESS_RULES.md](./BUSINESS_RULES.md)** - Regras de negócio detalhadas
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Endpoints da API
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura do sistema
- **[SECURITY.md](./SECURITY.md)** - Práticas de segurança
- **[VERCEL_WARNINGS.md](./VERCEL_WARNINGS.md)** - Avisos de dependências

---

## 🗂️ Estrutura do Projeto

```
marcenaria-pro/
├── api/                      # Backend (API)
│   ├── index.js             # Servidor Express principal
│   ├── db.js                # Configuração do banco
│   ├── storage.js           # Upload de arquivos (GCS)
│   ├── notifications.js     # Sistema de notificações
│   └── rateLimit.js         # Rate limiting
│
├── src/                      # Frontend (React)
│   ├── components/          # Componentes reutilizáveis
│   ├── pages/               # Páginas da aplicação
│   ├── context/             # Context API (estado global)
│   └── utils/               # Funções utilitárias
│
├── public/                   # Assets estáticos
├── .env                      # Variáveis de ambiente (não commitado)
├── .env.example              # Template de variáveis
├── package.json              # Dependências do projeto
├── vite.config.ts            # Configuração do Vite
└── recreate_neon_database.sql # Script de criação do banco

```

---

## 🔐 Segurança

- ✅ Senhas criptografadas com **Bcrypt** (10 rounds)
- ✅ Autenticação via **JWT** (tokens de 8 horas)
- ✅ Rate limiting em rotas sensíveis
- ✅ Validação de inputs com **Zod**
- ✅ CORS configurado
- ✅ Helmet.js para headers de segurança
- ✅ SSL obrigatório no banco de dados (Neon.tech)

---

## 👥 Perfis de Usuário

| Perfil | Permissões |
|--------|-----------|
| **Admin** | Acesso total ao sistema, gerenciar usuários, ver relatórios |
| **Diretoria** | Aprovar orçamentos, ver relatórios, gerenciar leads/projetos |
| **Usuário** | Criar e editar leads, orçamentos e projetos (sem aprovações) |

---

## 🐛 Troubleshooting

### Erro de Conexão com Banco

```
Error: connect ECONNREFUSED
```

**Solução**: Verifique se a `DATABASE_URL` está correta no `.env`

### Frontend não conecta ao Backend

**Solução**: Certifique-se de que:
1. O backend está rodando (`node api/index.js`)
2. O proxy está configurado no `vite.config.ts`
3. A porta não está ocupada (padrão: 3000)

### Erro 401 no Login

**Solução**:
1. Recrie o usuário admin: `node api/fix_admin_user.js`
2. Verifique se as credenciais estão corretas

---

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia Vite dev server
npm run start:api    # Inicia servidor backend

# Build
npm run build        # Build de produção

# Testes
npm run preview      # Preview do build de produção
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Minha nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 💬 Suporte

- 📧 Email: suporte@marcenaria.pro
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/marcenaria-pro/issues)
- 📖 Documentação: [Wiki do Projeto](https://github.com/seu-usuario/marcenaria-pro/wiki)

---

## 🙏 Agradecimentos

- [Neon.tech](https://neon.tech) - Banco de dados serverless PostgreSQL
- [Vercel](https://vercel.com) - Hospedagem e deploy
- Comunidade open source

---

**Desenvolvido com ❤️ para modernizar a gestão de marcenarias**
