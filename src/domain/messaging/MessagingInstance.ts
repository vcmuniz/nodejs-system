import { MessagingChannel, ConnectionStatus } from './MessagingChannel';

// Dados genéricos de uma instância de messageria
export interface MessagingInstanceData {
  id: string;
  userId: string;
  name?: string; // Nome amigável para identificar a instância
  channel: MessagingChannel;
  channelInstanceId: string; // ID único no canal (ex: nome da instância no WhatsApp)
  channelPhoneOrId: string; // Telefone para WhatsApp, ID para Telegram, etc
  status: ConnectionStatus;
  credentials?: Record<string, any>; // Credenciais criptografadas ou tokens
  credentialId?: string; // ID da credencial de integração utilizada
  metadata?: Record<string, any>; // Dados específicos do canal
  createdAt: Date;
  updatedAt: Date;
  lastConnectedAt?: Date;
  lastDisconnectedAt?: Date;
}

// Mensagem genérica
export interface MessagingMessage {
  id: string;
  userId: string;
  instanceId: string; // FK para MessagingInstance
  channel: MessagingChannel;
  remoteJid: string; // Número/ID de quem recebe (pode ser WhatsApp, Telegram ID, email, etc)
  message: string;
  channelMessageId?: string; // ID gerado pelo canal (WhatsApp, Telegram, etc)
  direction: 'sent' | 'received';
  status: string; // 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  mediaUrl?: string;
  mediaType?: string; // 'image', 'audio', 'document', 'video'
  error?: string;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

// Evento genérico de webhook
export interface MessagingWebhookEvent {
  event: string; // 'message:upsert', 'connection:update', 'qr:updated', etc
  channel: MessagingChannel;
  instance: string;
  timestamp: Date;
  data: Record<string, any>;
}
