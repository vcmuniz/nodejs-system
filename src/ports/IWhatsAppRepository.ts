// Port - Repository para persistir dados de WhatsApp
export interface WhatsAppInstanceData {
  id: string;
  userId: string;
  instanceName: string;
  phoneNumber: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
  lastConnectedAt?: Date;
}

export interface WhatsAppMessageLog {
  id: string;
  userId: string;
  instanceId: string;
  remoteJid: string;
  message: string;
  messageId: string;
  direction: 'sent' | 'received';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  mediaUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWhatsAppRepository {
  // Instance methods
  saveInstance(data: WhatsAppInstanceData): Promise<WhatsAppInstanceData>;
  getInstanceByUserId(userId: string): Promise<WhatsAppInstanceData | null>;
  getInstanceByName(instanceName: string): Promise<WhatsAppInstanceData | null>;
  updateInstanceStatus(instanceName: string, status: WhatsAppInstanceData['status']): Promise<void>;
  deleteInstance(instanceName: string): Promise<void>;

  // Message log methods
  logMessage(data: WhatsAppMessageLog): Promise<WhatsAppMessageLog>;
  updateMessageStatus(messageId: string, status: WhatsAppMessageLog['status']): Promise<void>;
  getMessageLog(userId: string, limit?: number): Promise<WhatsAppMessageLog[]>;
}
