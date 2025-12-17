# ✨ Upgrade: Envio de Mensagens com Suporte a Grupos

## 🎯 O que mudou?

A rota `POST /api/messaging/message/send` agora suporta **dois modos de envio**:

1. ✅ **Individual** (comportamento original)
2. ✅ **Grupo** (NOVO!)

---

## 📤 Como Usar

### Modo 1: Envio Individual (Original)

```bash
POST /api/messaging/message/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-instance",
  "remoteJid": "5585999999999",
  "message": "Olá, João!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "data": {
    "messageId": "uuid-123",
    "channelMessageId": "whatsapp-msg-id",
    "status": "sent"
  }
}
```

---

### Modo 2: Envio para Grupo (NOVO!) 🎉

```bash
POST /api/messaging/message/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-instance",
  "groupId": "group-uuid-123",
  "message": "Olá a todos! Promoção especial hoje!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mensagem enviada para o grupo",
  "data": {
    "total": 10,
    "sent": 9,
    "failed": 1,
    "errors": [
      {
        "identifier": "5585888888888",
        "error": "Número inválido"
      }
    ]
  }
}
```

---

## 🔄 Lógica

### Se passar `remoteJid`:
- Envia mensagem **individual**
- Usa o comportamento original

### Se passar `groupId`:
- Busca o grupo no banco
- Lista todos os membros ativos
- Envia mensagem para **cada membro**
- Retorna estatísticas de envio

### Validação:
- ❌ Não pode enviar SEM `remoteJid` e SEM `groupId`
- ✅ Deve ter um ou outro
- ⚠️ Se enviar os dois, `groupId` tem prioridade

---

## 📱 Exemplos Completos

### Exemplo 1: Envio Individual com Mídia

```bash
POST /api/messaging/message/send

{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-store",
  "remoteJid": "5585999999999",
  "message": "Confira nossa promoção!",
  "mediaUrl": "https://cdn.example.com/promo.jpg",
  "mediaType": "image"
}
```

### Exemplo 2: Envio para Grupo Customizado

```bash
# 1. Criar grupo
POST /api/messaging/groups
{
  "instanceId": "my-store-instance-id",
  "name": "Clientes VIP"
}

# Response: { "id": "group-abc-123", ... }

# 2. Adicionar membros
POST /api/messaging/groups/group-abc-123/members
{
  "identifier": "5585999999999",
  "identifierType": "phone",
  "name": "João"
}

# 3. Enviar para o grupo
POST /api/messaging/message/send
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-store",
  "groupId": "group-abc-123",
  "message": "BLACK FRIDAY! 50% OFF"
}
```

### Exemplo 3: Envio para Grupo Sincronizado (WhatsApp)

```bash
# 1. Listar grupos (inclui sincronizados)
GET /api/messaging/groups?instanceId=my-store-instance-id

# Response:
[
  {
    "id": "synced-group-456",
    "name": "Suporte Geral",
    "type": "SYNCED_WHATSAPP",
    "isSynced": true,
    ...
  }
]

# 2. Enviar para o grupo sincronizado
POST /api/messaging/message/send
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-store",
  "groupId": "synced-group-456",
  "message": "Sistema em manutenção às 2h"
}
```

---

## 🎨 Comparação

### Antes (Individual apenas)
```json
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-instance",
  "remoteJid": "5585999999999",
  "message": "Hello"
}
```

### Agora (Individual OU Grupo)
```json
// Individual
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-instance",
  "remoteJid": "5585999999999",
  "message": "Hello"
}

// Grupo
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-instance",
  "groupId": "group-uuid-123",
  "message": "Hello everyone!"
}
```

---

## ✅ Benefícios

1. **Mesma Rota**: Não precisa usar rota diferente para grupos
2. **Compatível**: Código antigo continua funcionando
3. **Flexível**: Escolhe individual ou grupo na mesma chamada
4. **Estatísticas**: Sabe quantos receberam quando envia para grupo
5. **Resiliente**: Erro em um membro não bloqueia os outros

---

## 🚀 Casos de Uso

### Marketing/Promoções
```bash
POST /api/messaging/message/send
{
  "groupId": "clientes-vip",
  "message": "🔥 FLASH SALE! 70% OFF por 2 horas!"
}
```

### Suporte/Comunicados
```bash
POST /api/messaging/message/send
{
  "groupId": "grupo-suporte-whatsapp",
  "message": "Pessoal, sistema voltou ao normal!"
}
```

### Notificações
```bash
POST /api/messaging/message/send
{
  "groupId": "equipe-vendas",
  "message": "Nova venda: R$ 1.500 - Cliente: João Silva"
}
```

---

## 📝 Observações

- ✅ Grupo pode ser CUSTOM ou SYNCED
- ✅ Mensagens são logadas individualmente
- ✅ Respeita limite de taxa da API
- ✅ Erros não bloqueiam outros membros
- ⚠️ `channelInstanceId` ainda é obrigatório (referência)
- ⚠️ Grupo deve pertencer ao usuário autenticado

---

## 🔧 Validações

```javascript
// ❌ Erro: Sem remoteJid e sem groupId
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-instance",
  "message": "Hello"
}
// Response 400: "É necessário informar remoteJid (individual) ou groupId (grupo)"

// ✅ OK: Com remoteJid
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-instance",
  "remoteJid": "5585999999999",
  "message": "Hello"
}

// ✅ OK: Com groupId
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-instance",
  "groupId": "group-123",
  "message": "Hello"
}

// ✅ OK: Com ambos (groupId tem prioridade)
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-instance",
  "remoteJid": "5585999999999",
  "groupId": "group-123",
  "message": "Hello"
}
// Envia para o GRUPO, ignora remoteJid
```

---

## 🎯 Resultado

**Uma rota, dois modos, infinitas possibilidades!** 🚀

Agora você pode:
- ✅ Enviar para indivíduos (como antes)
- ✅ Enviar para grupos customizados
- ✅ Enviar para grupos sincronizados do WhatsApp
- ✅ Tudo na mesma rota!
