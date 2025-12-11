// Use Case - Obter status da instância
import { IEvolutionAPI } from '../../ports/IEvolutionAPI';

export interface GetInstanceStatusInput {
  instanceName: string;
}

export interface GetInstanceStatusOutput {
  success: boolean;
  data?: {
    instanceName: string;
    status: string;
    state?: string;
    phoneNumber?: string;
    isConnected: boolean;
  };
  error?: string;
}

export class GetInstanceStatus {
  constructor(private evolutionAPI: IEvolutionAPI) {}

  async execute(input: GetInstanceStatusInput): Promise<GetInstanceStatusOutput> {
    try {
      this.validate(input);

      const response = await this.evolutionAPI.getInstance(input.instanceName);

      return {
        success: true,
        data: {
          instanceName: response.instance.instanceName,
          status: response.instance.status,
          state: response.instance.state,
          phoneNumber: response.instance.phoneNumber,
          isConnected: response.instance.state === 'CONNECTED',
        },
      };
    } catch (error) {
      console.error('Erro ao obter status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  private validate(input: GetInstanceStatusInput): void {
    if (!input.instanceName) {
      throw new Error('instanceName é obrigatório');
    }
  }
}
