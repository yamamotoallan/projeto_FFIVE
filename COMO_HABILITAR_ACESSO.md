# ⚠️ IMPORTANTE: Habilitar Acesso Público

## Se ainda está dando erro "Forbidden"

### Verificar Configuração Atual

1. Acesse https://console.cloud.google.com/run/detail/southamerica-east1/gest-o-agenda-marcenaria-372428009665
2. Na aba **SECURITY**, procure por:
   - ✅ **Authentication**: Deve estar **Allow unauthenticated**
   - Se estiver **Require authentication**, precisa mudar

### Como Corrigir

**Método mais confiável**:

1. Console → Cloud Run → Serviço
2. Clique nos **3 pontos** (⋮) ao lado de "EDIT & DEPLOY"
3. Selecione **Manage Traffic**
4. Marque a revisão mais recente
5. Clique em **SECURITY** tab
6. ✅ **Allow unauthenticated invocations**
7. **SAVE**

**OU via IAM (alternativa)**:

1. No page do serviço, clique em **PERMISSIONS** tab
2. Clique em **ADD PRINCIPAL**
3. New principals: `allUsers`
4. Role: `Cloud Run Invoker`
5. **SAVE**

### Aguardar Propagação

Após fazer a mudança, aguarde 30-60 segundos para propagar.

### Testar Novamente

```powershell
.\test-api.ps1
```

---

**Se ainda não funcionar**, me avisa e eu te ajudo via console web visualmente!
