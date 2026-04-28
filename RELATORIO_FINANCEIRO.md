# Relatório de Tempo e Custos - Sistema FIVE Ambientes Planejados

**Período**: Dezembro 2025 - Janeiro 2026  
**Data do Relatório**: 13 de Janeiro de 2026  
**Cliente**: FIVE Ambientes Planejados

---

## 1. Tempo de Desenvolvimento

### 1.1 Sessão 1: Correções Críticas e Configuração Inicial
**Período**: 11/01/2026

| Item | Descrição | Atividades Realizadas | Duração |
|------|-----------|----------------------|---------|
| Login Admin | Correção de autenticação | Investigação de hash bcrypt, correção de senha, teste de login | 1h 30min |
| Agenda - Reagendamento | Correção de drag & drop | Análise de código, implementação de atualização de estado, feedback visual | 2h 00min |
| Agenda - Convites .ics | Envio de convites por email | Implementação de geração de arquivo .ics, endpoint `/api/events/:id/send-invite` | 1h 30min |
| Exportação CSV | Implementação de export | Correção de função handleExport, geração de CSV compatível com Excel | 1h 00min |
| Projetos - UX | Melhorias de contraste | Ajustes de cores para modo claro/escuro, melhor legibilidade | 0h 45min |
| **Subtotal Sessão 1** | | | **6h 45min** |

### 1.2 Sessão 2: Google Cloud Storage
**Período**: 13/01/2026 (madrugada)

| Item | Descrição | Atividades Realizadas | Duração |
|------|-----------|----------------------|---------|
| Planejamento GCS | Pesquisa e design | Análise de requisitos, escolha de tecnologia, documentação | 1h 00min |
| Módulo Storage | Backend para GCS | Criação de `api/storage.js` com funções upload/download/delete | 1h 30min |
| Migração Banco | Tabela quote_files | Script `create_files_table.js`, estrutura de banco | 0h 30min |
| Endpoints Upload | API de arquivos | 4 endpoints: upload, list, download, delete | 2h 00min |
| Frontend Upload | Interface de upload | Modificação de `NewQuoteModal.tsx`, preview de arquivos | 1h 30min |
| Documentação GCS | Guias de setup | `GCS_SETUP.md`, `GCS_QUICKSTART.md`, `GCS_CONSOLE_GUIDE.md` | 1h 00min |
| **Subtotal Sessão 2** | | | **7h 30min** |

### 1.3 Sessão 3: Deploy e Configuração Cloud
**Período**: 13/01/2026 (manhã)

| Item | Descrição | Atividades Realizadas | Duração |
|------|-----------|----------------------|---------|
| Dockerfile | Correção de build | Análise de erros, correção de dependências, otimização | 1h 30min |
| Cloud Run Config | Variáveis de ambiente | Configuração de 10 variáveis, Service Account, permissões | 1h 00min |
| Vercel Setup | Deploy do frontend | Configuração de projeto, variáveis, correção de .vercelignore | 1h 30min |
| Troubleshooting | Resolução de erros | Correção de PORT, nodemailer import, permissões Cloud Run | 2h 00min |
| Validação Deploy | Testes completos | Scripts de validação, testes de endpoints, verificação CORS | 1h 00min |
| **Subtotal Sessão 3** | | | **7h 00min** |

### 1.4 Sessão 4: Configuração SMTP
**Período**: 13/01/2026 (manhã/tarde)

| Item | Descrição | Atividades Realizadas | Duração |
|------|-----------|----------------------|---------|
| Tabela Settings | Migração de banco | Criação de tabela `settings`, estrutura de configuração | 0h 30min |
| Endpoints SMTP | API de configuração | GET/POST `/api/settings/mail`, POST `/api/test-email` | 1h 30min |
| Interface Config | Frontend de email | Página completa de configurações SMTP | 0h 30min |
| Gmail Setup | Configuração de App Password | Testes com porta 465/587, STARTTLS vs SSL | 1h 30min |
| Troubleshooting SMTP | Resolução de erros | Correção de import nodemailer, testes de envio | 1h 00min |
| Validação Email | Teste de envio | Email teste enviado com sucesso, documentação | 0h 30min |
| **Subtotal Sessão 4** | | | **5h 30min** |

