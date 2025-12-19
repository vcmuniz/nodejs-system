# 🔄 Guia de Migração: WhatsApp → Messageria (Multi-Channel)

## ⚠️ Status

**WhatsApp endpoints foram marcados como DEPRECATED no Swagger!**

Todos os endpoints `/api/whatsapp/*` foram marcados com `deprecated: true` e apontam para os novos endpoints `/api/messaging/*`.

---

## 🎯 Por que migrar?

| Aspecto | WhatsApp Específico | Messageria Genérica |
|--------|-------------------|-------------------|
| **Canais** | ❌ Apenas WhatsApp | ✅ WhatsApp + SMS + Email + Telegram + Facebook |
| **Manutenção** | ❌ Muita duplicação de código | ✅ Código reutilizável |
| **Trocar provedor** | ❌ Refactor grande | ✅ Trocar 1 adapter |
| **Adicionar novo canal** | ❌ Nova estrutura completa | ✅ Novo adapter + factory |
| **API Pública** | ❌ WhatsApp-específica | ✅ Agnóstica de canal |

---

## 🔀 Mapeamento de Endpoints

### Listar instâncias

**ANTES (Deprecated):**
```bash
GET /api/whatsapp/instances
```

**DEPOIS (Nova):**
```bash
GET /api/messaging/instances?channel=whatsapp_evolution
```

---

### Criar instância

**ANTES (Deprecated):**
```bash
POST /api/whatsapp/instance
{
  "instanceName": "minha-instancia",
  "phoneNumber": "5585999999999"
}
```

**DEPOIS (Nova):**
```bash
POST /api/messaging/instance
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "minha-instancia",
  "channelPhoneOrId": "5585999999999",
  "credentials": { "token": "evolution-token" }
}
```

---

### Obter status de instância

**ANTES (Deprecated):**
```bash
GET /api/whatsapp/instance/{instanceName}
```

**DEPOIS (Nova):**
```bash
GET /api/messaging/instances?channel=whatsapp_evolution
# Então filtrar pelo channelInstanceId na resposta
```

---

### Conectar instância

**ANTES (Deprecated):**
```bash
POST /api/whatsapp/instance/{instanceName}/connect
```

**DEPOIS (Nova):**
```bash
# Agora é automático quando você chama POST /api/messaging/instance
# (não precisa de call separado)
```

---

### Enviar mensagem

**ANTES (Deprecated):**
```bash
POST /api/whatsapp/message/send
{
  "instanceName": "minha-instancia",
  "to": "5585988888888",
  "message": "Olá!",
  "mediaUrl": "https://..."
}
```

**DEPOIS (Nova):**
```bash
POST /api/messaging/message/send
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "minha-instancia",
  "remoteJid": "5585988888888",
  "message": "Olá!",
  "mediaUrl": "https://..."
}
```

---

### Agendar mensagem

**ANTES (Deprecated):**
```bash
POST /api/whatsapp/message/schedule
{
  "instanceName": "minha-instancia",
  "to": "5585988888888",
  "message": "Olá!",
  "scheduleAt": "2024-12-20T10:00:00Z"
}
```

**DEPOIS (Nova):**
```bash
# Use POST /api/messaging/message/send imediatamente
# Ou implemente seu próprio agendamento com job queue (Kafka, Redis, etc)
```

---

## 📋 Passo a Passo da Migração

### Passo 1: Atualizar Frontend/Mobile

Se você tem código cliente que chama os endpoints WhatsApp:

**Antes:**
```javascript
async function sendMessage(instanceName, to, message) {
  const response = await fetch('/api/whatsapp/message/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ instanceName, to, message })
  });
  return response.json();
}
```

**Depois:**
```javascript
async function sendMessage(channel, channelInstanceId, remoteJid, message) {
  const response = await fetch('/api/messaging/message/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ 
      channel, 
      channelInstanceId, 
      remoteJid, 
      message 
    })
  });
  return response.json();
}

// Uso:
sendMessage('whatsapp', 'minha-instancia', '5585988888888', 'Olá!');
```

### Passo 2: Atualizar Backend

Se você tem código backend que chama os endpoints WhatsApp:

**Antes:**
```typescript
const createInstance = async (instanceName: string, phoneNumber: string) => {
  const response = await fetch('/api/whatsapp/instance', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ instanceName, phoneNumber })
  });
  return response.json();
};
```

**Depois:**
```typescript
const createInstance = async (channel: string, channelInstanceId: string, channelPhoneOrId: string) => {
  const response = await fetch('/api/messaging/instance', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ channel, channelInstanceId, channelPhoneOrId })
  });
  return response.json();
};

// Uso:
createInstance('whatsapp', 'minha-instancia', '5585999999999');
```

