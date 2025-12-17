import { IMessagingGroupRepository } from '../../../domain/messaging/repositories/IMessagingGroupRepository';

interface DeleteMessagingGroupRequest {
  groupId: string;
  userId: string;
}

export class DeleteMessagingGroup {
  constructor(private groupRepository: IMessagingGroupRepository) {}

  async execute(request: DeleteMessagingGroupRequest): Promise<void> {
    const group = await this.groupRepository.findById(request.groupId, request.userId);
    
    if (!group) {
      throw new Error('Grupo não encontrado');
    }

    if (group.isSynced) {
      throw new Error('Não é possível deletar grupos sincronizados automaticamente');
    }

    await this.groupRepository.delete(request.groupId, request.userId);
  }
}
