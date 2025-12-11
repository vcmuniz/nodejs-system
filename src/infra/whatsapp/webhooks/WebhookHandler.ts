// Adapter - Handler para processar webhooks da Evolution API
import { IWhatsAppRepository } from '../../../ports/IWhatsAppRepository';
import { WebhookEventData } from '../../../ports/IEvolutionAPI';

export class WebhookHandler {
  constructor(private whatsappRepository: IWhatsAppRepository) {}

  async handleMessageStatusUpdate(data: WebhookEventData): Promise<void> {
    try {
      const { instance, data: payload } = data;

      if (payload.status && payload.id) {
        await this.whatsappRepository.updateMessageStatus(
          payload.id,
          this.mapStatus(payload.status),
        );
      }
    } catch (error) {
      console.error('Erro ao processar webhook de status:', error);
    }
  }

  async handleInstanceConnectionChange(data: WebhookEventData): Promise<void> {
    try {
      const { instance, data: payload } = data;

      if (payload.status) {
        await this.whatsappRepository.updateInstanceStatus(
          instance,
          this.mapInstanceStatus(payload.status),
        );
      }
    } catch (error) {
      console.error('Erro ao processar webhook de conexão:', error);
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
      'PENDING': 'pending',
      'ERROR': 'error',
    };
    return statusMap[status] || 'error';
  }
}
