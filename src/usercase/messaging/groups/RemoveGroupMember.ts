import { IMessagingGroupRepository } from '../../../domain/messaging/repositories/IMessagingGroupRepository';

interface RemoveGroupMemberRequest {
  groupId: string;
  userId: string;
  identifier: string;
}

export class RemoveGroupMember {
  constructor(private groupRepository: IMessagingGroupRepository) {}

  async execute(request: RemoveGroupMemberRequest): Promise<void> {
    const group = await this.groupRepository.findById(request.groupId, request.userId);
    
    if (!group) {
      throw new Error('Grupo não encontrado');
    }

    if (group.isSynced) {
      throw new Error('Não é possível remover membros manualmente de grupos sincronizados');
    }

    await this.groupRepository.removeMember(request.groupId, request.identifier, request.userId);
  }
}
