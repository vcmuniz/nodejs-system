// Use Case - Criar instância WhatsApp
import { IEvolutionAPI } from '../../ports/IEvolutionAPI';

export interface CreateInstanceInput {
  userId: string;
  instanceName: string;
  number?: string;
  webhookUrl?: string;
}

export interface CreateInstanceOutput {
  success: boolean;
  data?: {
    instanceName: string;
    status: string;
    state?: string;
  };
  error?: string;
}

export class CreateInstance {
  constructor(private evolutionAPI: IEvolutionAPI) {}

  async execute(input: CreateInstanceInput): Promise<CreateInstanceOutput> {
    try {
      this.validate(input);

      const response = await this.evolutionAPI.createInstance({
        instanceName: input.instanceName,
        number: input.number,
        webhook: input.webhookUrl
          ? {
              url: input.webhookUrl,
              enabled: true,
            }
          : undefined,
      });

      return {
        success: true,
        data: {
          instanceName: response.instance.instanceName,
          status: response.instance.status,
          state: response.instance.state,
        },
      };
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  private validate(input: CreateInstanceInput): void {
    if (!input.userId) {
      throw new Error('userId é obrigatório');
    }

    if (!input.instanceName) {
      throw new Error('instanceName é obrigatório');
    }

    if (input.number && !this.isValidPhoneNumber(input.number)) {
      throw new Error('Número de telefone inválido (formato: 5511999999999)');
    }
  }

  private isValidPhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^55\d{10,11}$/.test(cleanPhone);
  }
}
