// Enum para tipos de canais de mensageria suportados
export enum MessagingChannel {
  WHATSAPP_EVOLUTION = 'whatsapp_evolution',
  WHATSAPP_OFICIAL = 'whatsapp_oficial',
  SMS = 'sms',
  EMAIL = 'email',
  TELEGRAM = 'telegram',
  FACEBOOK = 'facebook'
}

// Tipos de eventos que podem ser disparados
export enum MessagingEventType {
  MESSAGE_SENT = 'message:sent',
  MESSAGE_DELIVERED = 'message:delivered',
  MESSAGE_READ = 'message:read',
  MESSAGE_FAILED = 'message:failed',
  CONNECTION_OPENED = 'connection:opened',
  CONNECTION_CLOSED = 'connection:closed',
  CONNECTION_ERROR = 'connection:error',
  QR_CODE_UPDATED = 'qr:updated'
}

// Status de mensagens
export enum MessageStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

// Status de conexão
export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  ERROR = 'error',
  PENDING = 'pending'
}
