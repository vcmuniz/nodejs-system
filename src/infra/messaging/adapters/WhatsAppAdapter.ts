// Adaptador para WhatsApp (Evolution API)
import { IMessagingAdapter } from '../../../ports/IMessagingAdapter';
import { MessagingChannel, ConnectionStatus } from '../../../domain/messaging/MessagingChannel';
import { IEvolutionAPI } from '../../../ports/IEvolutionAPI';

export class WhatsAppAdapter implements IMessagingAdapter {
  constructor(private evolutionAPI: IEvolutionAPI) {}

  getChannel(): MessagingChannel {
    return MessagingChannel.WHATSAPP_EVOLUTION;
  }

  async connect(params: { channelInstanceId: string; credentials?: any }): Promise<any> {
    try {
      console.log(`[WhatsAppAdapter] Criando instância: ${params.channelInstanceId}`);
      
      // 1. Criar a instância na Evolution API
      const createResponse = await this.evolutionAPI.createInstance({
        instanceName: params.channelInstanceId,
        integration: 'WHATSAPP-BAILEYS',
      });
      
      console.log(`[WhatsAppAdapter] Instância criada:`, createResponse);
      
      // 2. Conectar para gerar QR Code
      const connectResponse = await this.evolutionAPI.connectInstance(params.channelInstanceId);
      
      console.log(`[WhatsAppAdapter] QR Code gerado:`, connectResponse);
      
      return {
        status: ConnectionStatus.CONNECTING,
        qrCode: connectResponse.qrcode?.base64,
        message: 'Instância criada. Escaneie o QR Code no WhatsApp.',
      };
    } catch (error: any) {
      console.error(`[WhatsAppAdapter] Erro ao conectar:`, error);
      
      // Se a instância já existe, apenas tenta conectar
      if (error.message?.includes('já existe') || error.response?.status === 409) {
        try {
          const connectResponse = await this.evolutionAPI.connectInstance(params.channelInstanceId);
          return {
            status: ConnectionStatus.CONNECTING,
            qrCode: connectResponse.qrcode?.base64,
            message: 'Instância já existe. Escaneie o QR Code.',
          };
        } catch (connectError) {
          console.error(`[WhatsAppAdapter] Erro ao reconectar:`, connectError);
        }
      }
      
      return {
        status: ConnectionStatus.ERROR,
        message: error.message || 'Erro ao criar instância',
      };
    }
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
