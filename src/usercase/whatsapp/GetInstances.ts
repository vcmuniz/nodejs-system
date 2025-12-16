// Use Case - Listar instâncias
import { IEvolutionAPI } from '../../ports/IEvolutionAPI';

export interface GetInstancesOutput {
  success: boolean;
  data?: Array<{
    instanceName: string;
    status: string;
    state?: string;
    phoneNumber?: string;
    isConnected: boolean;
    qrcode?: {
      code: string;
      base64: string;
    };
  }>;
  error?: string;
}

export class GetInstances {
  constructor(private evolutionAPI: IEvolutionAPI) {}

  async execute(): Promise<GetInstancesOutput> {
    try {
      const response = await this.evolutionAPI.getInstances();
      
      console.log('[GetInstances] Response:', JSON.stringify(response, null, 2));

      if (!response.instances || !Array.isArray(response.instances)) {
        return {
          success: true,
          data: [],
        };
      }

      const instances = response.instances.map(instance => ({
        instanceName: instance.instanceName,
        status: instance.status,
        state: instance.state,
        phoneNumber: instance.phoneNumber,
        isConnected: instance.state === 'CONNECTED',
        qrcode: instance.qrcode,
      }));

      return {
        success: true,
        data: instances,
      };
    } catch (error) {
      console.error('Erro ao listar instâncias:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
}
