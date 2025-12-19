# 🔧 Como Integrar Credenciais Automáticas no CreateInstance

## 📍 Você está aqui

✅ Sistema de credenciais criado e funcionando  
⏳ **PRÓXIMO**: Fazer CreateInstance buscar credenciais automaticamente

---

## 🎯 Objetivo

Modificar o `CreateInstance` para que:
1. **NÃO exija** que usuário passe `apiToken` e `baseUrl` 
2. **Busque automaticamente** as credenciais configuradas pelo admin
3. **Permita override** opcional (se usuário quiser usar credenciais próprias)

---

## 📝 Mudanças Necessárias

### 1️⃣ Modificar CreateInstanceController

**Arquivo**: `src/presentation/controllers/messaging/CreateInstanceController.ts`

**Antes**:
```typescript
const { channel, instanceName, apiToken, baseUrl } = req.body;

if (!apiToken || !baseUrl) {
  return res.status(400).json({ 
    error: 'apiToken e baseUrl são obrigatórios' 
  });
}
```

**Depois**:
```typescript
const { 
  channel, 
  instanceName, 
  apiToken,      // Agora opcional
  baseUrl,       // Agora opcional
  credentialId   // Opcional: forçar credencial específica
} = req.body;

// apiToken e baseUrl agora são opcionais
// Se não forem passados, buscamos automaticamente
```

---

### 2️⃣ Modificar CreateInstance Use Case

**Arquivo**: `src/usercase/messaging/CreateInstance.ts`

**Adicionar importações**:
```typescript
import { makeIntegrationCredentialRepository } from '../../infra/database/factories/makeIntegrationCredentialRepository';
import { GetActiveCredentialByType } from '../integration-credentials/GetActiveCredentialByType';
import { GetIntegrationCredentialById } from '../integration-credentials/GetIntegrationCredentialById';
```

**Modificar execute()**:
```typescript
interface CreateInstanceDTO {
  userId: string;
  channel: string;
  instanceName: string;
  apiToken?: string;      // Opcional
  baseUrl?: string;       // Opcional
  credentialId?: string;  // Opcional: forçar credencial específica
}

async execute(data: CreateInstanceDTO): Promise<MessagingInstance> {
  let apiToken = data.apiToken;
  let baseUrl = data.baseUrl;
  let usedCredentialId: string | undefined;

  // Se não passou credenciais manualmente, busca automaticamente
  if (!apiToken || !baseUrl) {
    const credentialRepo = makeIntegrationCredentialRepository();
    
    let credential;
    
    if (data.credentialId) {
      // Usar credencial específica solicitada
      const getById = new GetIntegrationCredentialById(credentialRepo);
      credential = await getById.execute(data.credentialId);
    } else {
      // Buscar credencial ativa do tipo
      const getByType = new GetActiveCredentialByType(credentialRepo);
      credential = await getByType.execute(data.channel);
    }

    // Extrair credenciais conforme o tipo
    if (data.channel === 'whatsapp' || data.channel === 'evolution') {
      apiToken = credential.credentials.apiToken;
      baseUrl = credential.credentials.baseUrl;
      usedCredentialId = credential.id;
    } else if (data.channel === 'twilio') {
      apiToken = credential.credentials.authToken;
      baseUrl = credential.credentials.accountSid;
      usedCredentialId = credential.id;
    }
    // Adicione outros canais conforme necessário
  }

  if (!apiToken || !baseUrl) {
    throw new Error('Não foi possível obter credenciais para este canal');
  }

  // Continua com a lógica existente...
  const instance = await this.repository.create({
    userId: data.userId,
    channel: data.channel,
    instanceName: data.instanceName,
    // ... outros campos
  });

  // OPCIONAL: Salvar referência da credencial usada
  // Adicionar campo credentialId no MessagingInstance se quiser rastrear
  
  return instance;
}
```

---

### 3️⃣ (Opcional) Adicionar campo credentialId em MessagingInstance

Se quiser rastrear qual credencial foi usada:

**Arquivo**: `prisma/schema.prisma`

