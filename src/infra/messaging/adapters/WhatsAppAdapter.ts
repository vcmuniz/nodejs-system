// Adaptador para WhatsApp (Evolution API)
import { IMessagingAdapter } from '../../../ports/IMessagingAdapter';
import { MessagingChannel, ConnectionStatus } from '../../../domain/messaging/MessagingChannel';
import { IEvolutionAPI } from '../../../ports/IEvolutionAPI';

export class WhatsAppAdapter implements IMessagingAdapter {
  constructor(private evolutionAPI: IEvolutionAPI) {}

  getChannel(): MessagingChannel {
    return MessagingChannel.WHATSAPP_EVOLUTION;
  }

  async connect(params: { channelInstanceId: string; credentials?: any; needsCreate?: boolean }): Promise<any> {
    try {
      const needsCreate = params.needsCreate !== false; // Default: true
      
      console.log(`[WhatsAppAdapter] Conectando instância: ${params.channelInstanceId}, needsCreate: ${needsCreate}`);
      
      // Se precisa criar, tenta criar primeiro
      if (needsCreate) {
        try {
          console.log(`[WhatsAppAdapter] Criando instância: ${params.channelInstanceId}`);
          await this.evolutionAPI.createInstance({
            instanceName: params.channelInstanceId,
            integration: 'WHATSAPP-BAILEYS',
          });
          console.log(`[WhatsAppAdapter] Instância criada com sucesso`);
        } catch (createError: any) {
          // Se erro 409 (já existe), ignora e continua
          if (createError.response?.status === 409 || createError.message?.includes('já existe')) {
            console.log(`[WhatsAppAdapter] Instância já existe, continuando...`);
          } else {
            throw createError;
          }
        }
      }
      
      // Conectar para gerar QR Code
      console.log(`[WhatsAppAdapter] Conectando para gerar QR Code: ${params.channelInstanceId}`);
      const connectResponse = await this.evolutionAPI.connectInstance(params.channelInstanceId);
      
      console.log(`[WhatsAppAdapter] QR Code recebido:`, connectResponse.base64 ? 'SIM' : 'NÃO');
      
      return {
        status: ConnectionStatus.CONNECTING,
        qrCode: connectResponse.base64, // QR Code vem direto na raiz da resposta
        message: needsCreate 
          ? 'Instância criada. Escaneie o QR Code no WhatsApp.' 
          : 'Instância já existente. Escaneie o QR Code.',
      };
    } catch (error: any) {
      console.error(`[WhatsAppAdapter] Erro ao conectar:`, error.response?.data || error.message);
      
      return {
        status: ConnectionStatus.ERROR,
        message: error.response?.data?.message || error.message || 'Erro ao criar/conectar instância',
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
