# 📬 Sistema de Grupos de Envio - Messaging

Sistema genérico de grupos de envio para a plataforma de messaging multi-canal.

## 🎯 Funcionalidades

- ✅ **Grupos Personalizados**: Crie e gerencie grupos manualmente
- ✅ **Grupos Sincronizados**: Grupos automáticos da Evolution API (WhatsApp)
- ✅ **Multi-Canal**: Suporta phone, email, telegram_id, etc
- ✅ **Proteção**: Grupos sincronizados são read-only
- ✅ **Envio em Massa**: Envie mensagens para todos os membros do grupo

---

## 📚 API Endpoints

### 1️⃣ Criar Grupo Personalizado

```bash
POST /api/messaging/groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "instanceId": "my-whatsapp-instance",
  "name": "Clientes VIP",
  "description": "Grupo de clientes premium"
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "user-id",
  "businessProfileId": "profile-id",
  "instanceId": "my-whatsapp-instance",
  "name": "Clientes VIP",
  "description": "Grupo de clientes premium",
  "type": "CUSTOM",
  "isSynced": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2️⃣ Listar Grupos

```bash
GET /api/messaging/groups?instanceId=my-whatsapp-instance
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "uuid-1",
    "name": "Clientes VIP",
    "type": "CUSTOM",
    "isSynced": false,
    ...
  },
  {
    "id": "uuid-2",
    "name": "Suporte Geral",
    "type": "SYNCED_WHATSAPP",
    "isSynced": true,
    "externalGroupId": "120363xxx@g.us",
    ...
  }
]
```

---

### 3️⃣ Atualizar Grupo

⚠️ **Apenas grupos CUSTOM**

```bash
PUT /api/messaging/groups/{groupId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Clientes Premium VIP",
  "description": "Grupo atualizado"
}
```

---

### 4️⃣ Deletar Grupo

⚠️ **Apenas grupos CUSTOM**

```bash
DELETE /api/messaging/groups/{groupId}
Authorization: Bearer {token}
```

---

### 5️⃣ Adicionar Membro ao Grupo

⚠️ **Apenas grupos CUSTOM**

```bash
POST /api/messaging/groups/{groupId}/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "identifier": "5521999999999",
  "identifierType": "phone",
  "name": "João Silva"
}
```

**Tipos de identifier suportados:**
- `phone` - Número de telefone (WhatsApp, SMS)
- `email` - E-mail
- `telegram_id` - ID do Telegram
- `custom` - Identificador personalizado

---

### 6️⃣ Listar Membros do Grupo

```bash
GET /api/messaging/groups/{groupId}/members
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "member-uuid-1",
    "groupId": "group-uuid",
    "identifier": "5521999999999",
    "identifierType": "phone",
    "name": "João Silva",
    "isActive": true,
    "addedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 7️⃣ Remover Membro do Grupo

⚠️ **Apenas grupos CUSTOM**

```bash
DELETE /api/messaging/groups/{groupId}/members/{identifier}
Authorization: Bearer {token}
```

Exemplo:
```bash
DELETE /api/messaging/groups/abc123/members/5521999999999
```

---

### 8️⃣ Enviar Mensagem para o Grupo

```bash
POST /api/messaging/groups/{groupId}/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Olá a todos! Promoção especial hoje!",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image"
}
```

**Response:**
```json
{
  "total": 5,
  "sent": 5,
  "failed": 0,
  "errors": []
}
```

**Response com Erros:**
```json
{
  "total": 5,
  "sent": 3,
  "failed": 2,
  "errors": [
    {
      "identifier": "5521888888888",
      "error": "Número inválido"
    },
    {
      "identifier": "5521777777777",
      "error": "Timeout"
    }
  ]
}
```

---

## 🔄 Sincronização Automática (Evolution API)

### Como Funciona

1. **Webhook Automático**: Quando você cria uma instância WhatsApp, o sistema configura automaticamente o webhook
2. **Detecção de Grupos**: A Evolution API envia eventos de grupos via webhook
3. **Sincronização**: Sistema cria automaticamente registros de grupos sincronizados
4. **Read-Only**: Grupos sincronizados não podem ser editados manualmente

### Tipos de Grupos Sincronizados

- `SYNCED_WHATSAPP` - Grupos do WhatsApp (Evolution)
- `SYNCED_TELEGRAM` - Grupos do Telegram (futuro)
- `SYNCED_EMAIL` - Listas de e-mail (futuro)

