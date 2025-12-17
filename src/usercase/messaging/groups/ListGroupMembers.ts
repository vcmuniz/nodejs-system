import { IMessagingGroupRepository } from '../../../domain/messaging/repositories/IMessagingGroupRepository';
import { MessagingGroupMemberData } from '../../../domain/messaging/MessagingGroup';

interface ListGroupMembersRequest {
  groupId: string;
  userId: string;
}

export class ListGroupMembers {
  constructor(private groupRepository: IMessagingGroupRepository) {}

  async execute(request: ListGroupMembersRequest): Promise<MessagingGroupMemberData[]> {
    const group = await this.groupRepository.findById(request.groupId, request.userId);
    
    if (!group) {
      throw new Error('Grupo não encontrado');
    }

    return this.groupRepository.listMembers(request.groupId, request.userId);
  }
}
