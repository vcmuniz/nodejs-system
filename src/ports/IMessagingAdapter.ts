// Port - Interface que cada adapter de canal deve implementar
import { MessagingChannel, ConnectionStatus, MessageStatus } from '../domain/messaging/MessagingChannel';

export interface SendMessageInput {
  channelInstanceId: string;
  remoteJid: string; // Destinatário (telefone, ID, email, etc)
  message: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface SendMessageOutput {
  channelMessageId: string;
  timestamp: Date;
}

export interface ConnectInput {
  channelInstanceId: string;
  credentials?: Record<string, any>;
  needsCreate?: boolean; // Se true, tenta criar instância antes de conectar
  webhookBaseUrl?: string; // URL base para configurar webhook (ex: https://api.com)
}

export interface ConnectOutput {
  status: ConnectionStatus;
  qrCode?: string;
  message?: string;
}

export interface DisconnectInput {
  channelInstanceId: string;
}

export interface GetStatusInput {
  channelInstanceId: string;
}

export interface GetStatusOutput {
  status: ConnectionStatus;
  qrCode?: string;
  isReady: boolean;
  message?: string;
}

// Interface que cada adaptador deve implementar
export interface IMessagingAdapter {
  // Retorna o canal que este adapter suporta
  getChannel(): MessagingChannel;

  // Conectar instância (autenticar)
  connect(input: ConnectInput): Promise<ConnectOutput>;

  // Desconectar instância
  disconnect(input: DisconnectInput): Promise<void>;

  // Enviar mensagem
  sendMessage(input: SendMessageInput): Promise<SendMessageOutput>;

  // Obter status da conexão
  getStatus(input: GetStatusInput): Promise<GetStatusOutput>;

  // Webhook handler - processar eventos do provedor
  handleWebhook(body: any): Promise<{ event: string; data: any }>;
}
