// Use Case - Obter QR Code Fresco de uma Instância
import { IMessagingRepository } from '../../ports/IMessagingRepository';
import { MessagingAdapterFactory } from '../../infra/messaging/MessagingAdapterFactory';
import { MessagingChannel } from '../../domain/messaging/MessagingChannel';

export interface GetInstanceQRCodeInput {
  userId: string;
  instanceId: string;
}

export interface GetInstanceQRCodeOutput {
  qrCode?: string;
  status: string;
  message: string;
}

export class GetInstanceQRCode {
  constructor(
    private messagingRepository: IMessagingRepository,
    private adapterFactory: MessagingAdapterFactory
  ) {}

  async execute(input: GetInstanceQRCodeInput): Promise<GetInstanceQRCodeOutput> {
    // 1. Buscar instância no banco
    const instance = await this.messagingRepository.getInstanceById(input.instanceId);

    if (!instance) {
      throw new Error('Instância não encontrada');
    }

    if (instance.userId !== input.userId) {
      throw new Error('Você não tem permissão para acessar esta instância');
    }

    // 2. Criar adapter
    const adapter = this.adapterFactory.createAdapter(instance.channel, instance.credentials);

    // 3. Obter status fresco da instância (inclui QR Code atualizado)
    const status = await adapter.getStatus({
      channelInstanceId: instance.channelInstanceId,
    });

    return {
      qrCode: status.qrCode,
      status: status.status,
      message: status.qrCode 
        ? 'QR Code gerado com sucesso. Escaneie em até 60 segundos.'
        : status.isReady 
          ? 'Instância já está conectada'
          : 'QR Code não disponível no momento',
    };
  }
}
