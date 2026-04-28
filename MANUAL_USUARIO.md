# Manual do Usuário - Sistema FIVE Ambientes Planejados

**Versão**: 1.0  
**Data**: Janeiro de 2026

---

## 📖 Índice

1. [Introdução](#introdução)
2. [Primeiros Passos](#primeiros-passos)
3. [Dashboard](#dashboard)
4. [Gestão de Leads](#gestão-de-leads)
5. [Orçamentos](#orçamentos)
6. [Projetos (Kanban)](#projetos-kanban)
7. [Agenda](#agenda)
8. [Scripts de Atendimento](#scripts-de-atendimento)
9. [Configurações](#configurações)
10. [FAQ](#faq)

---

## Introdução

O **Sistema FIVE Ambientes Planejados** é uma plataforma completa de gestão para empresas de marcenaria e ambientes planejados. Centralize leads, orçamentos, projetos e agenda em um único lugar.

### Principais Funcionalidades

✅ Gestão de leads com histórico  
✅ Criação de orçamentos com upload de arquivos  
✅ Kanban visual de projetos  
✅ Agenda com reagendamento drag & drop  
✅ Notificações em tempo real  
✅ Analytics de negócio  
✅ Scripts prontos de atendimento  
✅ Auditoria completa de ações

---

## Primeiros Passos

### 1. Acesso ao Sistema

**URL**: https://ffive.vercel.app

**Login Padrão**:
- Email: `admin@marcenaria.pro`
- Senha: `123`

> **⚠️ IMPORTANTE**: Altere a senha na primeira utilização!

### 2. Navegação

O menu lateral contém todas as seções:
- 🏠 Dashboard - Visão geral
- 📅 Agenda - Compromissos
- 👥 Leads - Clientes potenciais
- 📄 Orçamentos - Propostas
- 📋 Projetos - Kanban
- 📝 Scripts - Textos prontos
- 👤 Perfil - Seus dados
- ⚙️ Configurações - Sistema

---

## Dashboard

O **Dashboard** é sua central de controle. Aqui você vê:

### Métricas Principais

**Taxa de Conversão**  
Porcentagem de leads que viram projetos. Meta: >30%

**Tempo Médio**  
Dias entre lead e fechamento. Meta: <15 dias

**Ticket Médio**  
Valor médio dos projetos aprovados

**Novos Leads**  
Quantidade de leads nos últimos 30 dias com tendência

### Funil de Vendas

Visualização de 4 etapas:
1. **Leads** - Contatos iniciais
2. **Orçamentos** - Propostas enviadas
3. **Aprovados** - Orçamentos aceitos
4. **Projetos** - Em execução

### Gráfico de Faturamento

Faturamento mensal dos últimos 6 meses para análise de sazonalidade.

### Ações Rápidas

**➕ Adicionar Compromisso**  
Novo evento na agenda

**➕ Novo Lead**  
Cadastrar cliente potencial

**➕ Criar Orçamento**  
Nova proposta comercial

---

## Gestão de Leads

### Como Criar um Lead

1. Clique em **"Novo Lead"** (botão verde +)
2. Preencha:
   - **Nome** *
   - **Telefone** *
   - **Email**
   - **Origem** (Ex: Instagram, Indicação, Google)
   - **Observações**
3. Clique em **"Adicionar Lead"**

> **Campos obrigatórios** estão marcados com *

### Visualizar Detalhes

Clique em qualquer lead da lista para abrir o painel lateral.

**Informações disponíveis**:
- Dados de contato
- Data de cadastro
- Última interação
- Status atual
- Histórico de ações

### Adicionar Interação

No painel do lead:
1. Digite a interação no campo de texto
2. Clique em **"Adicionar Interação"**
3. Histórico é salvo automaticamente

**Exemplos de interações**:
- "Cliente interessado em cozinha planejada 12m²"
- "Ligar novamente segunda-feira 15h"
- "Orçamento enviado por WhatsApp"

### Criar Orçamento para o Lead

1. Abra o painel do lead
2. Clique em **"Criar Orçamento"**
3. Preencha os dados do orçamento
4. Orçamento fica vinculado ao lead

### Atualizar Status

Na lista de leads, clique no **dropdown de status**:
- 🆕 Novo
- 📞 Contato Feito
- 💬 Negociação
- ✅ Convertido
- ❌ Perdido

---

## Orçamentos

### Criar Novo Orçamento

1. Clique em **"Novo Orçamento"**
2. Preencha:
   - **Cliente** *
   - **Projeto** (tipo de trabalho) *
   - **Valor** *
   - **Data**
   - **Descrição**
3. **Anexar arquivos** (plantas, fotos, medidas)
4. Clique em **"Criar"**

### Upload de Arquivos

Você pode anexar:
- PDFs (plantas, contratos)
- Imagens (fotos do local)
- Planilhas (medidas, materiais)

**Limite**: 10MB por arquivo

**Como anexar**:
1. Clique em "Escolher arquivo"
2. Selecione arquivo
3. Upload automático para Google Cloud

### Baixar Arquivos

1. Acesse orçamento
2. Na lista de arquivos, clique em **Download**
3. Arquivo é baixado automaticamente

### Filtros e Busca

**Filtrar por status**:
- 📝 Rascunho
- ⏳ Em Análise
- ✅ Aprovado
- ❌ Rejeitado

**Buscar**: Digite nome do cliente ou projeto

### Exportar para Excel

1. Clique em **"Exportar"**
2. Escolha formato (CSV ou Excel)
3. Planilha será baixada

---

## Projetos (Kanban)

### Visão Kanban

Os projetos são organizados em **8 etapas visuais**:

1. **Novo** - Projeto recém-criado
2. **Medições** - Agendando medição
3. **Desenho** - Criação do projeto
4. **Aprovação** - Cliente aprovando
5. **Produção** - Fabricação
6. **Montagem** - Instalação
7. **Finalizado** - Concluído
8. **Pós-venda** - Garantia/ajustes

### Mover Projeto

**Arrastar e soltar**:
- Clique e segure o card do projeto
- Arraste para a coluna desejada
- Solte para confirmar

**Ou pelo modal**:
1. Clique no projeto
2. Selecione nova etapa no dropdown
3. Salvar

### Checklists

Cada projeto tem checklist personalizado:

**Exemplo - Etapa de Medições**:
- [ ] Agendar visita
- [ ] Confirmar com cliente
- [ ] Tirar fotos
- [ ] Coletar medidas

**Como usar**:
1. Abra projeto
2. Marque/desmarque itens
3. Progresso é salvo automaticamente

### Adicionar Nota

1. Abra projeto
2. Digite observação
3. Clique em **"Adicionar Nota"**

---

## Agenda

### Visualização Semanal

A agenda mostra compromissos de 7 dias (seg-dom).

**Cores por tipo**:
- 🔵 Reunião - Azul
- 📞 Ligação - Verde
- 🏠 Visita - Roxo
- ⏰ Lembrete - Amarelo

### Adicionar Compromisso

1. Clique em **"+ Adicionar Compromisso"**
2. Preencha:
   - **Título** *
   - **Data e Hora** *
   - **Tipo**
   - **Local**
   - **Observações**
3. Clique em **"Salvar"**

### Reagendar (Drag & Drop)

1. Clique e segure o compromisso
2. Arraste para novo dia/horário
3. Solte para confirmar
4. Modal de confirmação abre
5. Confirme a nova data

### Enviar Convite

1. Abra compromisso
2. Clique em **"Enviar Convite"**
3. Convite `.ics` é enviado por email
4. Cliente pode adicionar ao Google Calendar

---

## Scripts de Atendimento

### Biblioteca de Scripts

Textos prontos para agilizar atendimento.

**Categorias disponíveis**:
- Saudação
- Aprovação
- Follow-up
- Encerramento

### Usar um Script

1. Selecione categoria
2. Escolha script
3. Clique para copiar
4. Cole no WhatsApp/Email

### Criar Novo Script

1. Clique em **"+ Novo Script"**
2. Preencha:
   - **Título**
   - **Categoria**
   - **Conteúdo**
3. Salvar

### Assistente de IA

**Sugestões automáticas**:
1. Digite contexto (ex: "cliente interessado em cozinha")
2. IA sugere resposta pronta
3. Edite se necessário
4. Use!

---

## Configurações

### Perfil

**Editar dados pessoais**:
- Nome completo
- Email
- Telefone
- Foto de perfil

**Trocar senha**:
1. Senha atual
2. Nova senha
3. Confirmar nova senha

**2FA (Autenticação em 2 fatores)**:
- Ativar para maior segurança
- Use Google Authenticator

### Email (SMTP)

Configure servidor de email:
1. Acesse **Configurações** → **Email**
2. Preencha:
   - Servidor SMTP (ex: smtp.gmail.com)
   - Porta (587 para TLS)
   - Usuário
   - Senha (App Password)
3. **Salvar e Testar**

**Gmail**: Use App Password (não senha normal)

### Auditoria de Logs

Veja histórico de todas ações:
- Quem fez
- O que fez
- Quando
- Detalhes

**Filtros**:
- Por usuário
- Por tipo de ação
- Por período

---

## FAQ

### Como exporto meus dados?

Use a função **Exportar** na tela de orçamentos para gerar planilhas Excel.

### Posso acessar de qualquer lugar?

Sim! O sistema é 100% web. Acesse de computador, tablet ou celular.

### Os arquivos ficam armazenados onde?

Google Cloud Storage (seguro e criptografado).

### Posso ter múltiplos usuários?

Sim. Acesse **Configurações** → **Usuários** para adicionar.

### Como faço backup?

O sistema faz backup automático diário do banco de dados no Google Cloud.

### O que é a taxa de conversão?

Porcentagem de leads que viraram projetos fechados. Quanto maior, melhor!

### Posso personalizar os checklists?

Atualmente os checklists são padrão por etapa. Personalização virá em próxima versão.

### Como recebo notificações?

Notificações aparecem no sino 🔔 no topo da tela em tempo real.

### Suporta integração com WhatsApp?

Sim! Configure em **Configurações** → **WhatsApp** (requer API).

---

## Troubleshooting

### Não consigo fazer login

1. Verifique email e senha
2. Use "Esqueci minha senha"
3. Contate suporte se persistir

### Arquivo não faz upload

1. Verifique tamanho (<10MB)
2. Formatos aceitos: PDF, JPG, PNG, XLSX
3. Tente novamente

### Notificações não aparecem

1. Atualize a página (F5)
2. Verifique conexão de internet
3. Limpe cache do navegador

### Gráficos não carregam

1. Aguarde alguns segundos
2. Verifique se há dados cadastrados
3. Recarregue a página

---

## Suporte

**Email**: suporte@fiveambientes.com.br  
**WhatsApp**: (11) 99999-9999  
**Horário**: Segunda a Sexta, 9h-18h

---

*Manual atualizado em: 13/01/2026*  
*Versão do Sistema: 1.0*
