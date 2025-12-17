import { v4 as uuidv4 } from 'uuid';
import { IMessagingGroupRepository } from '../../../domain/messaging/repositories/IMessagingGroupRepository';
import { MessagingGroupMemberData } from '../../../domain/messaging/MessagingGroup';

interface AddGroupMemberRequest {
  groupId: string;
  userId: string;
  identifier: string;
  identifierType: string;
  name?: string;
  metadata?: Record<string, any>;
}

export class AddGroupMember {
  constructor(private groupRepository: IMessagingGroupRepository) {}

  async execute(request: AddGroupMemberRequest): Promise<MessagingGroupMemberData> {
    const group = await this.groupRepository.findById(request.groupId, request.userId);
    
    if (!group) {
      throw new Error('Grupo não encontrado');
    }

    if (group.isSynced) {
      throw new Error('Não é possível adicionar membros manualmente em grupos sincronizados');
    }

    const existingMember = await this.groupRepository.findMemberByIdentifier(
      request.groupId,
      request.identifier
    );

    if (existingMember) {
      throw new Error('Membro já existe no grupo');
    }

    return this.groupRepository.addMember({
      id: uuidv4(),
      groupId: request.groupId,
      identifier: request.identifier,
      identifierType: request.identifierType,
      name: request.name,
      metadata: request.metadata,
    });
  }
}
