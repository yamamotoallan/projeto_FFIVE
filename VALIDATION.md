# ✅ Checklist de Validação do Deploy

## 1. Cloud Run
- [ ] Acessar https://console.cloud.google.com/run
- [ ] Verificar revisão mais recente está **SERVING**
- [ ] Copiar URL do serviço

## 2. Testar API
- [ ] GET `https://[SUA-URL]/api` → Retorna `{"status":"API Online"}`
- [ ] POST `/api/login` com admin@marcenaria.pro / 123 → Retorna token

## 3. Verificar Logs
- [ ] Cloud Run → LOGS
- [ ] Ver "Servidor rodando na porta 8080"
- [ ] Ver "Base de dados conectada"

## 4. Testar Upload
- [ ] Criar orçamento com arquivo
- [ ] Verificar arquivo no bucket GCS

## 5. Frontend (Vercel)
- [ ] Configurar VITE_API_URL com URL do Cloud Run
- [ ] Testar login pelo frontend
- [ ] Testar criação de lead/orçamento

---

**Comando rápido para testar**:
```powershell
# Substituir [URL] pela URL do Cloud Run
curl https://[URL]/api
```
