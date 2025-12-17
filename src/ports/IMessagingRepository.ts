// Port - Repository genérico para messageria
import { MessagingInstanceData, MessagingMessage } from '../domain/messaging/MessagingInstance';
import { MessagingChannel, ConnectionStatus, MessageStatus } from '../domain/messaging/MessagingChannel';

export interface IMessagingRepository {
  // ===== Instâncias =====
  saveInstance(data: MessagingInstanceData): Promise<MessagingInstanceData>;
  getInstanceByUserId(userId: string, channel?: MessagingChannel): Promise<MessagingInstanceData | null>;
  listInstancesByUserId(userId: string, channel?: MessagingChannel): Promise<MessagingInstanceData[]>;
  getInstanceById(instanceId: string): Promise<MessagingInstanceData | null>;
  getInstanceByChannelId(channelInstanceId: string, channel: MessagingChannel): Promise<MessagingInstanceData | null>;
  updateInstanceStatus(instanceId: string, status: ConnectionStatus): Promise<void>;
  updateInstanceMetadata(instanceId: string, metadata: Record<string, any>): Promise<void>;
  deleteInstance(instanceId: string): Promise<void>;

  // ===== Mensagens =====
  logMessage(data: MessagingMessage): Promise<MessagingMessage>;
  updateMessageStatus(messageId: string, status: MessageStatus): Promise<void>;
  updateMessageChannelId(messageId: string, channelMessageId: string): Promise<void>;
  getMessageLog(userId: string, channel?: MessagingChannel, limit?: number): Promise<MessagingMessage[]>;
  getMessageById(messageId: string): Promise<MessagingMessage | null>;
  updateMessageError(messageId: string, error: string, retries: number): Promise<void>;
}
