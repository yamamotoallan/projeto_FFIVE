# ⚠️ Correção: Erro "Forbidden" no Cloud Run

## Problema
```
Error: Forbidden
Your client does not have permission to get URL /api from this server.
```

**Causa**: O serviço está configurado para exigir autenticação.

---

## Solução Rápida

### Opção 1: Via Console (Mais Fácil)

1. Acesse https://console.cloud.google.com/run
2. Clique no serviço: **gest-o-agenda-marcenaria-372428009665**
3. No topo, clique em **EDIT & DEPLOY NEW REVISION**
4. Role até **Security** (ou **Autenticação**)
5. Marque: ✅ **Allow unauthenticated invocations**
6. Clique em **DEPLOY**

### Opção 2: Via gcloud CLI

```powershell
gcloud run services add-iam-policy-binding gest-o-agenda-marcenaria-372428009665 `
  --region=southamerica-east1 `
  --member="allUsers" `
  --role="roles/run.invoker" `
  --project=marcenariaPRO
```

---

## Validação

Após aplicar a correção, teste:

```powershell
curl https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app/api
```

Deve retornar:
```json
{
  "status": "API Online",
  "env": "production",
  "secure": true
}
```

---

## ✅ Próximos Testes

Depois que funcionar, testar:

**Login**:
```powershell
curl -X POST https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app/api/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@marcenaria.pro","password":"123"}'
```

**Leads**:
```
GET https://gest-o-agenda-marcenaria-372428009665.southamerica-east1.run.app/api/leads
```

---

*Correção: 2026-01-13 01:17*
