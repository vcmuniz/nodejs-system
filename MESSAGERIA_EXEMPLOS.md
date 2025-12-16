# Exemplos de Código - Messageria

## 1. Integrar Rotas no App

```typescript
// src/app.ts
import { Express } from 'express';
import { makeMessagingRoutes } from './presentation/routes/messaging.routes';

export function setupRoutes(app: Express) {
  // ... outras rotas ...
  
  // Messageria genérica (WhatsApp, SMS, Email, etc)
  app.use('/api/messaging', makeMessagingRoutes());
  
  // ... outras rotas ...
}
```

---

## 2. Usar em Controllers de Outras Features

Se você quer enviar uma mensagem de uma venda confirmada:

```typescript
// src/presentation/controllers/orders/CompleteOrderController.ts
import { makeSendMessageUseCase } from '../../factories/messaging/makeMessagingUseCases';
import { MessagingChannel } from '../../../domain/messaging/MessagingChannel';

export class CompleteOrderController {
  async handle(req: Request, res: Response) {
    try {
      const { orderId } = req.body;
      const userId = req.user?.id;

      // 1. Completar pedido (lógica existente)
      // ... seu código ...

      // 2. Enviar confirmação via Messageria (agnóstica de canal!)
      const sendMessage = makeSendMessageUseCase();
      await sendMessage.execute({
        userId,
        channel: MessagingChannel.WHATSAPP,
        channelInstanceId: 'default-whatsapp', // ou ler do BD
        remoteJid: order.customerPhone,
        message: `Seu pedido #${orderId} foi confirmado! ✅`
      });

      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
```

---

## 3. Use Case Customizado: Enviar com Retry

```typescript
// src/usercase/messaging/SendMessageWithRetry.ts
import { IMessagingRepository } from '../../ports/IMessagingRepository';
import { MessagingAdapterFactory } from '../../infra/messaging/MessagingAdapterFactory';
import { MessagingChannel, MessageStatus } from '../../domain/messaging/MessagingChannel';

export class SendMessageWithRetry {
  constructor(
    private messagingRepository: IMessagingRepository,
    private adapterFactory: MessagingAdapterFactory
  ) {}

  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const instance = await this.messagingRepository.getInstanceByChannelId(
          input.channelInstanceId,
          input.channel
        );

        if (!instance) throw new Error('Instância não encontrada');
        if (instance.userId !== input.userId) throw new Error('Acesso negado');

