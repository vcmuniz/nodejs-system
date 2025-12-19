# Messageria - Quick Start

## 📦 O que foi criado?

Uma **arquitetura agnóstica de messageria** que permite suportar múltiplos canais (WhatsApp, SMS, Email, Telegram) sem expor nada específico de cada um.

---

## 🚀 Como usar?

### 1. **Enviar Mensagem WhatsApp**

```bash
POST /messaging/message/send
Content-Type: application/json
Authorization: Bearer <token>

{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-instance",
  "remoteJid": "5585999999999",
  "message": "Olá, isso é uma mensagem de teste!",
  "mediaUrl": null,
  "mediaType": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "data": {
    "messageId": "uuid-da-mensagem",
    "channelMessageId": "id-gerado-pelo-whatsapp",
    "status": "sent",
    "timestamp": "2024-12-16T12:00:00Z"
  }
}
```

---

### 2. **Criar Instância WhatsApp**

```bash
POST /messaging/instance
Content-Type: application/json
Authorization: Bearer <token>

{
  "channel": "whatsapp_evolution",
  "channelInstanceId": "my-instance",
  "channelPhoneOrId": "5585999999999",
  "credentials": {
    "token": "evolution-api-token"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Instância criada com sucesso",
  "data": {
    "instanceId": "uuid-da-instancia",
    "status": "connecting",
    "qrCode": "data:image/png;base64,...",
    "message": "Escaneie o QR code"
  }
}
```

---

### 3. **Listar Instâncias**

```bash
GET /messaging/instances?channel=whatsapp_evolution
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Instâncias listadas com sucesso",
  "data": [
    {
      "id": "uuid-da-instancia",
      "userId": "user-id",
      "channel": "whatsapp_evolution",
      "channelInstanceId": "my-instance",
      "channelPhoneOrId": "5585999999999",
      "status": "connected",
      "qrCode": null,
      "metadata": {},
      "createdAt": "2024-12-16T10:00:00Z",
      "updatedAt": "2024-12-16T11:00:00Z",
      "lastConnectedAt": "2024-12-16T11:00:00Z"
    }
  ]
}
```

---

## 🔧 Adicionar Novo Canal (SMS)

### Passo 1: Criar Adaptador

```typescript
// src/infra/messaging/adapters/SmsAdapter.ts
import { IMessagingAdapter } from '../../../ports/IMessagingAdapter';
import { MessagingChannel, ConnectionStatus } from '../../../domain/messaging/MessagingChannel';
import { SendMessageInput, SendMessageOutput, ConnectInput, ConnectOutput } from '../../../ports/IMessagingAdapter';

export class SmsAdapter implements IMessagingAdapter {
  constructor(private twilioClient: any) {}

  getChannel(): MessagingChannel {
    return MessagingChannel.SMS;
  }

  async connect(input: ConnectInput): Promise<ConnectOutput> {
    // Lógica para conectar com provedor SMS (Twilio, AWS SNS, etc)
    return {
      status: ConnectionStatus.CONNECTED,
      message: 'Conectado com sucesso'
    };
  }

  async disconnect(input: DisconnectInput): Promise<void> {
    // Lógica para desconectar
  }

  async sendMessage(input: SendMessageInput): Promise<SendMessageOutput> {
    const response = await this.twilioClient.messages.create({
      body: input.message,
      from: input.channelInstanceId,
      to: input.remoteJid
    });

    return {
      channelMessageId: response.sid,
      timestamp: new Date()
    };
  }

  async getStatus(input: any) {
    // Implementar
    return { status: ConnectionStatus.CONNECTED, isReady: true };
  }

  async handleWebhook(body: any) {
    return { event: 'message:received', data: body };
  }
}
```

### Passo 2: Registrar na Factory