```prisma
model MessagingInstance {
  id                  String   @id @default(cuid())
  userId              String
  channel             String
  channelInstanceId   String
  channelPhoneOrId    String
  status              String   @default("pending")
  qrCode              String?  @db.LongText
  metadata            Json?
  lastConnectedAt     DateTime?
  lastDisconnectedAt  DateTime?
  
  credentialId        String?  // 👈 NOVO: Rastrear qual credencial foi usada
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user            User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  messagingMessages MessagingMessage[]
  credential      IntegrationCredential? @relation(fields: [credentialId], references: [id], onDelete: SetNull)

  @@unique([channel, channelInstanceId])
  @@index([userId])
  @@index([channel])
  @@index([status])
  @@index([credentialId])
  @@map("messaging_instances")
}
```

E adicionar a relação em IntegrationCredential:
```prisma
model IntegrationCredential {
  // ... campos existentes
  
  messagingInstances MessagingInstance[]  // 👈 NOVO
  
  // ... resto do modelo
}
```

Depois: `npx prisma db push` e `npx prisma generate`

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────────┐
│ 1. Admin cria credencial via API            │
│    POST /api/integration-credentials        │
│    { name: "Evo", type: "evolution", ... }  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ Credencial salva    │
         │ no banco de dados   │
         └──────────┬──────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│ 2. Usuário cria instância (SEM passar      │
│    credenciais)                            │
│    POST /api/messaging/instance            │
│    { channel: "whatsapp", instanceName }   │
└──────────────────┬─────────────────────────┘
                   │
                   ▼
         ┌──────────────────────┐
         │ CreateInstance       │
         │ busca credencial     │
         │ automaticamente      │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Instância criada com │
         │ credenciais do admin │
         └──────────────────────┘
```

---

## 🧪 Testar

### 1. Admin cria credencial:
```bash
curl -X POST http://localhost:3000/api/integration-credentials \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evolution Main",
    "type": "evolution",
    "credentials": {
      "apiToken": "B6D711FCDE4D4FD5936544120E713976",
      "baseUrl": "http://localhost:8080"
    },
    "isActive": true
  }'
```

### 2. Usuário cria instância (SEM passar credenciais):
```bash
curl -X POST http://localhost:3000/api/messaging/instance \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp",
    "instanceName": "minha_loja"
  }'
```

✅ **Funciona!** Sistema busca credenciais automaticamente.

### 3. (Opcional) Usuário força credencial específica:
```bash
curl -X POST http://localhost:3000/api/messaging/instance \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp",
    "instanceName": "minha_loja",
    "credentialId": "cred_123abc"
  }'
```

---

## ⚠️ Tratamento de Erros

Adicione tratamentos:

```typescript
try {
  const credential = await getByType.execute(data.channel);
  // ...
} catch (error) {
  throw new Error(
    `Nenhuma credencial ativa encontrada para ${data.channel}. ` +
    `Por favor, contate o administrador para configurar as credenciais.`
  );
}
```

---

## 📚 Arquivos para Modificar

1. ✅ `src/usercase/messaging/CreateInstance.ts` - Lógica principal
2. ✅ `src/presentation/controllers/messaging/CreateInstanceController.ts` - Controller
3. ⚠️ (Opcional) `prisma/schema.prisma` - Se quiser rastrear credencial usada
4. ⚠️ (Opcional) Swagger docs - Atualizar documentação da API

---

## 🎯 Resultado Final

**Antes**:
```json
// Usuário precisa saber e passar credenciais
{
  "channel": "whatsapp",
  "instanceName": "loja1",
  "apiToken": "B6D711...",  ❌ Obrigatório
  "baseUrl": "http://..."   ❌ Obrigatório
}
```

**Depois**:
```json
// Usuário só precisa do básico
{
  "channel": "whatsapp",
  "instanceName": "loja1"
  // ✅ Credenciais buscadas automaticamente!
}
```

---

## 🚀 Pronto!

Com essas mudanças, seu sistema estará **100% integrado** e funcionando perfeitamente!

**Qualquer dúvida, consulte**:
- `INTEGRATION_CREDENTIALS_GUIDE.md` - Guia completo
- `INTEGRATION_CREDENTIALS_SUMMARY.md` - Resumo da implementação
