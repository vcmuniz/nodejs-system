// Use Case - Agendar envio de mensagem WhatsApp
import { PrismaClient } from '@prisma/client';

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
  constructor(private prisma: PrismaClient) {}

  async execute(input: ScheduleWhatsAppMessageInput): Promise<ScheduleWhatsAppMessageOutput> {
    try {
      this.validate(input);

      // Salvar no banco (persistente e seguro)
      const scheduled = await this.prisma.scheduledMessage.create({
        data: {
          userId: input.userId,
          instanceName: input.instanceName,
          phoneNumber: input.phoneNumber,
          message: input.message,
          scheduledFor: input.scheduledFor,
        },
      });

      return {
        success: true,
        scheduleId: scheduled.id,
        scheduledFor: scheduled.scheduledFor.toISOString(),
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
