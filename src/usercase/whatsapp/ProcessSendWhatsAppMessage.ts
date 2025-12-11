// Use Case - Processar envio de mensagem do Kafka
import { IEvolutionAPI } from '../../ports/IEvolutionAPI';
import { IWhatsAppRepository } from '../../ports/IWhatsAppRepository';

export interface ProcessSendWhatsAppMessageInput {
  userId: string;
  instanceName: string;
  phoneNumber: string;
  message: string;
  mediaUrl?: string;
}

export class ProcessSendWhatsAppMessage {
  constructor(
    private evolutionAPI: IEvolutionAPI,
    private whatsappRepository: IWhatsAppRepository,
  ) {}

  async execute(input: ProcessSendWhatsAppMessageInput): Promise<void> {
    try {
      console.log(`[Kafka Consumer] Processing message for ${input.phoneNumber}`);

      // Enviar mensagem pela Evolution API
      const response = await this.evolutionAPI.sendMessage(input.instanceName, {
        number: input.phoneNumber,
        text: input.message,
        mediaUrl: input.mediaUrl,
      });

      if (!response.key?.id) {
        throw new Error(response.error || 'Erro ao enviar mensagem');
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

      console.log(`[Kafka Consumer] Message sent successfully: ${response.key.id}`);
    } catch (error) {
      console.error('[Kafka Consumer] Error processing message:', error);
      throw error;
    }
  }
}
