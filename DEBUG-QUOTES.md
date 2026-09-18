   # Debug: Por que orçamentos não persistem?

## 🔍 Investigação

### Problema
Orçamentos são criados com sucesso mas desaparecem após F5.

### Hipóteses

1. **lead_id não está sendo salvo no banco**
   - NewQuoteModal envia `lead_id: parseInt(initialData.leadId)`
   - Backend recebe mas pode não estar salvando

2. **Endpoint GET /api/leads/:id/quotes não funciona**
   - Pode estar retornando vazio mesmo com dados no banco
   - SQL query pode estar incorreta

3. **Tabela quotes não tem coluna lead_id**
   - Migrations podem não ter sido executadas

## 🧪 Testes Necessários

### Teste 1: Verificar se lead_id é salvo
```sql
SELECT id, client, project, lead_id, created_at 
FROM quotes 
ORDER BY created_at DESC 
LIMIT 10;
```

**Esperado**: Coluna `lead_id` com valores preenchidos

### Teste 2: Testar endpoint manualmente
```bash
curl -H "Authorization: Bearer [TOKEN]" \
  https://[backend]/api/leads/1/quotes
```

**Esperado**: Array com quotes do lead

### Teste 3: Verificar estrutura da tabela
```sql
\d quotes
-- ou
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotes';
```

**Esperado**: Coluna `lead_id` existe

## 🔧 Possíveis Soluções

### Se lead_id não existe na tabela:
```sql
ALTER TABLE quotes ADD COLUMN lead_id INTEGER REFERENCES leads(id);
```

### Se endpoint está retornando vazio:
Verificar query no backend (linha ~445 api/index.js)

### Se lead_id não está sendo enviado:
Verificar NewQuoteModal handleSubmit
