import { IMessageQueue } from '../../ports/IMessageQueue';
import { ProcessMessageQueue } from '../../usercase/messaging/ProcessMessageQueue';
import { MessageQueueEvent } from '../../domain/messaging/MessageQueueEvent';

export class MessageConsumer {
  constructor(
    private messageQueue: IMessageQueue,
    private processMessageQueue: ProcessMessageQueue
  ) {}

  async start(): Promise<void> {
    console.log('[MessageConsumer] Iniciando consumer de mensagens...');

    await this.messageQueue.subscribe('messaging.send', async (data: Record<string, any>) => {
      try {
        const event = data as MessageQueueEvent;
        await this.processMessageQueue.execute(event);
      } catch (error: any) {
        console.error('[MessageConsumer] Erro ao processar evento:', error.message);
      }
    });

    console.log('[MessageConsumer] Consumer iniciado e aguardando mensagens');
  }

  async stop(): Promise<void> {
    console.log('[MessageConsumer] Parando consumer...');
    await this.messageQueue.disconnect();
  }
}
