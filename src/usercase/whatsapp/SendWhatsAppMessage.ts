// Use Case - Lógica de negócio para enviar mensagem WhatsApp
import { IEvolutionAPI } from '../../ports/IEvolutionAPI';
import { IWhatsAppRepository } from '../../ports/IWhatsAppRepository';
import { IMessageQueue } from '../../ports/IMessageQueue';

export interface SendWhatsAppMessageInput {
  userId: string;
  instanceName: string;
  phoneNumber: string;
  message: string;
  mediaUrl?: string;
}

export interface SendWhatsAppMessageOutput {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
}

export class SendWhatsAppMessage {
  constructor(
    private evolutionAPI: IEvolutionAPI,
    private whatsappRepository: IWhatsAppRepository,
    private messageQueue: IMessageQueue,
  ) {}

  async execute(input: SendWhatsAppMessageInput): Promise<SendWhatsAppMessageOutput> {
    try {
      // Validar entrada
      this.validate(input);

      // Publicar no Kafka para processamento assíncrono
      await this.messageQueue.publish({
        topic: 'whatsapp-send-message',
        key: input.userId,
        value: {
          userId: input.userId,
          instanceName: input.instanceName,
          phoneNumber: input.phoneNumber,
          message: input.message,
          mediaUrl: input.mediaUrl,
          timestamp: new Date().toISOString(),
        },
      });

      return {
        success: true,
        status: 'queued',
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  private validate(input: SendWhatsAppMessageInput): void {
    if (!input.userId || !input.instanceName || !input.phoneNumber || !input.message) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    if (input.message.length > 4096) {
      throw new Error('Mensagem deve ter no máximo 4096 caracteres');
    }

    if (!this.isValidPhoneNumber(input.phoneNumber)) {
      throw new Error('Número de telefone inválido (formato: 5511999999999)');
    }
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Aceita formato: 5511999999999 ou com formatação removida
    const cleanPhone = phone.replace(/\D/g, '');
    return /^55\d{10,11}$/.test(cleanPhone);
  }
}
