// Use Case - Lógica de negócio para enviar mensagem WhatsApp
import { IEvolutionAPI } from '../../ports/IEvolutionAPI';
import { IWhatsAppRepository } from '../../ports/IWhatsAppRepository';

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
  ) {}

  async execute(input: SendWhatsAppMessageInput): Promise<SendWhatsAppMessageOutput> {
    try {
      // Validar entrada
      this.validate(input);

      // Enviar mensagem pela Evolution API
      const response = await this.evolutionAPI.sendMessage(input.instanceName, {
        number: input.phoneNumber,
        text: input.message,
        mediaUrl: input.mediaUrl,
      });

      // Verificar se a mensagem foi enviada com sucesso
      if (!response.key?.id) {
        return {
          success: false,
          error: response.error || 'Erro ao enviar mensagem',
        };
      }

      // Registrar no banco de dados
      await this.whatsappRepository.logMessage({
        id: response.key.id,
        userId: input.userId,
        instanceId: input.instanceName,
        remoteJid: input.phoneNumber,
        message: input.message,
        messageId: response.key.id,
        direction: 'sent',
        status: 'sent',
        mediaUrl: input.mediaUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        messageId: response.key.id,
        status: response.status || 'sent',
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
