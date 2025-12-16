# Arquitetura de Messageria Genérica

## 🎯 Objetivo

Criar uma camada de abstração que desacopla o WhatsApp (e outros canais de mensageria) da aplicação, permitindo:

- ✅ Suportar múltiplos canais (WhatsApp, SMS, Email, Telegram, Facebook, etc)
- ✅ Trocar adaptadores sem alterar a lógica de negócio
- ✅ Expor apenas "Messageria" para o app, não "WhatsApp"
- ✅ Usar padrão **Strategy/Adapter** para máxima flexibilidade

---

## 📐 Arquitetura

### 1. **Domain Layer** - Tipos e Interfaces

```
src/domain/messaging/
├── MessagingChannel.ts    # Enums: MessagingChannel, ConnectionStatus, MessageStatus
└── MessagingInstance.ts   # Interfaces: MessagingInstanceData, MessagingMessage, MessagingWebhookEvent
```

**Exemplo:**
```typescript
enum MessagingChannel {
  WHATSAPP_EVOLUTION = 'whatsapp_evolution',
  SMS = 'sms',
  EMAIL = 'email',
  TELEGRAM = 'telegram'
}

interface MessagingInstanceData {
  id: string;
  userId: string;
  channel: MessagingChannel;
  channelInstanceId: string; // Nome único no canal
  status: ConnectionStatus;
  // ...
}
```

### 2. **Ports Layer** - Contratos

```
src/ports/
├── IMessagingAdapter.ts    # Interface que cada adaptador implementa
└── IMessagingRepository.ts # Interface para persistência de dados
```

**IMessagingAdapter:**
```typescript
interface IMessagingAdapter {
  getChannel(): MessagingChannel;
  connect(input: ConnectInput): Promise<ConnectOutput>;
  disconnect(input: DisconnectInput): Promise<void>;
  sendMessage(input: SendMessageInput): Promise<SendMessageOutput>;
  getStatus(input: GetStatusInput): Promise<GetStatusOutput>;
  handleWebhook(body: any): Promise<{ event: string; data: any }>;
}
```

### 3. **Infrastructure Layer** - Implementações

```
src/infra/messaging/
├── adapters/
│   ├── WhatsAppAdapter.ts      # Implementa IMessagingAdapter para WhatsApp
│   ├── SmsAdapter.ts           # (futuro) Implementa para SMS
│   ├── EmailAdapter.ts         # (futuro) Implementa para Email
│   └── TelegramAdapter.ts      # (futuro) Implementa para Telegram
└── MessagingAdapterFactory.ts  # Factory que cria o adaptador correto

src/infra/database/repositories/
└── PrismaMessagingRepository.ts # Implementa IMessagingRepository com Prisma
```

### 4. **Use Cases Layer** - Lógica de Negócio

```
src/usercase/messaging/
├── SendMessage.ts              # Enviar mensagem (agnóstica de canal)
├── CreateMessagingInstance.ts  # Criar/conectar instância
└── ListMessagingInstances.ts   # Listar instâncias do usuário
```

### 5. **Database Layer** - Tabelas Genéricas

```prisma
model MessagingInstance {
  id                String   @id
  userId            String
  channel           String   // 'whatsapp', 'sms', 'email', etc
  channelInstanceId String   // Nome/ID único no canal
  channelPhoneOrId  String   // Telefone, email, ID, etc
  status            String   // pending, connecting, connected, disconnected, error
  qrCode            String?  // Para canais que precisam QR
  metadata          Json?    // Dados específicos do canal
  // ...
}

model MessagingMessage {
  id               String
  userId           String
  instanceId       String
  channel          String   // 'whatsapp', 'sms', 'email', etc
  remoteJid        String   // Destinatário
  message          String
  channelMessageId String?  // ID gerado pelo canal
  direction        String   // sent, received
  status           String   // pending, sent, delivered, read, failed
  // ...
}
```

---

## 🔄 Fluxo de Uso

### Exemplo 1: Enviar Mensagem WhatsApp

```typescript
// 1. Injetar dependências (no controller/factory)
const messagingRepository = new PrismaMessagingRepository(prisma);
const evolutionAPI = new EvolutionAPIClient();
const adapterFactory = new MessagingAdapterFactory(evolutionAPI);
const sendMessageUseCase = new SendMessage(messagingRepository, adapterFactory);

// 2. Chamar use case (agnóstico de canal!)
const result = await sendMessageUseCase.execute({
  userId: 'user123',
  channel: MessagingChannel.WHATSAPP,
  channelInstanceId: 'my-instance',
  remoteJid: '5585999999999',
  message: 'Olá!'
});
```

### Exemplo 2: Adicionar Novo Canal (SMS)

```typescript
// 1. Implementar adaptador
export class SmsAdapter implements IMessagingAdapter {
  async connect(input: ConnectInput): Promise<ConnectOutput> {
    // Lógica específica do SMS
  }
  
  async sendMessage(input: SendMessageInput): Promise<SendMessageOutput> {
    // Usar SDK do Twilio, AWS SNS, etc
  }
  // ... outros métodos
}

// 2. Registrar na factory
MessagingAdapterFactory.createAdapter(channel: MessagingChannel) {
  case MessagingChannel.SMS:
    return new SmsAdapter();
  // ...
}

// 3. Usar sem mudar o resto do código!
const result = await sendMessageUseCase.execute({
  userId: 'user123',
  channel: MessagingChannel.SMS, // ← Só muda aqui
  channelInstanceId: 'sms-account',
  remoteJid: '+5585999999999',
  message: 'Olá!'
});
```

---

## 📊 Vantagens

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Tabelas** | `whatsapp_instances`, `whatsapp_message_logs` | `messaging_instances`, `messaging_messages` |
| **Exposto na API** | `/whatsapp/*` | `/messaging/*` |
| **Adicionar novo canal** | Criar toda a estrutura | Implementar 1 adaptador |
| **Mudança de provedor** | Alterar toda a codebase | Trocar 1 adaptador |
| **Testes** | Mockado com whatsapp | Mockado com interface genérica |

---

## 🛠️ Migração Gradual

A estrutura permite **migração gradual**:

1. **Fase 1 (Atual)**: Keep `WhatsAppInstance`/`WhatsAppMessageLog` intactos
2. **Fase 2**: Novos fluxos usam `MessagingInstance`/`MessagingMessage`
3. **Fase 3**: Migrar dados antigos e deprecar tabelas old
4. **Fase 4**: Remover tabelas antigas

---

## 📝 Próximos Passos

- [ ] Criar adaptadores para SMS, Email, Telegram
- [ ] Implementar retry logic com exponential backoff
- [ ] Webhook genérico para processar eventos de todos os canais
- [ ] Dashboard para gerenciar múltiplas instâncias de diferentes canais
- [ ] Integração com filas (Kafka/RabbitMQ) para envio assíncrono
