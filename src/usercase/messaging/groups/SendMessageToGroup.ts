import { IMessagingGroupRepository } from '../../../domain/messaging/repositories/IMessagingGroupRepository';
import { IMessagingRepository } from '../../../ports/IMessagingRepository';
import { SendMessage } from '../SendMessage';
import { MessagingAdapterFactory } from '../../../infra/messaging/MessagingAdapterFactory';
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

    console.log('[SendMessageToGroup] Grupo:', group.name);
    console.log('[SendMessageToGroup] Total de membros:', members.length);
    console.log('[SendMessageToGroup] Tipo de grupo:', group.type);
    console.log('[SendMessageToGroup] ExternalGroupId:', group.externalGroupId);

    const result: SendResult = {
      total: members.length,
      sent: 0,
      failed: 0,
      errors: [],
    };

    // Se for grupo sincronizado do WhatsApp, envia para o grupo
    if (group.isSynced && group.externalGroupId) {
      console.log('[SendMessageToGroup] Enviando para grupo do WhatsApp:', group.externalGroupId);
      
      try {
        const adapterFactory = new MessagingAdapterFactory();
        const sendMessage = new SendMessage(this.messagingRepository, adapterFactory);
        
        await sendMessage.execute({
          userId: request.userId,
          channel: instance.channel,
          channelInstanceId: instance.channelInstanceId,
          remoteJid: group.externalGroupId, // Envia para o grupo
          message: request.message,
          mediaUrl: request.mediaUrl,
          mediaType: request.mediaType,
        });
        
        result.sent = members.length; // Considera que todos receberam
        console.log('[SendMessageToGroup] Mensagem enviada para o grupo com sucesso!');
      } catch (error: any) {
        console.error('[SendMessageToGroup] Erro ao enviar para grupo:', error.message);
        result.failed = members.length;
        result.errors.push({
          identifier: group.externalGroupId,
          error: error.message,
        });
      }
    } else {
      // Grupo customizado - envia para cada membro individualmente
      console.log('[SendMessageToGroup] Enviando individualmente para cada membro...');
      
      const adapterFactory = new MessagingAdapterFactory();
      const sendMessage = new SendMessage(this.messagingRepository, adapterFactory);

      for (const member of members) {
        try {
          console.log('[SendMessageToGroup] Enviando para:', member.identifier);
          
          await sendMessage.execute({
            userId: request.userId,
            channel: instance.channel,
            channelInstanceId: instance.channelInstanceId,
            remoteJid: member.identifier,
            message: request.message,
            mediaUrl: request.mediaUrl,
            mediaType: request.mediaType,
          });
          
          result.sent++;
        } catch (error: any) {
          console.error('[SendMessageToGroup] Erro ao enviar para', member.identifier, ':', error.message);
          result.failed++;
          result.errors.push({
            identifier: member.identifier,
            error: error.message,
          });
        }
      }
    }

    return result;
  }
}
