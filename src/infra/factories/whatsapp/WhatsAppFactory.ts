// Factory - Inicialização e injeção de dependências da camada WhatsApp
import { PrismaClient } from '@prisma/client';
import { EvolutionAPIImpl } from '../../whatsapp/EvolutionAPIImpl';
import { WhatsAppRepositoryImpl } from '../../whatsapp/WhatsAppRepositoryImpl';
import { WebhookHandler } from '../../whatsapp/webhooks/WebhookHandler';
import { SendWhatsAppMessage } from '../../../usercase/whatsapp/SendWhatsAppMessage';
import { GetInstanceStatus } from '../../../usercase/whatsapp/GetInstanceStatus';
import { CreateInstance } from '../../../usercase/whatsapp/CreateInstance';
import { SendWhatsAppMessageController } from '../../../presentation/controllers/whatsapp/SendWhatsAppMessageController';
import { GetInstanceStatusController } from '../../../presentation/controllers/whatsapp/GetInstanceStatusController';
import { CreateInstanceController } from '../../../presentation/controllers/whatsapp/CreateInstanceController';
import { IEvolutionAPI } from '../../../ports/IEvolutionAPI';
import { IWhatsAppRepository } from '../../../ports/IWhatsAppRepository';

export class WhatsAppFactory {
  private static evolutionAPI: IEvolutionAPI;
  private static whatsappRepository: IWhatsAppRepository;
  
  // Use Cases
  private static sendWhatsAppMessage: SendWhatsAppMessage;
  private static getInstanceStatus: GetInstanceStatus;
  private static createInstance: CreateInstance;
  
  // Webhooks
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

  // ===== Use Cases =====

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
   * Obtém ou cria a instância de GetInstanceStatus
   */
  static getGetInstanceStatus(): GetInstanceStatus {
    if (!this.getInstanceStatus) {
      this.getInstanceStatus = new GetInstanceStatus(this.evolutionAPI);
    }
    return this.getInstanceStatus;
  }

  /**
   * Obtém ou cria a instância de CreateInstance
   */
  static getCreateInstance(): CreateInstance {
    if (!this.createInstance) {
      this.createInstance = new CreateInstance(this.evolutionAPI);
    }
    return this.createInstance;
  }

  // ===== Controllers =====

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
    return new GetInstanceStatusController(this.getGetInstanceStatus());
  }

  /**
   * Cria controller para criar instância
   */
  static getCreateInstanceController(): CreateInstanceController {
    return new CreateInstanceController(this.getCreateInstance());
  }

  // ===== Webhooks =====

  /**
   * Obtém ou cria a instância de WebhookHandler
   */
  static getWebhookHandler(): WebhookHandler {
    if (!this.webhookHandler) {
      this.webhookHandler = new WebhookHandler(this.whatsappRepository);
    }
    return this.webhookHandler;
  }

  // ===== Getters =====

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
