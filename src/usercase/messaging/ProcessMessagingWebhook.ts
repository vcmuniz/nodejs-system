// Use Case - Processar Webhook da Evolution API
import { IMessagingRepository } from '../../ports/IMessagingRepository';
import { ConnectionStatus } from '../../domain/messaging/MessagingChannel';

export interface ProcessWebhookInput {
  instanceId: string; // channelInstanceId (nome da instância)
  event: string;
  data: any;
}

export class ProcessMessagingWebhook {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(input: ProcessWebhookInput): Promise<void> {
    try {
      console.log(`[ProcessMessagingWebhook] Processando evento: ${input.event} para instância: ${input.instanceId}`);

      // Buscar instância pelo channelInstanceId
      const instance = await this.messagingRepository.getInstanceByChannelId(
        input.instanceId,
        'whatsapp_evolution' as any
      );

      if (!instance) {
        console.warn(`[ProcessMessagingWebhook] Instância não encontrada: ${input.instanceId}`);
        return;
      }

      // Processar diferentes eventos
      switch (input.event) {
        case 'connection.update':
          await this.handleConnectionUpdate(instance.id, input.data);
          break;

        case 'qrcode.updated':
          console.log(`[ProcessMessagingWebhook] QR Code atualizado para instância: ${input.instanceId}`);
          // QR Code não precisa ser salvo no banco
          break;

        case 'messages.upsert':
          console.log(`[ProcessMessagingWebhook] Mensagem recebida para instância: ${input.instanceId}`);
          // Se está recebendo mensagens, instância está conectada!
          if (instance.status !== ConnectionStatus.CONNECTED) {
            console.log(`✅ [ProcessMessagingWebhook] Auto-conectando instância (recebendo mensagens)`);
            await this.messagingRepository.updateInstanceStatus(instance.id, ConnectionStatus.CONNECTED);
          }
          // TODO: Salvar mensagem recebida
          break;

        case 'messages.update':
          console.log(`[ProcessMessagingWebhook] Status de mensagem atualizado para instância: ${input.instanceId}`);
          // Se está atualizando mensagens, instância está conectada!
          if (instance.status !== ConnectionStatus.CONNECTED) {
            console.log(`✅ [ProcessMessagingWebhook] Auto-conectando instância (atualizando mensagens)`);
            await this.messagingRepository.updateInstanceStatus(instance.id, ConnectionStatus.CONNECTED);
          }
          // TODO: Atualizar status da mensagem
          break;

        default:
          console.log(`[ProcessMessagingWebhook] Evento não processado: ${input.event}`);
      }
    } catch (error: any) {
      console.error(`[ProcessMessagingWebhook] Erro ao processar webhook:`, error.message);
      throw error;
    }
  }

  private async handleConnectionUpdate(instanceId: string, data: any): Promise<void> {
    console.log(`[ProcessMessagingWebhook] Connection update data:`, JSON.stringify(data));

    // Mapear estados da Evolution API para nosso enum
    let status: ConnectionStatus;

    if (data.state === 'open' || data.status === 'open') {
      status = ConnectionStatus.CONNECTED;
      console.log(`✅ [ProcessMessagingWebhook] Instância CONECTADA: ${instanceId}`);
    } else if (data.state === 'close' || data.status === 'close') {
      status = ConnectionStatus.DISCONNECTED;
      console.log(`❌ [ProcessMessagingWebhook] Instância DESCONECTADA: ${instanceId}`);
    } else if (data.state === 'connecting' || data.status === 'connecting') {
      status = ConnectionStatus.CONNECTING;
      console.log(`🔄 [ProcessMessagingWebhook] Instância CONECTANDO: ${instanceId}`);
    } else {
      console.log(`⚠️  [ProcessMessagingWebhook] Estado desconhecido:`, data);
      return;
    }

    // Atualizar status no banco
    await this.messagingRepository.updateInstanceStatus(instanceId, status);
    console.log(`✅ [ProcessMessagingWebhook] Status atualizado no banco: ${status}`);
  }
}
