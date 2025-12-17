// Use Case - Criar/Conectar instância de messageria
import { IMessagingRepository } from '../../ports/IMessagingRepository';
import { MessagingAdapterFactory } from '../../infra/messaging/MessagingAdapterFactory';
import { MessagingChannel, ConnectionStatus } from '../../domain/messaging/MessagingChannel';
import { MessagingInstanceData } from '../../domain/messaging/MessagingInstance';
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
    // 1. Verificar se a instância já existe no banco
    const existing = await this.messagingRepository.getInstanceByChannelId(
      input.channelInstanceId,
      input.channel
    );

    let instance: MessagingInstanceData | null = null;
    let isNewInstance = false;

    if (existing && existing.userId === input.userId) {
      console.log(`[CreateMessagingInstance] Instância já existe no banco: ${input.channelInstanceId}`);
      instance = existing;
    } else if (existing && existing.userId !== input.userId) {
      throw new Error('Instância já existe para outro usuário');
    } else {
      // Instância não existe no banco, será criada
      isNewInstance = true;
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

    // 3. Criar adapter com as credenciais corretas
    const adapter = this.adapterFactory.createAdapter(input.channel, credentials);

    // 4. Verificar se a instância existe na Evolution API
    let needsCreate = isNewInstance;
    
    if (!isNewInstance && instance) {
      // Verificar na Evolution API se a instância realmente existe
      try {
        console.log(`[CreateMessagingInstance] Verificando instância na Evolution API: ${input.channelInstanceId}`);
        await (adapter as any).evolutionAPI?.getInstance(input.channelInstanceId);
        console.log(`[CreateMessagingInstance] Instância encontrada na Evolution API`);
        needsCreate = false;
      } catch (error: any) {
        console.log(`[CreateMessagingInstance] Instância não encontrada na Evolution API, será criada`);
        needsCreate = true;
      }
    }

    // 5. Criar registro no banco se necessário
    if (isNewInstance) {
      instance = await this.messagingRepository.saveInstance({
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
    }

    // Garantir que instance não é null
    if (!instance) {
      throw new Error('Erro ao criar/obter instância');
    }

    // 6. Conectar através do adaptador
    const connectResult = await adapter.connect({
      channelInstanceId: input.channelInstanceId,
      credentials,
      needsCreate, // Informa se precisa criar ou apenas conectar
    });

    // 7. Atualizar status da instância
    await this.messagingRepository.updateInstanceStatus(instance.id, connectResult.status);

    if (connectResult.qrCode) {
      await this.messagingRepository.updateInstanceQrCode(instance.id, connectResult.qrCode);
    }

    return {
      instanceId: instance.id,
      status: connectResult.status,
      qrCode: connectResult.qrCode,
      message: connectResult.message || (isNewInstance ? 'Instância criada' : 'Instância já existente'),
    };
  }
}
