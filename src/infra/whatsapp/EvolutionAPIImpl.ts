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
      const response = await this.client.get(`/instance/get/${instanceName}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Erro ao obter instância: ${instanceName}`);
    }
  }

  async getInstances(): Promise<GetInstancesResponse> {
    try {
      const response = await this.client.get('/instance/fetchInstances');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao listar instâncias');
    }
  }

  async createInstance(request: CreateInstanceRequest): Promise<CreateInstanceResponse> {
    try {
      const response = await this.client.post('/instance/create', {
        instanceName: request.instanceName,
        number: request.number,
        webhook: request.webhook,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao criar instância');
    }
  }

  async connectInstance(instanceName: string): Promise<ConnectInstanceResponse> {
    try {
      const response = await this.client.get(`/instance/connect/${instanceName}`);
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

  // Messaging Methods
  async sendMessage(
    instanceName: string,
    request: SendWhatsAppMessageRequest,
  ): Promise<SendWhatsAppMessageResponse> {
    try {
      const response = await this.client.post(`/message/sendText/${instanceName}`, {
        number: request.number,
        text: request.text,
        mediaUrl: request.mediaUrl,
        mediaType: request.mediaType,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Erro ao enviar mensagem');
    }
  }

  // Error Handling
  private handleError(error: any, customMessage: string): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      console.error(`[EvolutionAPI Error] ${customMessage}`, {
        status,
        statusText: error.response?.statusText,
        data,
      });

      throw new Error(
        `${customMessage}: ${status} - ${data?.message || error.message || 'Unknown error'}`,
      );
    }

    console.error(`[EvolutionAPI Error] ${customMessage}`, error);
    throw new Error(`${customMessage}: ${error.message || 'Unknown error'}`);
  }
}
