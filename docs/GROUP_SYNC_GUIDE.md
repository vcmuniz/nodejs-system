# 🔄 Sincronização de Grupos - Guia Completo

## 🎯 Nova Rota Criada!

```
POST /api/messaging/groups/sync/:instanceId
```

Sincroniza todos os grupos do WhatsApp (Evolution API) para o banco de dados.

---

## 📤 Como Usar

### 1️⃣ Sincronizar Grupos de uma Instância

```bash
POST /api/messaging/groups/sync/{instanceId}
Authorization: Bearer {seu-token}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/messaging/groups/sync/abc-123-instance \
  -H "Authorization: Bearer seu-token-jwt"
```

**Response de Sucesso:**
```json
{
  "success": true,
  "message": "Grupos sincronizados com sucesso",
  "data": {
    "totalGroups": 5,
    "syncedGroups": 5,
    "totalMembers": 47
  }
}
```

---

## 🔄 O que a Rota Faz

### Passo 1: Valida a Instância
- Busca no banco de dados
- Verifica se pertence ao usuário
- Valida permissões

### Passo 2: Busca na Evolution API
- Chama `GET /group/fetchAllGroups/{instanceId}`
- Pega todos os grupos do WhatsApp
- Inclui participantes de cada grupo

### Passo 3: Salva no Banco
- Cria ou atualiza cada grupo
- Define `type: SYNCED_WHATSAPP`
- Marca `isSynced: true` (read-only)
- Salva todos os membros
- Atualiza `lastSyncAt`

### Passo 4: Retorna Estatísticas
- Total de grupos encontrados
- Grupos sincronizados
- Total de membros

---

## 📊 Fluxo Completo

```
Frontend                    API                     Evolution
   |                         |                          |
   |-- POST /sync/:id ------>|                          |
   |                         |-- GET /fetchAllGroups -->|
   |                         |<-- grupos + membros -----|
   |                         |                          |
   |                         |--- Salva no banco ------>|
   |                         |    - groups              |
   |                         |    - members             |
   |                         |    - metadata            |
   |                         |                          |
   |<-- estatísticas --------|                          |
   |                         |                          |
```

---

## 🎨 Exemplo Real

### Cenário: E-commerce com Suporte

```bash
# 1. Criar instância WhatsApp
POST /api/messaging/instance
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "suporte-ecommerce"
}
# Response: { "id": "instance-abc-123", ... }

# 2. Escanear QR Code e conectar
GET /api/messaging/instance/instance-abc-123/qrcode

# 3. Sincronizar grupos (NOVO!)
POST /api/messaging/groups/sync/instance-abc-123

# Response:
{
  "success": true,
  "message": "Grupos sincronizados com sucesso",
  "data": {
    "totalGroups": 3,
    "syncedGroups": 3,
    "totalMembers": 28
  }
}

# 4. Listar grupos sincronizados
GET /api/messaging/groups?instanceId=instance-abc-123

# Response:
[
  {
    "id": "group-uuid-1",
    "name": "Suporte - Urgências",
    "type": "SYNCED_WHATSAPP",
    "isSynced": true,
    "externalGroupId": "120363xxx@g.us",
    "metadata": {
      "participantCount": 12,
      "subject": "Suporte - Urgências",
      "owner": "558599999999@s.whatsapp.net"
    }
  },
  {
    "id": "group-uuid-2",
    "name": "Equipe Vendas",
    "type": "SYNCED_WHATSAPP",
    "isSynced": true,
    "externalGroupId": "120363yyy@g.us",
    "metadata": {
      "participantCount": 8
    }
  }
]

# 5. Enviar mensagem para grupo sincronizado
POST /api/messaging/message/send
{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "suporte-ecommerce",
  "groupId": "group-uuid-1",
  "message": "⚠️ Sistema em manutenção das 2h às 4h"
}
```

---

## 🎯 Quando Sincronizar?

### 1. **Inicial** - Após criar instância
```javascript
// Criar instância
const instance = await createInstance();

// Aguardar conexão
await waitForConnection(instance.id);

// Sincronizar grupos (NOVO!)
await syncGroups(instance.id);
```

### 2. **Manual** - Botão no frontend
```jsx
<Button onClick={() => syncGroups(instanceId)}>
  🔄 Atualizar Grupos
</Button>
```

### 3. **Periódico** - Cronjob (opcional)
```javascript
// A cada 6 horas
cron.schedule('0 */6 * * *', async () => {
  await syncAllInstances();
});
```

---

## ⚠️ Grupos Sincronizados são Read-Only

```bash
# ❌ NÃO PODE editar
PUT /api/messaging/groups/{syncedGroupId}
# Response 400: "Não é possível editar grupos sincronizados"

# ❌ NÃO PODE deletar
DELETE /api/messaging/groups/{syncedGroupId}
# Response 400: "Não é possível deletar grupos sincronizados"

# ❌ NÃO PODE adicionar membros manualmente
POST /api/messaging/groups/{syncedGroupId}/members
# Response 400: "Não é possível adicionar membros em grupos sincronizados"

# ✅ PODE listar
GET /api/messaging/groups/{syncedGroupId}/members

# ✅ PODE enviar mensagem
POST /api/messaging/groups/{syncedGroupId}/send
```

---

## 🔧 Tratamento de Erros

### Instância não encontrada
```json
{
  "error": "Instância não encontrada"
}
```

### Sem permissão
```json
{
  "error": "Acesso negado"
}
```

### Erro na Evolution API
```json
{
  "error": "Erro ao buscar grupos da Evolution API",
  "details": "Request failed with status code 401"
}
```

### Sem grupos
```json
{
  "success": true,
  "message": "Nenhum grupo encontrado",
  "data": {
    "totalGroups": 0,
    "syncedGroups": 0,
    "totalMembers": 0
  }
}
```

---

## 📱 Integração com Frontend

### React Example

```tsx
import { useState } from 'react';
import { api } from './api';

function SyncGroupsButton({ instanceId }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const syncGroups = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        `/api/messaging/groups/sync/${instanceId}`
      );
      setResult(response.data);
      alert(`✅ ${response.data.data.syncedGroups} grupos sincronizados!`);
    } catch (error) {
      alert('❌ Erro ao sincronizar grupos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={syncGroups} disabled={loading}>
        {loading ? '🔄 Sincronizando...' : '🔄 Atualizar Grupos'}
      </button>
      
      {result && (
        <div>
          <p>✅ {result.data.syncedGroups} grupos</p>
          <p>👥 {result.data.totalMembers} membros</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Resumo

✅ **Criada rota:** `POST /api/messaging/groups/sync/:instanceId`
✅ **Busca grupos** da Evolution API
✅ **Salva no banco** (type: SYNCED_WHATSAPP)
✅ **Sincroniza membros** automaticamente
✅ **Read-only** - protege contra edição
✅ **Retorna estatísticas** completas

**Frontend pode chamar quando quiser sincronizar!** 🚀
