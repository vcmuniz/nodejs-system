// Adapter - Implementação concreta da Evolution API
import axios, { AxiosInstance } from 'axios';
import {
  IEvolutionAPI,
  SendWhatsAppMessageRequest,
  SendWhatsAppMessageResponse,
  GetInstanceStatusResponse,
} from '../../ports/IEvolutionAPI';

export class EvolutionAPIImpl implements IEvolutionAPI {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string, baseURL: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      timeout: 30000,
    });
  }

  async sendMessage(request: SendWhatsAppMessageRequest): Promise<SendWhatsAppMessageResponse> {
    try {
      const response = await this.client.post(`/message/sendText/${request.instanceName}`, {
        number: request.number,
        text: request.message,
      });

      return {
        key: response.data.key,
        status: response.data.status || 'sent',
        message: response.data.message,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getInstanceStatus(instanceName: string): Promise<GetInstanceStatusResponse> {
    try {
      const response = await this.client.get(`/instance/info/${instanceName}`);

      return {
        instance: {
          instanceName: response.data.instanceName,
          status: response.data.status,
          qrcode: response.data.qrcode,
        },
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async createInstance(instanceName: string, number: string): Promise<any> {
    try {
      const response = await this.client.post('/instance/create', {
        instanceName,
        number,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteInstance(instanceName: string): Promise<any> {
    try {
      const response = await this.client.delete(`/instance/delete/${instanceName}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async restartInstance(instanceName: string): Promise<any> {
    try {
      const response = await this.client.post(`/instance/restart/${instanceName}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error.response) {
      throw new Error(`Evolution API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    }
    throw new Error(`Evolution API Error: ${error.message}`);
  }
}
