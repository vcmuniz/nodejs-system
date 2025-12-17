import { IMessagingGroupRepository } from '../../../domain/messaging/repositories/IMessagingGroupRepository';
import { IMessagingRepository } from '../../../ports/IMessagingRepository';
import { v4 as uuidv4 } from 'uuid';

interface SendMessageToGroupRequest {
  groupId: string;
  userId: string;
  message: string;
  mediaUrl?: string;
  mediaType?: string;
}

interface SendResult {
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ identifier: string; error: string }>;
}

export class SendMessageToGroup {
  constructor(
    private groupRepository: IMessagingGroupRepository,
    private messagingRepository: IMessagingRepository
  ) {}

  async execute(request: SendMessageToGroupRequest): Promise<SendResult> {
    const group = await this.groupRepository.findById(request.groupId, request.userId);
    
    if (!group) {
      throw new Error('Grupo não encontrado');
    }

    const members = await this.groupRepository.listMembers(request.groupId, request.userId);
    
    const instance = await this.messagingRepository.getInstanceById(group.instanceId);
    if (!instance) {
      throw new Error('Instância não encontrada');
    }

    const result: SendResult = {
      total: members.length,
      sent: 0,
      failed: 0,
      errors: [],
    };

    for (const member of members) {
      try {
        await this.messagingRepository.logMessage({
          id: uuidv4(),
          userId: request.userId,
          instanceId: group.instanceId,
          channel: instance.channel,
          remoteJid: member.identifier,
          message: request.message,
          direction: 'sent',
          status: 'pending',
          mediaUrl: request.mediaUrl,
          mediaType: request.mediaType,
          retries: 0,
          maxRetries: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        result.sent++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          identifier: member.identifier,
          error: error.message,
        });
      }
    }

    return result;
  }
}
