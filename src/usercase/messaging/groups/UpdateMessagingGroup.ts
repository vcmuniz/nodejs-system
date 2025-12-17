import { IMessagingGroupRepository } from '../../../domain/messaging/repositories/IMessagingGroupRepository';
import { MessagingGroupData } from '../../../domain/messaging/MessagingGroup';

interface UpdateMessagingGroupRequest {
  groupId: string;
  userId: string;
  name?: string;
  description?: string;
}

export class UpdateMessagingGroup {
  constructor(private groupRepository: IMessagingGroupRepository) {}

  async execute(request: UpdateMessagingGroupRequest): Promise<MessagingGroupData> {
    const group = await this.groupRepository.findById(request.groupId, request.userId);
    
    if (!group) {
      throw new Error('Grupo não encontrado');
    }

    if (group.isSynced) {
      throw new Error('Não é possível editar grupos sincronizados automaticamente');
    }

    return this.groupRepository.update(request.groupId, request.userId, {
      name: request.name,
      description: request.description,
    });
  }
}
