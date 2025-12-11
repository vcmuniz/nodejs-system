// Adapter - Handler para processar webhooks da Evolution API
import { IWhatsAppRepository } from '../../../ports/IWhatsAppRepository';
import { IMessageQueue } from '../../../ports/IMessageQueue';
import { WebhookEventData } from '../../../ports/IEvolutionAPI';

export class WebhookHandler {
  constructor(
    private whatsappRepository: IWhatsAppRepository,
    private messageQueue: IMessageQueue,
  ) {}

  async handleMessageStatusUpdate(data: WebhookEventData): Promise<void> {
    try {
      console.log('[WebhookHandler] Processing message status update:', data);

      const { instance, data: payload } = data;

      if (payload.status && payload.id) {
        // Publicar no Kafka para processamento assíncrono
        await this.messageQueue.publish({
          topic: 'whatsapp-message-status',
          key: payload.id,
          value: {
            messageId: payload.id,
            instanceName: instance,
            status: payload.status,
            timestamp: new Date().toISOString(),
          },
        });

        // Atualizar status no banco
        await this.whatsappRepository.updateMessageStatus(
          payload.id,
          this.mapStatus(payload.status),
        );
      }
    } catch (error) {
      console.error('[WebhookHandler] Erro ao processar webhook de status:', error);
    }
  }

  async handleInstanceConnectionChange(data: WebhookEventData): Promise<void> {
    try {
      console.log('[WebhookHandler] Processing instance connection change:', data);

      const { instance, data: payload } = data;

      if (payload.status) {
        // Publicar no Kafka para processamento assíncrono
        await this.messageQueue.publish({
          topic: 'whatsapp-instance-status',
          key: instance,
          value: {
            instanceName: instance,
            status: payload.status,
            timestamp: new Date().toISOString(),
          },
        });

        // Atualizar status no banco
        await this.whatsappRepository.updateInstanceStatus(
          instance,
          this.mapInstanceStatus(payload.status),
        );
      }
    } catch (error) {
      console.error('[WebhookHandler] Erro ao processar webhook de conexão:', error);
    }
  }

  private mapStatus(status: string): 'pending' | 'sent' | 'delivered' | 'read' | 'failed' {
    const statusMap: Record<string, 'pending' | 'sent' | 'delivered' | 'read' | 'failed'> = {
      'PENDING': 'pending',
      'SENT': 'sent',
      'DELIVERED': 'delivered',
      'READ': 'read',
      'FAILED': 'failed',
    };
    return statusMap[status] || 'pending';
  }

  private mapInstanceStatus(status: string): 'connected' | 'disconnected' | 'pending' | 'error' {
    const statusMap: Record<string, 'connected' | 'disconnected' | 'pending' | 'error'> = {
      'CONNECTED': 'connected',
      'DISCONNECTED': 'disconnected',
      'CONNECTING': 'pending',
      'PAIRING': 'pending',
    };
    return statusMap[status] || 'error';
  }
}
