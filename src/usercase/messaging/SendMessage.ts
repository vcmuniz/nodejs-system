// Use Case - Enviar mensagem através de qualquer canal
import { IMessagingRepository } from '../../ports/IMessagingRepository';
import { MessagingAdapterFactory } from '../../infra/messaging/MessagingAdapterFactory';
import { MessagingChannel, MessageStatus } from '../../domain/messaging/MessagingChannel';
import { randomUUID } from 'crypto';

export interface SendMessageInput {
  userId: string;
  channel: MessagingChannel;
  channelInstanceId: string; // Nome da instância WhatsApp ou ID no canal
  remoteJid: string; // Destinatário
  message: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface SendMessageOutput {
  messageId: string;
  channelMessageId?: string;
  status: string;
  timestamp: Date;
}

export class SendMessage {
  constructor(
    private messagingRepository: IMessagingRepository,
    private adapterFactory: MessagingAdapterFactory
  ) {}

  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    // 1. Validar que a instância existe e pertence ao usuário
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

    // 2. Criar registro de mensagem no banco
    const messageId = randomUUID();
    const messagingMessage = await this.messagingRepository.logMessage({
      id: messageId,
      userId: input.userId,
      instanceId: instance.id,
      channel: input.channel,
      remoteJid: input.remoteJid,
      message: input.message,
      direction: 'sent',
      status: MessageStatus.PENDING,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
      retries: 0,
      maxRetries: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      // 3. Obter adaptador do canal
      const adapter = this.adapterFactory.createAdapter(input.channel);

      // 4. Enviar mensagem através do adaptador
      const result = await adapter.sendMessage({
        channelInstanceId: input.channelInstanceId,
        remoteJid: input.remoteJid,
        message: input.message,
        mediaUrl: input.mediaUrl,
        mediaType: input.mediaType,
      });

      // 5. Atualizar mensagem com ID do canal e marcar como enviada
      if (result.channelMessageId) {
        await this.messagingRepository.updateMessageChannelId(messageId, result.channelMessageId);
      }
      await this.messagingRepository.updateMessageStatus(messageId, MessageStatus.SENT);

      return {
        messageId,
        channelMessageId: result.channelMessageId,
        status: MessageStatus.SENT,
        timestamp: result.timestamp,
      };
    } catch (error: any) {
      // 6. Em caso de erro, atualizar status e registrar erro
      await this.messagingRepository.updateMessageError(messageId, error.message, 1);
      throw error;
    }
  }
}