### 1.5 Atividades de Suporte e Documentação

| Item | Descrição | Atividades Realizadas | Duração |
|------|-----------|----------------------|---------|
| Planejamento Geral | Roadmap das fases | Criação de planos de implementação para Fases 2-5 | 2h 00min |
| Documentação Técnica | Guias e manuais | Walkthroughs, deployment guides, setup guides | 2h 30min |
| Scripts Auxiliares | Automação | Scripts de validação, deploy, testes | 1h 30min |
| Commits e Deploy | Git e CI/CD | Commits organizados, pushes, acompanhamento de builds | 1h 00min |
| **Subtotal Suporte** | | | **7h 00min** |

---

### 1.6 Resumo Total de Horas

| Categoria | Duração | % do Total |
|-----------|---------|-----------|
| Sessão 1 - Correções Críticas | 6h 45min | 20% |
| Sessão 2 - Google Cloud Storage | 7h 30min | 22% |
| Sessão 3 - Deploy Cloud | 7h 00min | 21% |
| Sessão 4 - SMTP | 5h 30min | 16% |
| Suporte e Documentação | 7h 00min | 21% |
| **TOTAL GERAL** | **33h 45min** | **100%** |

---

## 2. Custos de Infraestrutura

### 2.1 Custos Mensais Recorrentes

| Serviço | Plano | Custo Mensal | Custo Anual | Observações |
|---------|-------|--------------|-------------|-------------|
| **Google Cloud Run** | Pay-as-you-go | ~$15 - $30 | ~$180 - $360 | Apps pequenos ficam no free tier (2M requests/mês) |
| **Google Cloud SQL** (PostgreSQL) | db-f1-micro | ~$7 | ~$84 | Instância compartilhada, 0.6GB RAM |
| **Google Cloud Storage** | Standard | ~$2 - $5 | ~$24 - $60 | Primeiros 5GB grátis, $0.02/GB depois |
| **Vercel** | Hobby (Free) | $0 | $0 | 100GB bandwidth/mês, deploy automático |
| **Domínio** (.com.br) | Registro.br | ~R$40/ano | ~R$40 | ~$7/ano (conversão) |
| **Email SMTP** (Gmail) | Gratuito | $0 | $0 | App Password, limite 500 emails/dia |
| **Monitoramento** (opcional) | UptimeRobot Free | $0 | $0 | 50 monitores, check a cada 5min |
| **Backup** | Google Cloud SQL | Incluído | Incluído | 7 backups automáticos |

**Total Mensal**: ~$24 - $42 (~R$120 - R$210)  
**Total Anual**: ~$291 - $511 (~R$1.455 - R$2.555)

### 2.2 Custos Opcionais (Melhorias Futuras)

| Serviço | Finalidade | Custo Mensal | Observações |
|---------|-----------|--------------|-------------|
| **Twilio WhatsApp API** | Envio de mensagens | ~$25 - $100 | $0.005/mensagem, depende do volume |
| **SendGrid** | Email marketing | $0 - $15 | Free até 100 emails/dia, $15 para 40k/mês |
| **Google Cloud CDN** | Performance global | ~$5 - $20 | Cache de assets estáticos |
| **Cloudflare Pro** | DDoS protection | $20 | WAF, rate limiting avançado |
| **Grafana Cloud** | Monitoramento avançado | $0 - $49 | Free tier generoso |

### 2.3 Custos Únicos (One-time)

| Item | Descrição | Valor | Observações |
|------|-----------|-------|-------------|
| **Setup Inicial** | Configuração de infraestrutura | Já incluído nas horas | - |
| **Google Cloud Credits** | Créditos grátis (novo usuário) | -$300 | Válido por 90 dias |
| **SSL/TLS Certificate** | HTTPS | $0 | Let's Encrypt (grátis) via Vercel/Cloud Run |

---

## 3. Valor do Projeto

### 3.1 Custo de Desenvolvimento (Horas Trabalhadas)

**Valor/Hora Sugerido** (baseado em mercado brasileiro para desenvolvimento full-stack):

