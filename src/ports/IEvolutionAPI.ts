// Port - Interface externa
export interface SendWhatsAppMessageRequest {
  instanceName: string;
  number: string;
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio' | 'video';
}

export interface SendWhatsAppMessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  status: string;
  message?: string;
}

export interface GetInstanceStatusResponse {
  instance: {
    instanceName: string;
    status: string;
    qrcode?: {
      code: string;
      base64: string;
    };
  };
}

export interface WebhookEventData {
  event: string;
  instance: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface IEvolutionAPI {
  sendMessage(request: SendWhatsAppMessageRequest): Promise<SendWhatsAppMessageResponse>;
  getInstanceStatus(instanceName: string): Promise<GetInstanceStatusResponse>;
  createInstance(instanceName: string, number: string): Promise<any>;
  deleteInstance(instanceName: string): Promise<any>;
  restartInstance(instanceName: string): Promise<any>;
}
