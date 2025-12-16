// Use Case - Criar/Conectar instância de messageria
import { IMessagingRepository } from '../../ports/IMessagingRepository';
import { MessagingAdapterFactory } from '../../infra/messaging/MessagingAdapterFactory';
import { MessagingChannel, ConnectionStatus } from '../../domain/messaging/MessagingChannel';
import { randomUUID } from 'crypto';

export interface CreateMessagingInstanceInput {
  userId: string;
  channel: MessagingChannel;
  channelInstanceId: string; // Nome único no canal (ex: nome da instância)
  channelPhoneOrId: string; // Telefone ou ID no canal
  credentials?: Record<string, any>;
}

export interface CreateMessagingInstanceOutput {
  instanceId: string;
  status: ConnectionStatus;
  qrCode?: string;
  message?: string;
}

export class CreateMessagingInstance {
  constructor(
    private messagingRepository: IMessagingRepository,
    private adapterFactory: MessagingAdapterFactory
  ) {}

  async execute(input: CreateMessagingInstanceInput): Promise<CreateMessagingInstanceOutput> {
    // 1. Verificar se a instância já existe
    const existing = await this.messagingRepository.getInstanceByChannelId(
      input.channelInstanceId,
      input.channel
    );

    if (existing && existing.userId === input.userId) {
      throw new Error('Instância já existe para este usuário');
    }

    // 2. Criar registro no banco
    const instance = await this.messagingRepository.saveInstance({
      id: randomUUID(),
      userId: input.userId,
      channel: input.channel,
      channelInstanceId: input.channelInstanceId,
      channelPhoneOrId: input.channelPhoneOrId,
      status: ConnectionStatus.PENDING,
      credentials: input.credentials,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Conectar através do adaptador
    const adapter = this.adapterFactory.createAdapter(input.channel);
    const connectResult = await adapter.connect({
      channelInstanceId: input.channelInstanceId,
      credentials: input.credentials,
    });

    // 4. Atualizar status da instância
    await this.messagingRepository.updateInstanceStatus(instance.id, connectResult.status);

    if (connectResult.qrCode) {
      await this.messagingRepository.updateInstanceQrCode(instance.id, connectResult.qrCode);
    }

    return {
      instanceId: instance.id,
      status: connectResult.status,
      qrCode: connectResult.qrCode,
      message: connectResult.message,
    };
  }
}