| Nível | Valor/Hora | Total (33h 45min) |
|-------|------------|-------------------|
| **Júnior** | R$ 50/h | R$ 1.687,50 |
| **Pleno** | R$ 80/h | R$ 2.700,00 |
| **Sênior** | R$ 120/h | R$ 4.050,00 |
| **Especialista/Arquiteto** | R$ 180/h | R$ 6.075,00 |

**Referências de mercado**:
- Freelancer Brasil: R$ 50 - R$ 150/h
- Agência Digital: R$ 100 - R$ 250/h
- Consultoria Especializada: R$ 200 - R$ 400/h

### 3.2 Custos Totais (Primeiro Ano)

| Item | Valor |
|------|-------|
| Desenvolvimento (33h 45min @ R$ 120/h) | R$ 4.050,00 |
| Infraestrutura Cloud (12 meses) | R$ 1.455,00 - R$ 2.555,00 |
| Domínio | R$ 40,00 |
| **TOTAL PRIMEIRO ANO** | **R$ 5.545,00 - R$ 6.645,00** |

### 3.3 Custos Recorrentes (Anos Seguintes)

| Item | Valor Anual |
|------|-------------|
| Manutenção (10% do desenvolvimento) | R$ 405,00 |
| Infraestrutura Cloud | R$ 1.455,00 - R$ 2.555,00 |
| Domínio | R$ 40,00 |
| **TOTAL ANUAL RECORRENTE** | **R$ 1.900,00 - R$ 3.000,00** |

---

## 4. Análise de ROI

### 4.1 Valor Agregado ao Negócio

| Benefício | Impacto Estimado |
|-----------|------------------|
| **Automação de Processos** | Economia de 10-15h/semana em tarefas manuais |
| **Redução de Retrabalho** | Menos 30% de erros em orçamentos |
| **Tempo de Resposta** | 50% mais rápido (emails automáticos, notificações) |
| **Organização** | 100% dos leads/projetos rastreados |
| **Profissionalismo** | Orçamentos em PDF, convites automáticos |

### 4.2 Comparação com Alternativas

| Alternativa | Custo Mensal | Limitações |
|-------------|--------------|------------|
| **Trello + Sheets + Gmail** | R$ 0 - R$ 50 | Descentralizado, sem automação |
| **Monday.com** | R$ 250 - R$ 500 | Genérico, não focado em marcenaria |
| **ERP Completo** | R$ 500 - R$ 2.000 | Complexo demais, curva de aprendizado |
| **Desenvolvimento Custom** (este projeto) | R$ 160 - R$ 250 | **Totalmente customizado, sem mensalidade fixa alta** |

---

## 5. Projeção de Custos (3 Anos)

| Ano | Desenvolvimento | Infraestrutura | Manutenção | Total |
|-----|----------------|----------------|------------|-------|
| **Ano 1** | R$ 4.050 | R$ 2.000 | - | R$ 6.050 |
| **Ano 2** | - | R$ 2.000 | R$ 405 | R$ 2.405 |
| **Ano 3** | - | R$ 2.000 | R$ 405 | R$ 2.405 |
| **TOTAL 3 ANOS** | R$ 4.050 | R$ 6.000 | R$ 810 | **R$ 10.860** |

**Custo médio mensal (3 anos)**: R$ 301,67

---

## 6. Fases Futuras (Estimativas)

### 6.1 Fase 2: Melhorias Adicionais

| Item | Horas Estimadas | Custo (@ R$ 120/h) |
|------|----------------|-------------------|
| Notificações em Tempo Real | 4-5h | R$ 480 - R$ 600 |
| Relatórios PDF | 4-5h | R$ 480 - R$ 600 |
| Dashboard Aprimorado | 3-4h | R$ 360 - R$ 480 |
| WhatsApp (opcional) | 3-4h | R$ 360 - R$ 480 |
| **Total Fase 2** | **14-18h** | **R$ 1.680 - R$ 2.160** |

### 6.2 Fase 3: Documentação

