import { v4 as uuidv4 } from 'uuid';
import { IMessagingGroupRepository } from '../../../domain/messaging/repositories/IMessagingGroupRepository';
import { MessagingGroupData } from '../../../domain/messaging/MessagingGroup';

interface CreateMessagingGroupRequest {
  userId: string;
  businessProfileId?: string;
  instanceId: string;
  name: string;
  description?: string;
}

export class CreateMessagingGroup {
  constructor(private groupRepository: IMessagingGroupRepository) {}

  async execute(request: CreateMessagingGroupRequest): Promise<MessagingGroupData> {
    const group = await this.groupRepository.create({
      id: uuidv4(),
      userId: request.userId,
      businessProfileId: request.businessProfileId,
      instanceId: request.instanceId,
      name: request.name,
      description: request.description,
      type: 'CUSTOM',
      isSynced: false,
    });

    return group;
  }
}
