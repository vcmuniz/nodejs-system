// Use Case - Criar/Conectar instância de messageria
import { IMessagingRepository } from '../../ports/IMessagingRepository';
import { MessagingAdapterFactory } from '../../infra/messaging/MessagingAdapterFactory';
import { MessagingChannel, ConnectionStatus } from '../../domain/messaging/MessagingChannel';
import { randomUUID } from 'crypto';
import { makeIntegrationCredentialRepository } from '../../infra/database/factories/makeIntegrationCredentialRepository';
import { GetActiveCredentialByType } from '../integration-credentials/GetActiveCredentialByType';

export interface CreateMessagingInstanceInput {
  userId: string;
  channel: MessagingChannel;
  channelInstanceId: string; // Nome único no canal (ex: nome da instância)
  channelPhoneOrId: string; // Telefone ou ID no canal
  credentials?: Record<string, any>; // Opcional: passar credenciais manualmente
  credentialId?: string; // Opcional: forçar credencial específica
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

    // 2. Buscar credenciais automaticamente se não forem passadas
    let credentials = input.credentials;
    let usedCredentialId: string | undefined;

    if (!credentials || Object.keys(credentials).length === 0) {
      const credentialRepo = makeIntegrationCredentialRepository();
      const getCredentials = new GetActiveCredentialByType(credentialRepo);
      
      try {
        const credential = await getCredentials.execute(input.channel);
        credentials = credential.credentials;
        usedCredentialId = credential.id;
      } catch (error: any) {
        throw new Error(
          `Nenhuma credencial ativa encontrada para o canal "${input.channel}". ` +
          `Por favor, contate o administrador para configurar as credenciais de integração.`
        );
      }
    }

    // 3. Criar registro no banco
    const instance = await this.messagingRepository.saveInstance({
      id: randomUUID(),
      userId: input.userId,
      channel: input.channel,
      channelInstanceId: input.channelInstanceId,
      channelPhoneOrId: input.channelPhoneOrId,
      status: ConnectionStatus.PENDING,
      credentials,
      credentialId: usedCredentialId,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Conectar através do adaptador (passando credentials para criar Evolution API com credenciais corretas)
    const adapter = this.adapterFactory.createAdapter(input.channel, credentials);
    const connectResult = await adapter.connect({
      channelInstanceId: input.channelInstanceId,
      credentials,
    });

    // 5. Atualizar status da instância
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
