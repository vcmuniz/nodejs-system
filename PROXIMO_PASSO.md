# 🚀 PRÓXIMO PASSO: Sistema de Contatos e Captura de Leads

## 📋 Planejamento Completo

**Status:** ✅ Aprovado para implementação

**Documento detalhado:** `docs/CONTACTS_AND_LEADS_PLANNING.md`

---

## 🎯 O Que Vamos Criar

### 1. **CRUD de Contatos** (Privado)
- Criar, listar, editar, deletar contatos
- Campos completos: nome, email, telefone, CPF, empresa, cargo, endereço, etc
- Tags e campos customizados
- Timeline de atividades
- Conversão de leads em contatos

### 2. **Captura de Leads** (Público)
- API pública (sem autenticação) para sites de captura
- Páginas de captura configuráveis
- Formulários personalizáveis
- Estatísticas e métricas
- Webhooks para notificações

### 3. **Gestão de Leads**
- Rastreamento de origem
- Lead scoring
- Conversão para contato
- Filtros e buscas avançadas
- Dashboard com estatísticas

---

## 📊 Estrutura do Banco

### Tabelas a criar:
1. **`contacts`** - Armazena contatos e leads
2. **`lead_captures`** - Páginas de captura configuradas
3. **`contact_activities`** - Timeline de atividades dos contatos

---

## 🌐 Endpoints Principais

### Privados (com auth):
```
POST   /api/contacts
GET    /api/contacts
PUT    /api/contacts/:id
DELETE /api/contacts/:id
POST   /api/contacts/:id/convert

POST   /api/lead-captures
GET    /api/lead-captures
GET    /api/lead-captures/:id/stats
```

### Públicos (sem auth):
```
GET    /public/lead/:slug
POST   /public/lead/:slug
```

---

## 🔧 Ordem de Implementação

1. ✅ Planejamento (CONCLUÍDO)
2. ⏭️ Migrations (schema.prisma)
3. ⏭️ Domain entities
4. ⏭️ Repositories
5. ⏭️ Use Cases
6. ⏭️ Controllers
7. ⏭️ Routes
8. ⏭️ Swagger

---

## 📝 Exemplo de Uso

### Criar página de captura:
```json
POST /api/lead-captures
{
  "name": "Landing Page Produto X",
  "slug": "ebook-gratis",
  "fields": ["name", "email", "phone"],
  "requiredFields": ["name", "email"]
}
```

### Capturar lead (público):
```json
POST /public/lead/ebook-gratis
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "5521988888888"
}
```

### Resultado:
- Lead salvo automaticamente em `contacts`
- Email de notificação enviado (se configurado)
- Webhook disparado (se configurado)
- Estatísticas atualizadas

---

## 💡 Funcionalidades Extras

- ✅ Tags nos contatos
- ✅ Campos customizados (JSON)
- ✅ Timeline de atividades
- ✅ Lead scoring
- ✅ Webhooks de notificação
- ✅ Estatísticas em tempo real
- ✅ Filtros avançados
- ✅ Conversão lead → contato
- ✅ Rastreamento de origem (UTM)

---

## 📚 Documentação

**Planejamento completo:** Ver `docs/CONTACTS_AND_LEADS_PLANNING.md`

---

## ✅ Pronto para Começar!

**Comando para iniciar:**
```bash
# Pode dar clear no chat e dizer:
# "Vamos implementar o sistema de contatos e leads conforme o PROXIMO_PASSO.md"
```

**O que já está pronto:**
- ✅ Planejamento completo
- ✅ Estrutura de banco definida
- ✅ Endpoints mapeados
- ✅ Ordem de implementação definida

**Próxima sessão:**
Começar pelas migrations! 🚀
