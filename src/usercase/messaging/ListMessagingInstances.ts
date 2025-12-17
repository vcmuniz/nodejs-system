// Use Case - Listar instâncias de messaging do usuário
import { IMessagingRepository } from '../../ports/IMessagingRepository';
import { MessagingChannel } from '../../domain/messaging/MessagingChannel';
import { MessagingInstanceData } from '../../domain/messaging/MessagingInstance';

export interface ListMessagingInstancesInput {
  userId: string;
  channel?: MessagingChannel;
}

export type MessagingInstanceSummary = Omit<MessagingInstanceData, 'qrCode' | 'credentials'>;

export class ListMessagingInstances {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(input: ListMessagingInstancesInput): Promise<MessagingInstanceSummary[]> {
    const instances = await this.messagingRepository.listInstancesByUserId(input.userId, input.channel);
    
    // Remove QR Code e credentials da listagem (dados sensíveis/grandes)
    return instances.map(({ qrCode, credentials, ...instance }) => instance);
  }
}