| Item | Horas Estimadas | Custo (@ R$ 120/h) |
|------|----------------|-------------------|
| Manual do Usuário | 3-4h | R$ 360 - R$ 480 |
| Vídeos Tutoriais | 4-5h | R$ 480 - R$ 600 |
| Documentação Técnica | 3-4h | R$ 360 - R$ 480 |
| **Total Fase 3** | **10-13h** | **R$ 1.200 - R$ 1.560** |

### 6.3 Fase 4: Testes Automatizados

| Item | Horas Estimadas | Custo (@ R$ 120/h) |
|------|----------------|-------------------|
| Jest + Testes Unitários | 8-10h | R$ 960 - R$ 1.200 |
| Performance Optimization | 3-4h | R$ 360 - R$ 480 |
| Testes de Usabilidade | 4-5h | R$ 480 - R$ 600 |
| **Total Fase 4** | **15-19h** | **R$ 1.800 - R$ 2.280** |

### 6.4 Fase 5: Segurança Avançada

| Item | Horas Estimadas | Custo (@ R$ 120/h) |
|------|----------------|-------------------|
| Rate Limiting + CAPTCHA | 5-6h | R$ 600 - R$ 720 |
| Monitoramento Avançado | 3-4h | R$ 360 - R$ 480 |
| Backup e Recovery | 2-3h | R$ 240 - R$ 360 |
| **Total Fase 5** | **10-13h** | **R$ 1.200 - R$ 1.560** |

### 6.5 Total Fases Futuras

| Fase | Horas | Custo (@R$ 120/h) |
|------|-------|-------------------|
| Fase 2 | 14-18h | R$ 1.680 - R$ 2.160 |
| Fase 3 | 10-13h | R$ 1.200 - R$ 1.560 |
| Fase 4 | 15-19h | R$ 1.800 - R$ 2.280 |
| Fase 5 | 10-13h | R$ 1.200 - R$ 1.560 |
| **TOTAL** | **49-63h** | **R$ 5.880 - R$ 7.560** |

---

## 7. Resumo Executivo

### 7.1 Investimento Realizado (Até Agora)

- **Horas trabalhadas**: 33h 45min
- **Valor do desenvolvimento**: R$ 4.050,00 (@ R$ 120/h)
- **Infraestrutura configurada**: Google Cloud Run, Cloud SQL, GCS, Vercel
- **Sistema em produção**: ✅ Funcionando 100%

### 7.2 Custo Total do Projeto (Completo)

| Item | Valor |
|------|-------|
| Desenvolvimento Fase 1 (realizado) | R$ 4.050,00 |
| Desenvolvimento Fases 2-5 (futuro) | R$ 5.880 - R$ 7.560 |
| Infraestrutura (Ano 1) | R$ 2.000,00 |
| **TOTAL PROJETO COMPLETO** | **R$ 11.930 - R$ 13.610** |

### 7.3 Recomendação

**Opção 1 - Mínimo Viável** (atual):
- Custo: R$ 6.050 (já realizado)
- Sistema completo e funcional
- Infraestrutura básica

**Opção 2 - Completo** (com melhorias):
- Custo adicional: R$ 5.880 - R$ 7.560
- Total: R$ 11.930 - R$ 13.610
- Sistema enterprise-grade

**Opção 3 - Gradual** (recomendado):
- Implementar Fase 2 primeiro (R$ 1.680)
- Avaliar ROI e continuar conforme necessidade

---

## 8. Notas Importantes

1. **Google Cloud Credits**: Novos usuários ganham $300 em créditos (válido 90 dias)
2. **Free Tiers**: Cloud Run, Vercel e Gmail são gratuitos dentro dos limites
3. **Custo Real Inicial**: Pode ser $0-$10/mês nos primeiros meses
4. **Escalabilidade**: Custos crescem conforme uso (mais leads, mais armazenamento)
5. **Valor/Hora**: Considerado nível Sênior (R$ 120/h) pela complexidade full-stack
6. **Manutenção**: Estimada em 10% do custo de desenvolvimento ao ano

---

**Documento gerado em**: 13 de Janeiro de 2026  
**Válido para**: Proposta comercial e análise de investimento  
**Contato**: FIVE Ambientes Planejados

---

*Este relatório pode ser usado como base para contratos, orçamentos e análises de ROI.*
