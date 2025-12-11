// Factory - Inicialização e injeção de dependências da camada WhatsApp
import { PrismaClient } from '@prisma/client';
import { EvolutionAPIImpl } from '../../whatsapp/EvolutionAPIImpl';
import { WhatsAppRepositoryImpl } from '../../whatsapp/WhatsAppRepositoryImpl';
import { WebhookHandler } from '../../whatsapp/webhooks/WebhookHandler';
import { SendWhatsAppMessage } from '../../../usercase/whatsapp/SendWhatsAppMessage';
import { SendWhatsAppMessageController } from '../../../presentation/controllers/whatsapp/SendWhatsAppMessageController';
import { GetInstanceStatusController } from '../../../presentation/controllers/whatsapp/GetInstanceStatusController';
import { CreateInstanceController } from '../../../presentation/controllers/whatsapp/CreateInstanceController';
import { IEvolutionAPI } from '../../../ports/IEvolutionAPI';
import { IWhatsAppRepository } from '../../../ports/IWhatsAppRepository';

export class WhatsAppFactory {
  private static evolutionAPI: IEvolutionAPI;
  private static whatsappRepository: IWhatsAppRepository;
  private static sendWhatsAppMessage: SendWhatsAppMessage;
  private static webhookHandler: WebhookHandler;

  /**
   * Inicializa as dependências da integração WhatsApp
   * @param prisma Cliente Prisma
   */
  static initialize(prisma: PrismaClient): void {
    const apiKey = process.env.EVOLUTION_API_KEY || '';
    const baseURL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';

    if (!apiKey) {
      console.warn('[WhatsAppFactory] EVOLUTION_API_KEY não configurada');
    }

    this.evolutionAPI = new EvolutionAPIImpl(apiKey, baseURL);
    this.whatsappRepository = new WhatsAppRepositoryImpl(prisma);
  }

  /**
   * Obtém ou cria a instância de SendWhatsAppMessage
   */
  static getSendWhatsAppMessage(): SendWhatsAppMessage {
    if (!this.sendWhatsAppMessage) {
      this.sendWhatsAppMessage = new SendWhatsAppMessage(
        this.evolutionAPI,
        this.whatsappRepository,
      );
    }
    return this.sendWhatsAppMessage;
  }

  /**
   * Cria controller para enviar mensagens
   */
  static getSendWhatsAppMessageController(): SendWhatsAppMessageController {
    return new SendWhatsAppMessageController(this.getSendWhatsAppMessage());
  }

  /**
   * Cria controller para obter status da instância
   */
  static getGetInstanceStatusController(): GetInstanceStatusController {
    return new GetInstanceStatusController(this.evolutionAPI);
  }

  /**
   * Cria controller para criar instância
   */
  static getCreateInstanceController(): CreateInstanceController {
    return new CreateInstanceController(this.evolutionAPI);
  }

  /**
   * Obtém ou cria a instância de WebhookHandler
   */
  static getWebhookHandler(): WebhookHandler {
    if (!this.webhookHandler) {
      this.webhookHandler = new WebhookHandler(this.whatsappRepository);
    }
    return this.webhookHandler;
  }

  /**
   * Obtém a instância de EvolutionAPI
   */
  static getEvolutionAPI(): IEvolutionAPI {
    return this.evolutionAPI;
  }

  /**
   * Obtém a instância de WhatsAppRepository
   */
  static getWhatsAppRepository(): IWhatsAppRepository {
    return this.whatsappRepository;
  }
}
