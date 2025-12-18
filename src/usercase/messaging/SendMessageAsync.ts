import { IMessagingRepository } from '../../ports/IMessagingRepository';
import { IMessageQueue } from '../../ports/IMessageQueue';
import { MessagingChannel, MessageStatus } from '../../domain/messaging/MessagingChannel';
import { MessageQueueEvent } from '../../domain/messaging/MessageQueueEvent';
import { randomUUID } from 'crypto';

export interface SendMessageAsyncInput {
  userId: string;
  channel: MessagingChannel;
  channelInstanceId: string;
  remoteJid: string;
  message: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface SendMessageAsyncOutput {
  messageId: string;
  status: string;
  queued: boolean;
}

export class SendMessageAsync {
  constructor(
    private messagingRepository: IMessagingRepository,
    private messageQueue: IMessageQueue
  ) {}

  async execute(input: SendMessageAsyncInput): Promise<SendMessageAsyncOutput> {
    const instance = await this.messagingRepository.getInstanceByChannelId(
      input.channelInstanceId,
      input.channel
    );

    if (!instance) {
      throw new Error(`Instância não encontrada: ${input.channelInstanceId}`);
    }

    if (instance.userId !== input.userId) {
      throw new Error('Acesso negado: instância não pertence ao usuário');
    }

    const messageId = randomUUID();
    await this.messagingRepository.logMessage({
      id: messageId,
      userId: input.userId,
      instanceId: instance.id,
      channel: input.channel,
      remoteJid: input.remoteJid,
      message: input.message,
      direction: 'sent',
      status: MessageStatus.QUEUED,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
      retries: 0,
      maxRetries: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const event: MessageQueueEvent = {
      messageId,
      userId: input.userId,
      channel: input.channel,
      channelInstanceId: input.channelInstanceId,
      instanceId: instance.id,
      remoteJid: input.remoteJid,
      message: input.message,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
      credentials: instance.credentials,
      retryCount: 0,
    };

    await this.messageQueue.publish({
      topic: 'messaging.send',
      value: event,
      key: messageId,
    });

    return {
      messageId,
      status: MessageStatus.QUEUED,
      queued: true,
    };
  }
}
