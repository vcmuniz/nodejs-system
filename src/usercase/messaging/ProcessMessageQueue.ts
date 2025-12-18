import { IMessagingRepository } from '../../ports/IMessagingRepository';
import { MessagingAdapterFactory } from '../../infra/messaging/MessagingAdapterFactory';
import { MessageStatus } from '../../domain/messaging/MessagingChannel';
import { MessageQueueEvent } from '../../domain/messaging/MessageQueueEvent';

export class ProcessMessageQueue {
  constructor(
    private messagingRepository: IMessagingRepository,
    private adapterFactory: MessagingAdapterFactory
  ) {}

  async execute(event: MessageQueueEvent): Promise<void> {
    const { messageId, channel, channelInstanceId, remoteJid, message, mediaUrl, mediaType, credentials, retryCount } = event;

    console.log(`[ProcessMessageQueue] Processando mensagem ${messageId} (tentativa ${retryCount + 1})`);

    try {
      await this.messagingRepository.updateMessageStatus(messageId, MessageStatus.PROCESSING);

      const adapter = this.adapterFactory.createAdapter(channel, credentials);

      const result = await adapter.sendMessage({
        channelInstanceId,
        remoteJid,
        message,
        mediaUrl,
        mediaType,
      });

      if (result.channelMessageId) {
        await this.messagingRepository.updateMessageChannelId(messageId, result.channelMessageId);
      }
      
      await this.messagingRepository.updateMessageStatus(messageId, MessageStatus.SENT);
      
      console.log(`[ProcessMessageQueue] Mensagem ${messageId} enviada com sucesso`);
    } catch (error: any) {
      console.error(`[ProcessMessageQueue] Erro ao processar mensagem ${messageId}:`, error.message);
      
      const newRetryCount = retryCount + 1;
      const maxRetries = 3;

      if (newRetryCount >= maxRetries) {
        await this.messagingRepository.updateMessageStatus(messageId, MessageStatus.FAILED);
        await this.messagingRepository.updateMessageError(messageId, error.message, newRetryCount);
        console.log(`[ProcessMessageQueue] Mensagem ${messageId} falhou após ${maxRetries} tentativas`);
      } else {
        await this.messagingRepository.updateMessageError(messageId, error.message, newRetryCount);
        console.log(`[ProcessMessageQueue] Mensagem ${messageId} será reprocessada (tentativa ${newRetryCount}/${maxRetries})`);
        throw error;
      }
    }
  }
}
