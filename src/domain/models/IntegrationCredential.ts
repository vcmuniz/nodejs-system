export interface IntegrationCredential {
  id: string;
  name: string;
  type: 'evolution' | 'twilio' | 'telegram' | 'facebook' | string;
  credentials: Record<string, any>;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIntegrationCredentialDTO {
  name: string;
  type: string;
  credentials: Record<string, any>;
  isActive?: boolean;
  description?: string;
}

export interface UpdateIntegrationCredentialDTO {
  name?: string;
  credentials?: Record<string, any>;
  isActive?: boolean;
  description?: string;
}
