# Avisos de Dependências - Vercel

Este documento registra os avisos (warnings) de dependências no deployment da Vercel e as ações tomadas.

## ✅ Resolvidos

### 1. Multer - Vulnerabilidades de Segurança
**Aviso original:**
```
npm warn deprecated multer@1.4.5-lts.2: Multer 1.x is impacted by a number of vulnerabilities
```

**Ação tomada:** ✅ Atualizado para `multer@2.x` (última versão)

**Data:** 21/01/2026

---

### 2. @remix-run/router - Vulnerabilidade
**Aviso:** Vulnerabilidade no `@remix-run/router <=1.23.1`

**Ação tomada:** ✅ Atualizado para versão mais recente

**Data:** 21/01/2026

---

## ⚠️ Pendentes (Não crítico)

### react-beautiful-dnd - Deprecado

**Aviso:**
```
npm warn deprecated react-beautiful-dnd@13.1.1: react-beautiful-dnd is now deprecated
```

**Status:** ⚠️ **Funcional mas deprecado**

**Explicação:**
- O pacote `react-beautiful-dnd` foi oficialmente deprecado pelos mantenedores (Atlassian)
- Ainda funciona perfeitamente no projeto
- Não há vulnerabilidades de segurança conhecidas

**Alternativas para considerar no futuro:**
1. **[@dnd-kit](https://dndkit.com/)** - Sucessor mais moderno e mantido ativamente
2. **[@hello-pangea/dnd](https://github.com/hello-pangea/dnd)** - Fork comunitário do react-beautiful-dnd
3. **react-dnd** - Alternativa mais robusta mas com API diferente

**Recomendação:**
- ✅ Manter por enquanto (não urgente)
- 🔄 Planejar migração para `@dnd-kit` ou `@hello-pangea/dnd` em uma sprint futura
- 📝 Adicionar task no backlog para refatorar componentes de drag-and-drop

**Impacto:**
- Nenhum impacto imediato na funcionalidade
- Nenhuma vulnerabilidade de segurança
- Avisos continuarão aparecendo nos logs da Vercel até ser substituído

---

## Comandos Úteis

### Verificar vulnerabilidades
```bash
npm audit
```

### Corrigir automaticamente (cuidado com breaking changes)
```bash
npm audit fix
```

### Listar pacotes desatualizados
```bash
npm outdated
```

### Atualizar um pacote específico
```bash
npm install package-name@latest --save
```

---

## Checklist de Manutenção

- [x] Multer atualizado para v2
- [x] @remix-run/router atualizado
- [ ] Planejar migração do react-beautiful-dnd (futuro)
- [ ] Revisar dependências trimestralmente

---

**Última atualização:** 21/01/2026
