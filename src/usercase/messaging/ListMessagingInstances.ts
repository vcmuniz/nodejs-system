// Use Case - Listar instâncias de messaging do usuário
import { IMessagingRepository } from '../../ports/IMessagingRepository';
import { MessagingChannel } from '../../domain/messaging/MessagingChannel';
import { MessagingInstanceData } from '../../domain/messaging/MessagingInstance';

export interface ListMessagingInstancesInput {
  userId: string;
  channel?: MessagingChannel;
}

export type MessagingInstanceSummary = Omit<MessagingInstanceData, 'credentials'>;

export class ListMessagingInstances {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(input: ListMessagingInstancesInput): Promise<MessagingInstanceSummary[]> {
    const instances = await this.messagingRepository.listInstancesByUserId(input.userId, input.channel);
    
    // Remove credentials da listagem (dados sensíveis)
    return instances.map(({ credentials, ...instance }) => instance);
  }
}
