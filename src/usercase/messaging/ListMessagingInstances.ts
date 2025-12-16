// Use Case - Listar instâncias de messaging do usuário
import { IMessagingRepository } from '../../ports/IMessagingRepository';
import { MessagingChannel } from '../../domain/messaging/MessagingChannel';
import { MessagingInstanceData } from '../../domain/messaging/MessagingInstance';

export interface ListMessagingInstancesInput {
  userId: string;
  channel?: MessagingChannel;
}

export class ListMessagingInstances {
  constructor(private messagingRepository: IMessagingRepository) {}

  async execute(input: ListMessagingInstancesInput): Promise<MessagingInstanceData[]> {
    return await this.messagingRepository.listInstancesByUserId(input.userId, input.channel);
  }
}
