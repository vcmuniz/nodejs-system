// Use Case - Agendar envio de mensagem WhatsApp
import { IWhatsAppRepository } from '../../ports/IWhatsAppRepository';
import { IMessageQueue } from '../../ports/IMessageQueue';

export interface ScheduleWhatsAppMessageInput {
  userId: string;
  instanceName: string;
  phoneNumber: string;
  message: string;
  scheduledFor: Date;
  mediaUrl?: string;
}

export interface ScheduleWhatsAppMessageOutput {
  success: boolean;
  scheduleId?: string;
  scheduledFor?: string;
  error?: string;
}

export class ScheduleWhatsAppMessage {
  constructor(
    private whatsappRepository: IWhatsAppRepository,
    private messageQueue: IMessageQueue,
  ) {}

  async execute(input: ScheduleWhatsAppMessageInput): Promise<ScheduleWhatsAppMessageOutput> {
    try {
      // Validar entrada
      this.validate(input);

      const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Publicar no Kafka para agendamento
      await this.messageQueue.publish({
        topic: 'whatsapp-schedule-message',
        key: input.userId,
        value: {
          scheduleId,
          userId: input.userId,
          instanceName: input.instanceName,
          phoneNumber: input.phoneNumber,
          message: input.message,
          mediaUrl: input.mediaUrl,
          scheduledFor: input.scheduledFor.toISOString(),
          createdAt: new Date().toISOString(),
        },
      });

      return {
        success: true,
        scheduleId,
        scheduledFor: input.scheduledFor.toISOString(),
      };
    } catch (error) {
      console.error('Erro ao agendar mensagem WhatsApp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  private validate(input: ScheduleWhatsAppMessageInput): void {
    if (!input.userId || !input.instanceName || !input.phoneNumber || !input.message) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    if (input.message.length > 4096) {
      throw new Error('Mensagem deve ter no máximo 4096 caracteres');
    }

    if (!this.isValidPhoneNumber(input.phoneNumber)) {
      throw new Error('Número de telefone inválido (formato: 5511999999999)');
    }

    const now = new Date();
    if (input.scheduledFor <= now) {
      throw new Error('Data de agendamento deve ser no futuro');
    }

    const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 dias
    if (input.scheduledFor > maxDate) {
      throw new Error('Agendamento máximo é de 90 dias no futuro');
    }
  }

  private isValidPhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^55\d{10,11}$/.test(cleanPhone);
  }
}
