// Adaptador para WhatsApp (Evolution API)
import { IMessagingAdapter } from '../../../ports/IMessagingAdapter';
import { MessagingChannel, ConnectionStatus } from '../../../domain/messaging/MessagingChannel';
import { IEvolutionAPI } from '../../../ports/IEvolutionAPI';

export class WhatsAppAdapter implements IMessagingAdapter {
  constructor(private evolutionAPI: IEvolutionAPI) {}

  getChannel(): MessagingChannel {
    return MessagingChannel.WHATSAPP_EVOLUTION;
  }

  async connect(): Promise<any> {
    return { status: ConnectionStatus.CONNECTING, message: 'Conectando...' };
  }

  async disconnect(): Promise<void> {}

  async sendMessage(input: any): Promise<any> {
    try {
      const response = await this.evolutionAPI.sendMessage(input.channelInstanceId, {
        number: input.remoteJid,
        text: input.message,
        mediaUrl: input.mediaUrl,
      });
      return { channelMessageId: response.key?.id || '', timestamp: new Date() };
    } catch (error: any) {
      throw error;
    }
  }

  async getStatus(): Promise<any> {
    return { status: ConnectionStatus.CONNECTED, isReady: true };
  }

  async handleWebhook(body: any): Promise<any> {
    return { event: 'unknown', data: body };
  }
}
