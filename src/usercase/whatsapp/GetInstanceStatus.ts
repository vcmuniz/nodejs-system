// Use Case - Obter status da instância
import { IEvolutionAPI } from '../../ports/IEvolutionAPI';
import { IWhatsAppRepository } from '../../ports/IWhatsAppRepository';

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
    qrcode?: {
      code: string;
      base64: string;
    };
  };
  error?: string;
}

export class GetInstanceStatus {
  constructor(
    private evolutionAPI: IEvolutionAPI,
    private whatsappRepository: IWhatsAppRepository,
  ) {}

  async execute(input: GetInstanceStatusInput): Promise<GetInstanceStatusOutput> {
    try {
      this.validate(input);

      try {
        // Tenta buscar da Evolution API primeiro
        const response = await this.evolutionAPI.getInstance(input.instanceName);

        return {
          success: true,
          data: {
            instanceName: response.instance.instanceName,
            status: response.instance.status,
            state: response.instance.state,
            phoneNumber: response.instance.phoneNumber,
            isConnected: response.instance.state === 'CONNECTED',
            qrcode: response.instance.qrcode,
          },
        };
      } catch (error) {
        // Se falhar na Evolution API, tenta buscar do banco local
        console.log('Instância não encontrada na Evolution API, buscando do banco local...');
        const localInstance = await this.whatsappRepository.getInstanceByName(input.instanceName);

        if (localInstance) {
          return {
            success: true,
            data: {
              instanceName: localInstance.instanceName,
              status: localInstance.status,
              phoneNumber: localInstance.phoneNumber,
              isConnected: localInstance.status === 'connected',
              qrcode: localInstance.qrCode ? { code: localInstance.qrCode, base64: localInstance.qrCode } : undefined,
            },
          };
        }

        throw error;
      }
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
