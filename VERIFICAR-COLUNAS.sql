# Verificação: Colunas foram adicionadas?

Execute no Google Cloud SQL Query Editor:

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'quotes' 
AND column_name IN ('project_type', 'service_type', 'phone', 'notes', 'lead_id')
ORDER BY column_name;
```

## Resultado ESPERADO:

Deve mostrar 5 linhas:
- lead_id | integer | (null)
- notes | text | (null)
- phone | character varying | 20
- project_type | character varying | 100
- service_type | character varying | 100

## Se mostrar MENOS de 5 linhas:
Alguma coluna não foi criada. Execute novamente os ALTER TABLE.

## Se mostrar as 5 linhas:
✅ Banco está correto! 

Próximo passo: Testar criação de orçamento:
1. CTRL+SHIFT+DELETE → Limpar cache do browser
2. Fazer login novamente
3. Criar orçamento no lead
4. F5 → deve persistir!
