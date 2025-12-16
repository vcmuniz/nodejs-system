// Port - Interface externa baseada em https://doc.evolution-api.com/v2/api-reference
export interface SendWhatsAppMessageRequest {
  number: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio' | 'video';
}

export interface SendWhatsAppMessageResponse {
  key?: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  status?: string;
  message?: string;
  error?: string;
}

export interface InstanceInfo {
  instanceName: string;
  status: 'open' | 'close' | 'connecting';
  state?: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'PAIRING';
  qrcode?: {
    code: string;
    base64: string;
  };
  profileName?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  ownerJid?: string;
  serverUrl?: string;
  apiUrl?: string;
  websocketUrl?: string;
  webhook?: {
    url: string;
    enabled: boolean;
  };
}

export interface GetInstanceResponse {
  instance: InstanceInfo;
}

export interface GetInstancesResponse {
  instances: InstanceInfo[];
}

export interface CreateInstanceRequest {
  instanceName: string;
  number?: string;
  integration?: string;
  webhook?: {
    url: string;
    enabled: boolean;
    byEvents: boolean;
    base64: boolean;
    events: string[];
  };
}

export interface CreateInstanceResponse {
  instance: InstanceInfo;
}

export interface ConnectInstanceResponse {
  qrcode: {
    code: string;
    base64: string;
  };
  message?: string;
}

export interface DisconnectInstanceResponse {
  message: string;
}

export interface DeleteInstanceResponse {
  message: string;
}

export interface RestartInstanceResponse {
  message: string;
}

export interface WebhookEventData {
  event: string;
  instance: string;
  data: Record<string, any>;
  timestamp?: number;
}

export interface IEvolutionAPI {
  // Instance Management
  getInstance(instanceName: string): Promise<GetInstanceResponse>;
  getInstances(): Promise<GetInstancesResponse>;
  createInstance(request: CreateInstanceRequest): Promise<CreateInstanceResponse>;
  connectInstance(instanceName: string): Promise<ConnectInstanceResponse>;
  disconnectInstance(instanceName: string): Promise<DisconnectInstanceResponse>;
  deleteInstance(instanceName: string): Promise<DeleteInstanceResponse>;
  restartInstance(instanceName: string): Promise<RestartInstanceResponse>;
  setWebhook(instanceName: string, webhookUrl: string): Promise<any>;

  // Messaging
  sendMessage(instanceName: string, request: SendWhatsAppMessageRequest): Promise<SendWhatsAppMessageResponse>;
}
