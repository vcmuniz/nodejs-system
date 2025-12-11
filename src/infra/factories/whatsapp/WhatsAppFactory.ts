// Factory - Inicialização e injeção de dependências da camada WhatsApp
import { PrismaClient } from '@prisma/client';
import { EvolutionAPIImpl } from '../../whatsapp/EvolutionAPIImpl';
import { WhatsAppRepositoryImpl } from '../../whatsapp/WhatsAppRepositoryImpl';
import { WebhookHandler } from '../../whatsapp/webhooks/WebhookHandler';
import { SendWhatsAppMessage } from '../../../usercase/whatsapp/SendWhatsAppMessage';
import { SendWhatsAppMessageController } from '../../../presentation/controllers/whatsapp/SendWhatsAppMessageController';
import { IEvolutionAPI } from '../../../ports/IEvolutionAPI';
import { IWhatsAppRepository } from '../../../ports/IWhatsAppRepository';

export class WhatsAppFactory {
  private static evolutionAPI: IEvolutionAPI;
  private static whatsappRepository: IWhatsAppRepository;
  private static sendWhatsAppMessage: SendWhatsAppMessage;
  private static webhookHandler: WebhookHandler;

  static initialize(prisma: PrismaClient): void {
    const apiKey = process.env.EVOLUTION_API_KEY || '';
    const baseURL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';

    this.evolutionAPI = new EvolutionAPIImpl(apiKey, baseURL);
    this.whatsappRepository = new WhatsAppRepositoryImpl(prisma);
  }

  static getSendWhatsAppMessage(): SendWhatsAppMessage {
    if (!this.sendWhatsAppMessage) {
      this.sendWhatsAppMessage = new SendWhatsAppMessage(
        this.evolutionAPI,
        this.whatsappRepository,
      );
    }
    return this.sendWhatsAppMessage;
  }

  static getSendWhatsAppMessageController(): SendWhatsAppMessageController {
    return new SendWhatsAppMessageController(this.getSendWhatsAppMessage());
  }

  static getWebhookHandler(): WebhookHandler {
    if (!this.webhookHandler) {
      this.webhookHandler = new WebhookHandler(this.whatsappRepository);
    }
    return this.webhookHandler;
  }

  static getEvolutionAPI(): IEvolutionAPI {
    return this.evolutionAPI;
  }

  static getWhatsAppRepository(): IWhatsAppRepository {
    return this.whatsappRepository;
  }
}
