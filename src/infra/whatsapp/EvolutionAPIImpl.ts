// Adapter - Implementação concreta da Evolution API
// Documentação: https://doc.evolution-api.com/v2/api-reference
import axios, { AxiosInstance } from 'axios';
import {
  IEvolutionAPI,
  SendWhatsAppMessageRequest,
  SendWhatsAppMessageResponse,
  GetInstanceResponse,
  GetInstancesResponse,
  CreateInstanceRequest,
  CreateInstanceResponse,
  ConnectInstanceResponse,
  DisconnectInstanceResponse,
  DeleteInstanceResponse,
  RestartInstanceResponse,
} from '../../ports/IEvolutionAPI';

export class EvolutionAPIImpl implements IEvolutionAPI {
  private client: AxiosInstance;

  constructor(apiKey: string, baseURL: string) {
    console.log(`[EvolutionAPIImpl] Criando cliente com baseURL: ${baseURL}, apiKey: ${apiKey.substring(0, 10)}...`);
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'apikey': apiKey,
      },
      timeout: 30000,
    });
  }

  // Instance Management Methods
  async getInstance(instanceName: string): Promise<GetInstanceResponse> {
    try {
      console.log(`[getInstance] Buscando instância: ${instanceName}`);
      const response = await this.client.get(`/instance/connectionState/${instanceName}`);
      console.log(`[getInstance] Resposta:`, JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error(`[getInstance] Erro:`, error);
      this.handleError(error, `Erro ao obter instância: ${instanceName}`);
      return { instance: {} } as GetInstanceResponse;
    }
  }

  async getInstances(): Promise<GetInstancesResponse> {
    try {
      console.log('[getInstances] Chamando /instance/fetchInstances');
      const response = await this.client.get('/instance/fetchInstances');
      console.log('[getInstances] Response recebida:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('[getInstances] Erro na chamada:', error);
      this.handleError(error, 'Erro ao listar instâncias');
      return { instances: [] } as GetInstancesResponse;
    }
  }

  async createInstance(request: CreateInstanceRequest): Promise<CreateInstanceResponse> {
    try {
      const payload: any = {
        instanceName: request.instanceName,
        integration: request.integration || 'WHATSAPP-BAILEYS',
      };

      if (request.number) {
        payload.number = request.number;
      }

      console.log('[createInstance] Enviando payload:', JSON.stringify(payload, null, 2));
      const response = await this.client.post('/instance/create', payload);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao criar instância');
    }
  }

  async connectInstance(instanceName: string): Promise<ConnectInstanceResponse> {
    try {
      const response = await this.client.get(`/instance/connect/${instanceName}`);
      console.log(`[connectInstance] Resposta da Evolution API:`, JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao conectar instância');
    }
  }

  async disconnectInstance(instanceName: string): Promise<DisconnectInstanceResponse> {
    try {
      const response = await this.client.get(`/instance/disconnect/${instanceName}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao desconectar instância');
    }
  }

  async deleteInstance(instanceName: string): Promise<DeleteInstanceResponse> {
    try {
      const response = await this.client.delete(`/instance/delete/${instanceName}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao deletar instância');
    }
  }

  async restartInstance(instanceName: string): Promise<RestartInstanceResponse> {
    try {
      const response = await this.client.post(`/instance/restart/${instanceName}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao reiniciar instância');
    }
  }

  async setWebhook(instanceName: string, webhookUrl: string): Promise<any> {
    try {
      console.log(`[setWebhook] Configurando webhook para: ${instanceName}`);
      const response = await this.client.post(`/webhook/set/${instanceName}`, {
        webhook: {
          url: webhookUrl,
          enabled: true,
          webhookByEvents: true,
          webhookBase64: false,
          events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
        }
      });
      console.log(`[setWebhook] Resposta:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[setWebhook] Erro:`, error);
      this.handleError(error, 'Erro ao configurar webhook');
    }
  }

  // Messaging Methods
  async sendMessage(
    instanceName: string,
    request: SendWhatsAppMessageRequest,
  ): Promise<SendWhatsAppMessageResponse> {
    try {
      // Se tem mídia, usa sendMedia, senão usa sendText
      if (request.mediaUrl) {
        const payload = {
          number: request.number,
          mediatype: request.mediaType || 'image',
          media: request.mediaUrl,
          caption: request.text || '',
        };
        
        console.log('[EvolutionAPI] Enviando mensagem com mídia:');
        console.log('  Instance:', instanceName);
        console.log('  Payload:', JSON.stringify(payload, null, 2));
        console.log('  URL:', `/message/sendMedia/${instanceName}`);
        
        const response = await this.client.post(`/message/sendMedia/${instanceName}`, payload);
        
        console.log('[EvolutionAPI] Resposta:', JSON.stringify(response.data, null, 2));
        
        return response.data;
      } else {
        const payload = {
          number: request.number,
          text: request.text,
        };
        
        console.log('[EvolutionAPI] Enviando mensagem de texto:');
        console.log('  Instance:', instanceName);
        console.log('  Payload:', JSON.stringify(payload, null, 2));
        console.log('  URL:', `/message/sendText/${instanceName}`);
        
        const response = await this.client.post(`/message/sendText/${instanceName}`, payload);
        
        console.log('[EvolutionAPI] Resposta:', JSON.stringify(response.data, null, 2));
        
        return response.data;
      }
    } catch (error) {
      this.handleError(error, 'Erro ao enviar mensagem');
    }
  }

  // Error Handling
  private handleError(error: any, customMessage: string): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      let errorMessage = 'Unknown error';

      // Log para debug - mostra toda a resposta
      console.log('[handleError] Raw response data:', JSON.stringify(data, null, 2));
      console.log('[handleError] Error config:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      });

      try {
        // Tenta extrair mensagem de erro em diferentes formatos
        const messageField = data?.response?.message;

        if (messageField) {
          if (Array.isArray(messageField) && messageField.length > 0) {
            errorMessage = messageField.map(String).join(', ');
          } else if (typeof messageField === 'string' && messageField.length > 0) {
            errorMessage = messageField;
          } else if (typeof messageField === 'object') {
            errorMessage = JSON.stringify(messageField);
          }
        } else if (data?.message) {
          if (Array.isArray(data.message) && data.message.length > 0) {
            errorMessage = data.message.map(String).join(', ');
          } else if (typeof data.message === 'string' && data.message.length > 0) {
            errorMessage = data.message;
          } else {
            errorMessage = JSON.stringify(data.message);
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch (e) {
        errorMessage = `Error parsing: ${String(e)}`;
      }

      console.error(`[EvolutionAPI Error] ${customMessage}`, {
        status,
        statusText: error.response?.statusText,
        errorMessage,
      });

      throw new Error(
        `${customMessage}: ${status} - ${errorMessage}`,
      );
    }

    console.error(`[EvolutionAPI Error] ${customMessage}`, error);
    throw new Error(`${customMessage}: ${error.message || 'Unknown error'}`);
  }
}