### Passo 3: Testar no Swagger

1. Acesse http://localhost:3000/api-docs
2. Procure por **"Messaging (Multi-Channel)"** (nova seção)
3. Teste os 3 endpoints:
   - GET /api/messaging/instances
   - POST /api/messaging/instance
   - POST /api/messaging/message/send
4. Verifique que funcionam igual aos antigos

### Passo 4: Manter compatibilidade temporária

Você pode manter ambos endpoints funcionando durante a transição:

**Option A: Keep old endpoints working**
```typescript
// src/app.ts
app.use('/api/whatsapp', makeWhatsAppRoutes()); // OLD (keep for now)
app.use('/api/messaging', makeMessagingRoutes()); // NEW
```

**Option B: Deprecate gradually**
```typescript
// Ano 1: Keep both, recommend new
// Ano 2: Mark old as deprecated in docs
// Ano 3: Remove old endpoints
```

---

## 🔍 Diferenças Chave

### Nomes de campos

| Contexto | Antigo | Novo |
|----------|--------|------|
| Instance ID | `instanceName` | `channelInstanceId` |
| Telefone/Destinatário | `phoneNumber`, `to` | `channelPhoneOrId`, `remoteJid` |
| Tipo de canal | (implícito: WhatsApp) | `channel` (explícito) |
| Credenciais | (não expostas) | `credentials` (opcional) |

### Resposta de sucesso

**Antes:**
```json
{
  "status": "success",
  "data": { "instanceName": "..." }
}
```

**Depois:**
```json
{
  "success": true,
  "message": "Instância criada com sucesso",
  "data": { "instanceId": "..." }
}
```

---

## ✅ Checklist de Migração

- [ ] Atualizei todas as chamadas de `GET /api/whatsapp/instances` para `GET /api/messaging/instances?channel=whatsapp_evolution`
- [ ] Atualizei todas as chamadas de `POST /api/whatsapp/instance` para `POST /api/messaging/instance` com `channel: 'whatsapp'`
- [ ] Atualizei todas as chamadas de `POST /api/whatsapp/message/send` para `POST /api/messaging/message/send` com `channel: 'whatsapp'`
- [ ] Testei os novos endpoints no Swagger UI
- [ ] Testei em produção
- [ ] Removi referências aos endpoints antigos no código
- [ ] Atualizei a documentação da API interna
- [ ] Notifiquei os clientes da API sobre a mudança

---

## 🚀 Benefícios Imediatos

1. **Agnóstica de canal**
   - Mesmo código para WhatsApp, SMS, Email, Telegram, Facebook

2. **Fácil adicionar novo canal**
   - Sem mudar os endpoints existentes
   - Apenas implementar novo adapter

3. **Facilita manutenção**
   - Menos duplicação de código
   - Lógica compartilhada entre canais

4. **Melhor separação de responsabilidades**
   - App não precisa saber sobre implementação específica do WhatsApp

---

## 📞 FAQ

**P: Os endpoints antigos vão parar de funcionar?**
R: Não imediatamente. Você tem tempo para migrar. Recomendamos migrar gradualmente.

**P: Qual é o prazo para remover os endpoints antigos?**
R: A ser definido. Recomendamos no mínimo 6 meses de período de deprecation.

**P: Posso usar ambos os endpoints ao mesmo tempo?**
R: Sim! Você pode manter ambos funcionando durante a migração.

**P: Como eu testo a migração?**
R: Use o Swagger UI em http://localhost:3000/api-docs e teste os novos endpoints.

**P: E se eu tiver código customizado baseado em WhatsApp?**
R: Crie um wrapper que mapeia os antigos endpoints para os novos internamente.

---

## 📚 Documentação Relacionada

- **MESSAGERIA_QUICK_START.md** - Exemplos de uso do novo sistema
- **MESSAGERIA_EXEMPLOS.md** - Código pronto para copiar
- **SWAGGER_MESSAGING_GUIDE.md** - Detalhes de cada endpoint

---

## 🎯 Próximos Passos

1. ✅ Swagger atualizado com deprecation warnings
2. ⏳ **Migrar seu código** para usar `/api/messaging/*`
3. ⏳ Testar em produção
4. ⏳ Remover endpoints antigos (após período de transição)

---

**Status**: ✅ Endpoints deprecados no Swagger
**Data de início de deprecation**: 2024-12-16
**Período recomendado de transição**: 6 meses
