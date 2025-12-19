# 📡 Webhook Events - Evolution API

## ✅ Eventos Processados

### 1. `connection.update` - Status da Conexão

**Quando acontece:** Quando o WhatsApp conecta, desconecta ou muda de estado.

**Dados recebidos:**
```json
{
  "event": "connection.update",
  "instance": "minha-instancia",
  "data": {
    "state": "open",  // ou "close", "connecting"
    "status": "open"  // backup do state
  }
}
```

**O que o sistema faz:**
- ✅ Atualiza `status` na tabela `messaging_instances`
- ✅ Registra no log quando conecta/desconecta
- ✅ Mapeia para: `CONNECTED`, `DISCONNECTED`, `CONNECTING`

---

### 2. `qrcode.updated` - QR Code Atualizado

**Quando acontece:** Quando um novo QR Code é gerado.

**Dados recebidos:**
```json
{
  "event": "qrcode.updated",
  "instance": "minha-instancia",
  "data": {
    "qrcode": {
      "code": "2@...",
      "base64": "data:image/png;base64,..."
    }
  }
}
```

**O que o sistema faz:**
- 📝 Apenas loga (não salva no banco)
- ℹ️ QR Code é obtido via endpoint `/instance/{id}/qrcode`

---

### 3. `messages.upsert` - Mensagem Recebida

**Quando acontece:** Quando uma mensagem é recebida.

**Dados recebidos:**
```json
{
  "event": "messages.upsert",
  "instance": "minha-instancia",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "id": "msg_id"
    },
    "message": {
      "conversation": "Olá!"
    }
  }
}
```

**O que o sistema faz:**
- 📝 Loga para debug
- 🔜 TODO: Salvar em `messaging_messages`

---

### 4. `messages.update` - Status de Mensagem

**Quando acontece:** Quando status da mensagem muda (enviada, entregue, lida).

**Dados recebidos:**
```json
{
  "event": "messages.update",
  "instance": "minha-instancia",
  "data": {
    "key": {
      "id": "msg_id"
    },
    "update": {
      "status": 3  // 1=enviado, 2=entregue, 3=lido
    }
  }
}
```

**O que o sistema faz:**
- 📝 Loga para debug
- 🔜 TODO: Atualizar `messaging_messages`

---

## 🔧 Como Funciona Internamente

### Fluxo do Webhook:

```
1. Evolution API envia POST /api/messaging/webhook/{instanceId}
2. Route recebe e responde imediatamente (200 OK)
3. ProcessMessagingWebhook processa de forma assíncrona
4. Busca instância no banco pelo channelInstanceId
5. Processa evento específico
6. Atualiza banco de dados
```

### Código:

```typescript
// src/usercase/messaging/ProcessMessagingWebhook.ts
switch (input.event) {
  case 'connection.update':
    await this.handleConnectionUpdate(instance.id, input.data);
    break;
    
  case 'qrcode.updated':
    // Apenas loga
    break;
    
  case 'messages.upsert':
    // TODO: Salvar mensagem
    break;
}
```

---

## 🧪 Testar Webhook Localmente

### 1. Criar instância:
```bash
curl -X POST http://localhost:3000/api/messaging/instance \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp_evolution",
    "channelInstanceId": "teste-webhook",
    "channelPhoneOrId": "5511999999999"
  }'
```

### 2. Simular evento de conexão:
```bash
curl -X POST http://localhost:3000/api/messaging/webhook/teste-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "connection.update",
    "instance": "teste-webhook",
    "data": {
      "state": "open",
      "status": "open"
    }
  }'
```

### 3. Verificar logs:
```
[Webhook] Recebido para instância: teste-webhook
[Webhook] Event: connection.update
[ProcessMessagingWebhook] Processando evento: connection.update
✅ [ProcessMessagingWebhook] Instância CONECTADA
✅ [ProcessMessagingWebhook] Status atualizado no banco: connected
```

### 4. Verificar no banco:
```sql
SELECT id, channelInstanceId, status, lastConnectedAt 
FROM messaging_instances 
WHERE channelInstanceId = 'teste-webhook';
```

---

## 📊 Status Mapping

| Evolution State | Nosso Status | lastConnectedAt | lastDisconnectedAt |
|----------------|--------------|-----------------|-------------------|
| `open` | `CONNECTED` | ✅ Atualizado | - |
| `close` | `DISCONNECTED` | - | ✅ Atualizado |
| `connecting` | `CONNECTING` | - | - |

---

## 🔍 Debug

Ver logs dos webhooks:
```bash
tail -f logs/app.log | grep Webhook
```

Ver apenas eventos de conexão:
```bash
tail -f logs/app.log | grep "connection.update"
```

---

## 📝 Próximas Implementações

- [ ] Salvar mensagens recebidas (`messages.upsert`)
- [ ] Atualizar status de mensagens enviadas (`messages.update`)
- [ ] Processar mensagens com mídia
- [ ] Notificar frontend via WebSocket quando conectar

---

## ✅ Status Atual

| Evento | Implementado | Atualiza Banco |
|--------|-------------|----------------|
| `connection.update` | ✅ | ✅ status |
| `qrcode.updated` | ✅ | ❌ (não precisa) |
| `messages.upsert` | 🔜 | 🔜 |
| `messages.update` | 🔜 | 🔜 |

**Conexão WhatsApp agora atualiza automaticamente o status no banco!** 🎉
