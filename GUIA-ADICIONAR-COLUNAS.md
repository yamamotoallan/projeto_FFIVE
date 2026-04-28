# Guia: Adicionar Colunas na Tabela Quotes

## 🎯 Objetivo
Adicionar 4 colunas faltantes na tabela `quotes` para que os orçamentos possam salvar todos os dados.

---

## 📍 Passo a Passo

### 1️⃣ Abrir Google Cloud Console
1. Acesse: https://console.cloud.google.com/sql
2. Faça login com sua conta Google
3. Você verá a lista de instâncias SQL

### 2️⃣ Selecionar sua Instância
1. Clique na instância **marcenariapro** (ou nome da sua instância)
2. Aguarde carregar a página de detalhes

### 3️⃣ Abrir Query Editor
1. No menu lateral esquerdo, procure por **"Studio"** ou **"Query"**
2. Clique em **"Open query editor"** ou **"Abrir editor de consultas"**
3. Uma nova aba/janela vai abrir

**OU**

1. No topo da página, clique em **"OPEN IN CLOUD SHELL"** (ícone de terminal)
2. Aguarde o Cloud Shell abrir
3. Digite: `gcloud sql connect marcenariapro --user=postgres`
4. Digite a senha quando solicitado

### 4️⃣ Executar os Comandos SQL

**No Query Editor (opção mais fácil)**:

1. **Cole este código** (tudo de uma vez):

```sql
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS project_type VARCHAR(100);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS service_type VARCHAR(100);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS notes TEXT;
```

2. Clique no botão **"RUN"** (ou "EXECUTAR") - botão azul no topo
3. Aguarde a execução (deve aparecer "Query successful" ou "Success")

### 5️⃣ Verificar se Funcionou

Execute esta query para confirmar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
ORDER BY ordinal_position;
```

**Resultado esperado**: Deve aparecer nas linhas:
- `project_type` | `character varying`
- `service_type` | `character varying`
- `phone` | `character varying`
- `notes` | `text`

---

## ✅ Pronto!

Após executar com sucesso:
1. Feche o Query Editor
2. Volte para o sistema (frontend)
3. Teste criar um novo orçamento
4. ✅ Agora deve persistir após F5!

---

## ⚠️ Se der erro

**Erro: "permission denied"**
- Use o usuário `postgres` ou admin do banco

**Erro: "column already exists"**
- Ignore, significa que a coluna já existe
- Passe para a próxima

**Não encontra Query Editor**
- Use Cloud Shell (opção 2 do passo 3)
- Conecte via: `gcloud sql connect [instancia] --user=postgres`

---

## 🆘 Precisa de Ajuda?

Me envie print da tela onde você está e eu te guio!