```typescript
// src/infra/messaging/MessagingAdapterFactory.ts
createAdapter(channel: MessagingChannel): IMessagingAdapter {
  switch (channel) {
    case MessagingChannel.WHATSAPP:
      return new WhatsAppAdapter(this.evolutionAPI);
    
    case MessagingChannel.SMS:
      return new SmsAdapter(this.twilioClient);  // ← Novo
    
    case MessagingChannel.EMAIL:
    case MessagingChannel.TELEGRAM:
    case MessagingChannel.FACEBOOK:
    default:
      throw new Error(`Adaptador não implementado para o canal: ${channel}`);
  }
}
```

### Passo 3: Usar!

```bash
POST /messaging/message/send
{
  "channel": "sms",           # ← Muda só aqui!
  "channelInstanceId": "sms-account",
  "remoteJid": "+5585999999999",
  "message": "Olá via SMS!"
}
```

---

## 📁 Estrutura de Arquivos

```
src/
├── domain/messaging/
│   ├── MessagingChannel.ts      # Enums (WHATSAPP, SMS, EMAIL, etc)
│   └── MessagingInstance.ts     # Interfaces de dados
├── ports/
│   ├── IMessagingAdapter.ts     # Interface para adaptadores
│   └── IMessagingRepository.ts  # Interface para persistência
├── infra/
│   ├── messaging/
│   │   ├── adapters/
│   │   │   └── WhatsAppAdapter.ts       # Implementação WhatsApp
│   │   └── MessagingAdapterFactory.ts   # Factory de adaptadores
│   ├── database/
│   │   ├── repositories/
│   │   │   └── PrismaMessagingRepository.ts  # Implementação Prisma
│   │   └── factories/
│   │       ├── makeMessagingRepository.ts
│   │       └── makeMessagingAdapterFactory.ts
├── usercase/messaging/
│   ├── SendMessage.ts                   # Use case: enviar
│   ├── CreateMessagingInstance.ts       # Use case: criar instância
│   └── ListMessagingInstances.ts        # Use case: listar
├── presentation/
│   ├── controllers/messaging/
│   │   ├── SendMessageController.ts
│   │   ├── CreateMessagingInstanceController.ts
│   │   └── ListMessagingInstancesController.ts
│   ├── factories/messaging/
│   │   └── makeMessagingUseCases.ts
│   └── routes/
│       └── messaging.routes.ts
└── prisma/
    └── schema.prisma     # Tabelas: MessagingInstance, MessagingMessage
```

---

## ✅ Checklist de Implementação

- [x] Domain Layer (enums e interfaces)
- [x] Ports (IMessagingAdapter, IMessagingRepository)
- [x] WhatsApp Adapter
- [x] Prisma Repository
- [x] Use Cases (SendMessage, CreateInstance, ListInstances)
- [x] Controllers
- [x] Routes
- [x] Factories
- [ ] **Próximo**: Gerar migration do Prisma
- [ ] **Próximo**: Integrar nas rotas da app
- [ ] **Próximo**: Implementar webhook genérica
- [ ] **Próximo**: Adicionar mais adaptadores (SMS, Email, Telegram)

---

## 🎯 Benefícios

| Antes | Depois |
|-------|--------|
| ❌ API expõe `/whatsapp/*` | ✅ API expõe `/messaging/*` |
| ❌ Tabelas `whatsapp_instances` | ✅ Tabelas `messaging_instances` |
| ❌ Adicionar SMS = muito código | ✅ Adicionar SMS = implementar 1 adapter |
| ❌ Controllers específicos | ✅ Controllers genéricos |
| ❌ Trocar Evolution API = grande refactor | ✅ Trocar adapter = mínimo impacto |

---

## 🔗 Próximas Ações

1. Rodar migration do Prisma:
   ```bash
   npx prisma migrate dev --name "add-messaging-tables"
   ```

2. Integrar rotas no `app.ts`:
   ```typescript
   import { makeMessagingRoutes } from './presentation/routes/messaging.routes';
   
   app.use('/api/messaging', makeMessagingRoutes());
   ```

3. Testar com Postman/Insomnia

4. Implementar webhook genérica para processar eventos de todos os canais

5. Considerar deprecar `/whatsapp/*` em favor de `/messaging/*`
