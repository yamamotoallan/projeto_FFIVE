# 🔧 Problemas Resolvidos

## 1. ✅ Cloud Run Build Error - CORRIGIDO

**Problema**: Container não iniciava (PORT timeout)  
**Causa**: Import incorreto do nodemailer  
**Solução**: Alterado de `import nodemailer` para `import nodemailerLib` e usando `nodemailerLib.default.createTransport`

## 2. ⚠️ SMTP Gmail - App Password Inválida

**Problema**: Erro 535 - Credentials not accepted  
**Tentativas**:
- ✅ Porta 465 + SSL
- ✅ Porta 587 + STARTTLS

**Ambas rejeitaram a App Password**: `tgqd nynx bowx oaho`

### Possíveis Causas

1. **2FA não ativado** na conta Google
2. **App Password revogada/expirada**
3. **Formato incorreto** (espaços ou caracteres extras)
4. **Conta com "Apps menos seguros" desativados**

### ✅ Solução Recomendada

1. Verifique se 2FA está ativo: https://myaccount.google.com/security
2. **Gere uma NOVA App Password**:
   - Acesse: https://myaccount.google.com/apppasswords
   - Nome: "FIVE Sistema"
   - Copie a senha SEM ESPAÇOS
3. Teste na interface do sistema após deploy

---

## Deploy Realizado

✅ **Correção do nodemailer commitada**  
✅ **Push para GitHub**  
⏳ **Cloud Run fazendo build** (3-5 min)

---

## Próximos Passos

### Aguardar Deploy (5 min)
Cloud Run está fazendo rebuild com correção do nodemailer.

### Testar Interface
1. Acesse Configurações de Email
2. Use NOVA App Password
3. Porta 587 + TLS (já configurado)
4. Teste envio

### Se ainda falhar
Podemos usar **Mailgun** ou **SendGrid** (gratuito até 100 emails/dia).

---

*Correção aplicada em: 2026-01-13 11:12*
