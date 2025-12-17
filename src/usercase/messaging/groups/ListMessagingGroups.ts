import { IMessagingGroupRepository } from '../../../domain/messaging/repositories/IMessagingGroupRepository';
import { MessagingGroupData } from '../../../domain/messaging/MessagingGroup';

interface ListMessagingGroupsRequest {
  userId: string;
  instanceId?: string;
}

export class ListMessagingGroups {
  constructor(private groupRepository: IMessagingGroupRepository) {}

  async execute(request: ListMessagingGroupsRequest): Promise<MessagingGroupData[]> {
    if (request.instanceId) {
      return this.groupRepository.findByInstanceId(request.instanceId, request.userId);
    }

    return [];
  }
}
