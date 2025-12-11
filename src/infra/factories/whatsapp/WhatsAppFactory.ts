// Factory - Inicialização e injeção de dependências da camada WhatsApp
import { PrismaClient } from '@prisma/client';
import { EvolutionAPIImpl } from '../../whatsapp/EvolutionAPIImpl';
import { WhatsAppRepositoryImpl } from '../../whatsapp/WhatsAppRepositoryImpl';
import { WebhookHandler } from '../../whatsapp/webhooks/WebhookHandler';
import { WhatsAppScheduler } from '../../whatsapp/scheduler/WhatsAppScheduler';
import { KafkaAdapter } from '../../kafka/KafkaAdapter';
import { SendWhatsAppMessage } from '../../../usercase/whatsapp/SendWhatsAppMessage';
import { ProcessSendWhatsAppMessage } from '../../../usercase/whatsapp/ProcessSendWhatsAppMessage';
import { ScheduleWhatsAppMessage } from '../../../usercase/whatsapp/ScheduleWhatsAppMessage';
import { GetInstanceStatus } from '../../../usercase/whatsapp/GetInstanceStatus';
import { CreateInstance } from '../../../usercase/whatsapp/CreateInstance';
import { SendWhatsAppMessageController } from '../../../presentation/controllers/whatsapp/SendWhatsAppMessageController';
import { ScheduleWhatsAppMessageController } from '../../../presentation/controllers/whatsapp/ScheduleWhatsAppMessageController';
import { GetInstanceStatusController } from '../../../presentation/controllers/whatsapp/GetInstanceStatusController';
import { CreateInstanceController } from '../../../presentation/controllers/whatsapp/CreateInstanceController';
import { IEvolutionAPI } from '../../../ports/IEvolutionAPI';
import { IWhatsAppRepository } from '../../../ports/IWhatsAppRepository';
import { IMessageQueue } from '../../../ports/IMessageQueue';

export class WhatsAppFactory {
  private static evolutionAPI: IEvolutionAPI;
  private static whatsappRepository: IWhatsAppRepository;
  private static messageQueue: IMessageQueue;
  private static scheduler: WhatsAppScheduler;

  // Use Cases
  private static sendWhatsAppMessage: SendWhatsAppMessage;
  private static processSendWhatsAppMessage: ProcessSendWhatsAppMessage;
  private static scheduleWhatsAppMessage: ScheduleWhatsAppMessage;
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
    const kafkaBrokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

    if (!apiKey) {
      console.warn('[WhatsAppFactory] EVOLUTION_API_KEY não configurada');
    }

    this.evolutionAPI = new EvolutionAPIImpl(apiKey, baseURL);
    this.whatsappRepository = new WhatsAppRepositoryImpl(prisma);
    this.messageQueue = new KafkaAdapter(kafkaBrokers);
    this.scheduler = new WhatsAppScheduler(prisma, this.evolutionAPI);
  }

  /**
   * Inicia o scheduler de agendamentos
   */
  static startScheduler(): void {
    if (this.scheduler) {
      this.scheduler.start();
    }
  }

  /**
   * Para o scheduler
   */
  static stopScheduler(): void {
    if (this.scheduler) {
      this.scheduler.stop();
    }
  }

  /**
   * Conecta ao Kafka
   */
  static async connectKafka(): Promise<void> {
    if (this.messageQueue instanceof KafkaAdapter) {
      await this.messageQueue.connect();
      console.log('[WhatsAppFactory] Kafka connected');
    }
  }

  // ===== Use Cases =====

  static getSendWhatsAppMessage(): SendWhatsAppMessage {
    if (!this.sendWhatsAppMessage) {
      this.sendWhatsAppMessage = new SendWhatsAppMessage(
        this.evolutionAPI,
        this.whatsappRepository,
        this.messageQueue,
      );
    }
    return this.sendWhatsAppMessage;
  }

  static getProcessSendWhatsAppMessage(): ProcessSendWhatsAppMessage {
    if (!this.processSendWhatsAppMessage) {
      this.processSendWhatsAppMessage = new ProcessSendWhatsAppMessage(
        this.evolutionAPI,
        this.whatsappRepository,
      );
    }
    return this.processSendWhatsAppMessage;
  }

  static getScheduleWhatsAppMessage(): ScheduleWhatsAppMessage {
    if (!this.scheduleWhatsAppMessage) {
      this.scheduleWhatsAppMessage = new ScheduleWhatsAppMessage(
        // prisma aqui
      );
    }
    return this.scheduleWhatsAppMessage;
  }

  static getGetInstanceStatus(): GetInstanceStatus {
    if (!this.getInstanceStatus) {
      this.getInstanceStatus = new GetInstanceStatus(this.evolutionAPI);
    }
    return this.getInstanceStatus;
  }

  static getCreateInstance(): CreateInstance {
    if (!this.createInstance) {
      this.createInstance = new CreateInstance(this.evolutionAPI, this.whatsappRepository);
    }
    return this.createInstance;
  }

  // ===== Controllers =====

  static getSendWhatsAppMessageController(): SendWhatsAppMessageController {
    return new SendWhatsAppMessageController(this.getSendWhatsAppMessage());
  }

  static getScheduleWhatsAppMessageController(): ScheduleWhatsAppMessageController {
    return new ScheduleWhatsAppMessageController(this.getScheduleWhatsAppMessage());
  }

  static getGetInstanceStatusController(): GetInstanceStatusController {
    return new GetInstanceStatusController(this.getGetInstanceStatus());
  }

  static getCreateInstanceController(): CreateInstanceController {
    return new CreateInstanceController(this.getCreateInstance());
  }

  // ===== Webhooks =====

  static getWebhookHandler(): WebhookHandler {
    if (!this.webhookHandler) {
      this.webhookHandler = new WebhookHandler(this.whatsappRepository, this.messageQueue);
    }
    return this.webhookHandler;
  }

  // ===== Getters =====

  static getEvolutionAPI(): IEvolutionAPI {
    return this.evolutionAPI;
  }

  static getWhatsAppRepository(): IWhatsAppRepository {
    return this.whatsappRepository;
  }

  static getMessageQueue(): IMessageQueue {
    return this.messageQueue;
  }

  static getScheduler(): WhatsAppScheduler {
    return this.scheduler;
  }
}
