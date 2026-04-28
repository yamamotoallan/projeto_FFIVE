# Regras de Negócio - Marcenaria Pro

Sistema de gestão completo para marcenarias, integrando CRM, gestão de orçamentos, projetos e agendamento.

---

## 📋 Índice

1. [Módulo de Leads (CRM)](#leads)
2. [Módulo de Orçamentos](#orçamentos)
3. [Módulo de Projetos (Kanban)](#projetos)
4. [Módulo de Agenda](#agenda)
5. [Regras Gerais do Sistema](#regras-gerais)

---

## 🎯 Leads (CRM)

### Campos Obrigatórios
- **Nome**: Nome completo do cliente/lead
- **Projeto**: Descrição breve do projeto desejado

### Campos Opcionais
- **Telefone**: Para contato
- **Email**: Para envio de orçamentos
- **Fonte**: Como chegou até a marcenaria (Indicação, Site, Redes Sociais, etc.)

### Status Possíveis
1. **Novo**: Lead recém-criado, sem contato ainda
2. **Em Contato**: Primeiro contato realizado, aguardando resposta
3. **Qualificado**: Cliente confirmou interesse e orçamento foi solicitado
4. **Perdido**: Cliente desistiu ou não respondeu

### Regras
- Um lead sempre inicia com status "Novo"
- Alteração de status é livre (manual)
- Ao criar um orçamento para um lead, sugerir mudança para "Qualificado"
- Leads podem ter múltiplos orçamentos associados
- Data de "Última Ação" atualiza automaticamente ao mudar status ou criar orçamento

---

## 💰 Orçamentos (Quotes)

### Campos Obrigatórios
- **Cliente**: Nome do cliente (preenchido automaticamente se vier de um Lead)
- **Projeto**: Descrição do projeto a ser orçado
- **Valor**: Valor total do orçamento em R$
- **Data**: Data de emissão do orçamento

### Campos Opcionais
- **Validade**: Data até quando o orçamento é válido
- **Telefone**: Contato do cliente
- **Tipo de Projeto**: Móvel residencial, Corporativo, Reforma, etc.
- **Tipo de Serviço**: Sob medida, Modulado, Design exclusivo
- **Observações**: Detalhes adicionais

### Status Possíveis
1. **Pendente**: Orçamento criado, aguardando decisão do cliente
2. **Aprovado**: Cliente aceitou o orçamento
3. **Recusado**: Cliente recusou o orçamento
4. **Expirado**: Passou a data de validade

### Dados Financeiros (Opcionais)
- **Forma de Pagamento**: À vista, Parcelado, Cheque, Cartão, Transferência
- **Número de Parcelas**: Quantidade (se parcelado)
- **Valor de Entrada**: Sinal/entrada (se houver)
- **Data da 1ª Parcela**: Quando começa o parcelamento
- **Observações Financeiras**: Condições especiais

### Arquivos Anexados
- Permitido anexar múltiplos arquivos (plantas, fotos, referências)
- Tipos aceitos: PDF, imagens (JPG, PNG), documentos
- Armazenamento seguro com links de download temporários

### Regras
- Valor deve ser maior que zero
- Status inicial: "Pendente"
- Ao aprovar um orçamento, automaticamente criar um Projeto no Kanban
- Orçamento aprovado não pode voltar para "Pendente"
- Se orçamento tem data de validade e passou, sugerir mudança para "Expirado"
- Dados financeiros são opcionais mas recomendados para orçamentos aprovados

---

## 📊 Projetos (Kanban)

### Campos Obrigatórios
- **Título**: Nome do projeto
- **Cliente**: Nome do cliente
- **Valor**: Valor do projeto em R$

### Campos Opcionais
- **Prazo**: Data limite para conclusão
- **Prioridade**: Alta, Média, Baixa
- **Responsável**: Quem está conduzindo o projeto
- **Descrição**: Detalhes do projeto
- **Data de Início**: Quando o projeto começou

### Status (Colunas do Kanban)
1. **Refinamento**: Projeto em planejamento/definição
2. **Em Execução**: Projeto em produção
3. **Instalação**: Projeto sendo instalado no cliente
4. **Entregue**: Projeto finalizado

### Checklist de Tarefas
- Cada projeto pode ter múltiplas tarefas no checklist
- Tarefas podem ser marcadas como concluídas
- Progresso visual calculado automaticamente

### Regras
- Projeto criado automaticamente quando orçamento é aprovado
- Status inicial: "Refinamento"
- Valor deve coincidir com o orçamento aprovado que o originou
- Movimentação entre colunas é livre (drag-and-drop ou seleção manual)
- Ao mover para "Entregue", considerar projeto como concluído
- Checklist é opcional mas aju da no acompanhamento

---

## 📅 Agenda (Eventos)

### Campos Obrigatórios
- **Título**: Nome do evento/compromisso
- **Data/Hora Início**: Quando começa
- **Tipo**: Categoria do evento

### Campos Opcionais
- **Subtítulo**: Informação adicional
- **Data/Hora Fim**: Quando termina
- **Descrição**: Detalhes do compromisso
- **Lead Associado**: Vincular a um cliente/lead
- **Confirmado**: Se o cliente confirmou presença

### Tipos de Evento
1. **Medição**: Visita para tirar medidas
2. **Instalação**: Instalação do projeto no cliente
3. **Reunião**: Reunião com cliente ou equipe
4. **Orçamentos**: Apresentação de orçamento
5. **Oficina**: Trabalho na oficina

### Regras
- Não pode criar evento com data/hora no passado (exceto para histórico)
- Se houver hora de término, deve ser posterior à hora de início
- Eventos do mesmo dia aparecem agrupados na agenda
- Eventos podem ser reagendados (modificar data/hora)
- Ao associar a um Lead, facilita rastreamento de ações

---

## ⚙️ Regras Gerais do Sistema

### Autenticação e Segurança
- Todos os usuários devem fazer login
- Senhas armazenadas com hash bcrypt (10 rounds)
- Tokens JWT com validade de 8 horas
- Logout automático após expiração do token

### Permissões por Perfil
| Ação | Admin | Diretoria | Usuário |
|------|-------|-----------|---------|
| Criar/Editar Leads | ✅ | ✅ | ✅ |
| Criar/Editar Orçamentos | ✅ | ✅ | ✅ |
| Aprovar Orçamentos | ✅ | ✅ | ❌ |
| Gerenciar Projetos | ✅ | ✅ | ✅ |
| Gerenciar Agenda | ✅ | ✅ | ✅ |
| Gerenciar Usuários | ✅ | ❌ | ❌ |
| Ver Relatórios | ✅ | ✅ | ❌ |

### Notificações
- Sistema notifica sobre eventos próximos
- Notificações sobre orçamentos vencendo
- Alertas de projetos atrasados
- Notificações podem ser marcadas como lidas

### Logs de Auditoria
- Todas as ações importantes são registradas
- Registro de: quem fez, o que fez, quando fez
- Usado para rastreabilidade e segurança
- Exemplos: criação de orçamento, aprovação, mudança de status

### Validação de Dados
- Todos os inputs do usuário são validados
- Emails devem ter formato válido
- Valores monetários devem ser positivos
- Datas devem ser válidas e coerentes

### Integração entre Módulos

#### Lead → Orçamento
- Ao criar orçamento, pode selecionar um Lead existente
- Dados do Lead preenchem automaticamente o orçamento
- Fica vinculado para rastreamento

#### Orçamento → Projeto
- Orçamento aprovado cria projeto automaticamente
- Dados são copiados para o projeto
- Vínculo mantido para histórico

#### Lead/Projeto → Agenda
- Eventos podem ser associados a Leads ou Projetos
- Facilita ver compromissos relacionados a cada cliente

### Performance e Escalabilidade
- Paginação em todas as listagens longas
- Índices de banco para consultas rápidas
- Cache de dados estáticos
- Lazy loading de componentes pesados

### Backup e Recuperação
- Banco de dados: backup automático via Neon.tech (Point-in-Time Recovery)
- Arquivos: armazenamento persistente com redundância
- Logs: mantidos por 90 dias

---

## 🔄 Fluxo Típico de Uso

### 1. Captação de Cliente
```
Novo cliente → Criar Lead → Status: "Novo"
```

### 2. Qualificação
```
Entrar em contato → Atualizar status: "Em Contato"
Cliente interessado → Atualizar status: "Qualificado"
```

### 3. Orçamento
```
Criar Orçamento vinculado ao Lead
Anexar plantas/fotos
Preencher dados financeiros
Enviar orçamento ao cliente
```

### 4. Aprovação
```
Cliente aprova → Mudar status para "Aprovado"
Sistema cria Projeto automaticamente no Kanban
```

### 5. Execução
```
Projeto inicia em "Refinamento"
Adicionar tarefas no checklist
Mover para "Em Execução"
Marcar tarefas conforme conclusão
```

### 6 Agenda de Instalação
```
Criar evento tipo "Instalação"
Associar ao Projeto
Confirmar data com cliente
```

### 7. Entrega
```
Mover projeto para "Instalação"
Realizar instalação
Mover para "Entregue"
Projeto concluído
```

---

## 📊 Indicadores e Métricas

### Dashboard Principal
- Total de Leads ativos
- Orçamentos em aberto
- Projetos em andamento
- Eventos da semana

### Gráficos Disponíveis
- Acompanhamento de Leads por status
- Orçamentos por status (pizza)
- Projetos em cada fase do Kanban
- Taxa de conversão (Lead → Orçamento → Projeto)

### Filtros e Busca
- Filtrar por período
- Buscar por cliente
- Filtrar por status
- Ordenar por data, valor, prioridade

---

## 🚨 Regras de Exceção

### Orçamento Sem Lead
- É possível criar orçamento diretamente (sem Lead prévio)
- Útil para orçamentos rápidos ou clientes walk-in

### Projeto Manual
- Administradores podem criar projetos diretamente
- Não necessariamente vêm de um orçamento aprovado

### Eventos Passados
- Apenas leitura
- Não podem ser editados (preservar histórico)
- Exceção: Admin pode editar em casos especiais

### Cancelamento de Orçamento Aprovado
- Apenas Admin pode reverter
- Projeto associado deve ser excluído ou desvinculado

---

**Última atualização:** Janeiro 2026  
**Versão do Sistema:** 1.0.0