        // Registrar tentativa
        const message = await this.messagingRepository.logMessage({
          id: uuid(),
          userId: input.userId,
          instanceId: instance.id,
          channel: input.channel,
          remoteJid: input.remoteJid,
          message: input.message,
          direction: 'sent',
          status: MessageStatus.PENDING,
          retries: attempt - 1,
          maxRetries: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Enviar
        const adapter = this.adapterFactory.createAdapter(input.channel);
        const result = await adapter.sendMessage({
          channelInstanceId: input.channelInstanceId,
          remoteJid: input.remoteJid,
          message: input.message,
        });

        // Sucesso!
        if (result.channelMessageId) {
          await this.messagingRepository.updateMessageChannelId(
            message.id,
            result.channelMessageId
          );
        }
        await this.messagingRepository.updateMessageStatus(
          message.id,
          MessageStatus.SENT
        );

        return {
          messageId: message.id,
          channelMessageId: result.channelMessageId,
          status: MessageStatus.SENT,
          timestamp: result.timestamp,
        };
      } catch (error: any) {
        lastError = error;
        console.error(`Tentativa ${attempt} falhou:`, error.message);

        if (attempt < 3) {
          // Esperar exponencialmente (1s, 2s, 4s)
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Falha ao enviar mensagem após 3 tentativas');
  }
}
```

---

## 4. Adaptador para SMS (Twilio)

```typescript
// src/infra/messaging/adapters/TwilioSmsAdapter.ts
import { Twilio } from 'twilio';
import { IMessagingAdapter, SendMessageInput, SendMessageOutput } from '../../../ports/IMessagingAdapter';
import { MessagingChannel, ConnectionStatus } from '../../../domain/messaging/MessagingChannel';

export class TwilioSmsAdapter implements IMessagingAdapter {
  private client: Twilio;

  constructor(accountSid: string, authToken: string) {
    this.client = new Twilio(accountSid, authToken);
  }

  getChannel(): MessagingChannel {
    return MessagingChannel.SMS;
  }

  async connect() {
    return { status: ConnectionStatus.CONNECTED };
  }

  async disconnect() {}

  async sendMessage(input: SendMessageInput): Promise<SendMessageOutput> {
    const message = await this.client.messages.create({
      body: input.message,
      from: input.channelInstanceId, // Seu número Twilio
      to: input.remoteJid,           // Número destino
    });

    return {
      channelMessageId: message.sid,
      timestamp: new Date(),
    };
  }

  async getStatus() {
    return { status: ConnectionStatus.CONNECTED, isReady: true };
  }

  async handleWebhook(body: any) {
    return { event: 'message:status', data: body };
  }
}
```

---

## 5. Atualizar Factory para SMS

```typescript
// src/infra/messaging/MessagingAdapterFactory.ts (atualizado)
import { MessagingChannel } from '../../../domain/messaging/MessagingChannel';
import { IMessagingAdapter } from '../../../ports/IMessagingAdapter';
import { WhatsAppAdapter } from './adapters/WhatsAppAdapter';
import { TwilioSmsAdapter } from './adapters/TwilioSmsAdapter';

export class MessagingAdapterFactory {
  constructor(
    private evolutionAPI: IEvolutionAPI,
    private twilioAccountSid: string,
    private twilioAuthToken: string
  ) {}

  createAdapter(channel: MessagingChannel): IMessagingAdapter {
    switch (channel) {
      case MessagingChannel.WHATSAPP:
        return new WhatsAppAdapter(this.evolutionAPI);
      
      case MessagingChannel.SMS:
        return new TwilioSmsAdapter(this.twilioAccountSid, this.twilioAuthToken);
      
      default:
        throw new Error(`Adaptador não implementado: ${channel}`);
    }
  }
}
```

---

## 6. Webhook Genérica para Processar Eventos

```typescript
// src/presentation/routes/messaging.webhooks.ts
import { Router, Request, Response } from 'express';
import { makeMessagingRepository } from '../../infra/database/factories/makeMessagingRepository';
import { makeMessagingAdapterFactory } from '../../infra/database/factories/makeMessagingAdapterFactory';
import { MessagingChannel, MessageStatus } from '../../domain/messaging/MessagingChannel';

export const makeMessagingWebhookRoutes = () => {
  const router = Router();
  const messagingRepository = makeMessagingRepository();
  const adapterFactory = makeMessagingAdapterFactory();

  // Webhook para todos os canais
  router.post('/webhooks/:channel', async (req: Request, res: Response) => {
    try {
      const { channel } = req.params;
      const { instance, event, data } = req.body;

      console.log(`Webhook ${channel}:`, { event, instance });

      // Processar eventos genéricos
      switch (event) {
        case 'message.sent':
          // Atualizar status da mensagem
          if (data.messageId) {
            await messagingRepository.updateMessageStatus(
              data.messageId,
              MessageStatus.SENT
            );
          }
          break;

        case 'message.delivered':
          if (data.messageId) {
            await messagingRepository.updateMessageStatus(
              data.messageId,
              MessageStatus.DELIVERED
            );
          }
          break;

        case 'message.read':
          if (data.messageId) {
            await messagingRepository.updateMessageStatus(
              data.messageId,
              MessageStatus.READ
            );
          }
          break;

        case 'connection.opened':
          if (data.instanceId) {
            await messagingRepository.updateInstanceStatus(
              data.instanceId,
              'connected'
            );
          }
          break;

        case 'connection.closed':
          if (data.instanceId) {
            await messagingRepository.updateInstanceStatus(
              data.instanceId,
              'disconnected'
            );
          }
          break;

        default:
          console.log(`Evento desconhecido: ${event}`);
      }

      return res.json({ success: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
};
```

---

## 7. Testes Unitários (Mock Adapter)

```typescript
// src/__tests__/usercase/messaging/SendMessage.test.ts
import { SendMessage } from '../../../usercase/messaging/SendMessage';
import { MessagingChannel, MessageStatus } from '../../../domain/messaging/MessagingChannel';

// Mock adapter
class MockMessagingAdapter implements IMessagingAdapter {
  getChannel() { return MessagingChannel.WHATSAPP; }
  async connect() { return { status: 'connected' }; }
  async disconnect() {}
  async sendMessage() {
    return { channelMessageId: 'mock-id', timestamp: new Date() };
  }
  async getStatus() { return { status: 'connected', isReady: true }; }
  async handleWebhook() { return { event: 'test', data: {} }; }
}

class MockAdapterFactory implements IMessagingAdapterFactory {
  createAdapter() { return new MockMessagingAdapter(); }
}

describe('SendMessage', () => {
  let useCase: SendMessage;
  let mockRepository: IMessagingRepository;
  let mockFactory: MockAdapterFactory;

  beforeEach(() => {
    mockRepository = {
      saveInstance: jest.fn(),
      getInstanceByChannelId: jest.fn().mockResolvedValue({
        id: 'instance-id',
        userId: 'user-id',
      }),
      logMessage: jest.fn().mockResolvedValue({ id: 'msg-id' }),
      updateMessageStatus: jest.fn(),
      updateMessageChannelId: jest.fn(),
      // ... outros mocks
    };

    mockFactory = new MockAdapterFactory();
    useCase = new SendMessage(mockRepository, mockFactory);
  });

  it('should send message successfully', async () => {
    const result = await useCase.execute({
      userId: 'user-id',
      channel: MessagingChannel.WHATSAPP,
      channelInstanceId: 'instance',
      remoteJid: '5585999999999',
      message: 'Test',
    });

    expect(result.status).toBe(MessageStatus.SENT);
    expect(mockRepository.updateMessageStatus).toHaveBeenCalled();
  });
});
```

---

## 8. Migração Gradual: Compatibilidade com WhatsApp Old

```typescript
// src/usercase/whatsapp/SendWhatsAppMessage.ts (DEPRECATED - use Messaging instead)
import { SendMessage } from '../messaging/SendMessage';
import { MessagingChannel } from '../../domain/messaging/MessagingChannel';

/**
 * @deprecated Use SendMessage from messaging instead
 * 
 * Migração:
 * OLD: await sendWhatsAppMessage.execute({ instanceName, phoneNumber, message })
 * NEW: await sendMessage.execute({ channel: MessagingChannel.WHATSAPP, channelInstanceId, remoteJid, message })
 */
export class SendWhatsAppMessage {
  constructor(private sendMessage: SendMessage) {}

  async execute(input: {
    userId: string;
    instanceName: string;
    phoneNumber: string;
    message: string;
  }) {
    // Wrapper para compatibilidade
    return await this.sendMessage.execute({
      userId: input.userId,
      channel: MessagingChannel.WHATSAPP,
      channelInstanceId: input.instanceName,
      remoteJid: input.phoneNumber,
      message: input.message,
    });
  }
}
```

---

## Próximas Ações

1. **Integrar**: `app.use('/api/messaging', makeMessagingRoutes());`
2. **Migrar**: Converter controllers antigos para usar nova messageria
3. **Webhook**: Configurar webhook genérica
4. **Adapters**: Adicionar SMS, Email, Telegram
5. **Deprecar**: Marcar WhatsApp routes como deprecated
6. **Testar**: Colocar em produção gradualmente
