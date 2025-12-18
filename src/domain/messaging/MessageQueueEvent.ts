import { MessagingChannel } from './MessagingChannel';

export interface MessageQueueEvent {
  messageId: string;
  userId: string;
  channel: MessagingChannel;
  channelInstanceId: string;
  instanceId: string;
  remoteJid: string;
  message: string;
  mediaUrl?: string;
  mediaType?: string;
  credentials: Record<string, any>;
  retryCount: number;
}
