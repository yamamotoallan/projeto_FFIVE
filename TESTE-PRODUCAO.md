# Guia de Teste - Correções em Produção

## 🌐 Acesso
**URL**: https://gest-o-agenda-marcenaria.vercel.app  
**Login**: admin@marcenaria.pro  
**Senha**: 123

---

## ✅ Teste 1: Orçamentos Persistem no Lead

### Passos:
1. Fazer login
2. Ir em **Leads**
3. Clicar em qualquer lead
4. No painel lateral, clicar **"+ Novo"** em Orçamentos
5. Preencher:
   - Cliente: (auto-preenchido do lead)
   - Telefone: (11) 98765-4321
   - Projeto: Cozinha Premium
   - **Tipo**: Banheiro
   - **Serviço**: Reforma
   - Valor: 8500
   - Observações: Teste de persistência
6. Clicar **"Criar Orçamento"**
7. ✅ Toast verde aparece
8. ✅ Orçamento aparece na lista do lead
9. **REFRESH DA PÁGINA** (F5)
10. Clicar no mesmo lead novamente

### ✅ Resultado Esperado:
- Orçamento **ainda aparece** na lista
- Dados estão corretos

---

## ✅ Teste 2: Dados Reais Salvos

### Passos:
1. Ir em **Orçamentos** (menu lateral)
2. Encontrar o orçamento criado no Teste 1
3. Clicar para abrir detalhes

### ✅ Resultado Esperado:
- Tipo: Banheiro ✅
- Serviço: Reforma ✅
- Telefone: (11) 98765-4321 ✅
- **NÃO** aparece "Armário Inferior Cozinha"
- **NÃO** aparece "R$ 4.200,00" mockado

---

## ✅ Teste 3: Mockups Removidos

### Passos:
1. Ainda em Orçamentos
2. Abrir qualquer orçamento
3. Rolar até **"Arquivos do Projeto"**

### ✅ Resultado Esperado:
- **NÃO** aparece "Planta_Baixa_v2.pdf"
- **NÃO** aparece "Render_Cozinha_01.jpg"
- Se não houver arquivos → mostra apenas botão "Adicionar Arquivo"

---

## 📸 O Que Verificar

### ✅ Funcionando:
- Toast verde após criar orçamento
- Orçamento persiste após F5
- Tipo projeto e serviço corretos
- Sem arquivos mockados

### ❌ Se algo falhar:
- Print da tela
- Erro no console (F12)
- Me avise para investigar

---

## ⏱️ Deploy Status

- **Último commit**: 7e2b531 (Mockups removidos)
- **Branch**: main
- **Deploy**: ~3-5 minutos após último push
- **Vercel**: Auto-deploy ativo

**Aguarde 3-5min após 14:35 para testar!**