### Estrutura de Grupos Sincronizados

```json
{
  "id": "uuid",
  "name": "Suporte Geral",
  "type": "SYNCED_WHATSAPP",
  "externalGroupId": "120363xxx@g.us",
  "isSynced": true,
  "lastSyncAt": "2024-01-01T12:00:00.000Z",
  "metadata": {
    "subject": "Suporte Geral",
    "owner": "5521999999999@s.whatsapp.net",
    "participantCount": 15
  }
}
```

---

## 💡 Casos de Uso

### Caso 1: Lista de Broadcast para Marketing

```bash
# 1. Criar grupo
POST /api/messaging/groups
{
  "instanceId": "my-whatsapp",
  "name": "Lista de Promoções",
  "description": "Clientes que aceitaram receber promoções"
}

# 2. Adicionar membros
POST /api/messaging/groups/{groupId}/members
{
  "identifier": "5521999999999",
  "identifierType": "phone",
  "name": "Cliente 1"
}

# 3. Enviar promoção
POST /api/messaging/groups/{groupId}/send
{
  "message": "🔥 BLACK FRIDAY! 50% OFF em tudo!",
  "mediaUrl": "https://cdn.example.com/promo.jpg",
  "mediaType": "image"
}
```

### Caso 2: Grupo de Suporte Sincronizado

```bash
# 1. Criar instância WhatsApp (sincroniza automaticamente grupos)
POST /api/messaging/instance
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "support-team"
}

# 2. Aguardar webhook sincronizar grupos
# (automático - grupos aparecem em GET /api/messaging/groups)

# 3. Enviar mensagem para grupo sincronizado
POST /api/messaging/groups/{syncedGroupId}/send
{
  "message": "Pessoal, sistema em manutenção das 2h às 4h"
}
```

### Caso 3: Multi-Canal (WhatsApp + Email)

```bash
# Grupo com WhatsApp e Email
POST /api/messaging/groups/{groupId}/members
{
  "identifier": "5521999999999",
  "identifierType": "phone",
  "name": "João"
}

POST /api/messaging/groups/{groupId}/members
{
  "identifier": "joao@example.com",
  "identifierType": "email",
  "name": "João"
}
```

---

## 🔒 Segurança e Validações

### Permissões

- ✅ Usuário só acessa grupos da sua instância
- ✅ BusinessProfile isolation (multi-tenant)
- ✅ Grupos sincronizados são read-only

### Validações

- ❌ Não pode editar/deletar grupos `isSynced: true`
- ❌ Não pode adicionar/remover membros de grupos sincronizados
- ✅ Identificadores únicos por grupo (não duplica membros)
- ✅ Validação de `instanceId` pertence ao usuário

---

## 🗄️ Estrutura do Banco

### Tabela: `messaging_groups`

```sql
CREATE TABLE messaging_groups (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  businessProfileId VARCHAR(36),
  instanceId VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('CUSTOM', 'SYNCED_WHATSAPP', 'SYNCED_TELEGRAM', 'SYNCED_EMAIL'),
  externalGroupId VARCHAR(255),
  metadata LONGTEXT,
  isSynced BOOLEAN DEFAULT FALSE,
  lastSyncAt DATETIME,
  createdAt DATETIME,
  updatedAt DATETIME,
  UNIQUE KEY unique_external (instanceId, externalGroupId)
);
```

### Tabela: `messaging_group_members`

```sql
CREATE TABLE messaging_group_members (
  id VARCHAR(36) PRIMARY KEY,
  groupId VARCHAR(36) NOT NULL,
  identifier VARCHAR(255) NOT NULL,
  identifierType VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  metadata TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  addedAt DATETIME,
  UNIQUE KEY unique_member (groupId, identifier)
);
```

---

## 🚀 Próximos Passos

1. ✅ CRUD de grupos implementado
2. ✅ CRUD de membros implementado
3. ✅ Envio para grupo implementado
4. ⏳ Sincronização via webhook da Evolution
5. ⏳ Suporte a outros canais (Telegram, Email)
6. ⏳ Agendamento de envio para grupos
7. ⏳ Relatórios de envio por grupo

---

## 📝 Observações

- Mensagens são logadas na tabela `messaging_messages`
- Sistema usa a instância do grupo para enviar
- Erros de envio não bloqueiam outros membros
- Grupos sincronizados são atualizados automaticamente
