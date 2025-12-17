// Use Case - Conectar instância e obter QR Code
import { IEvolutionAPI } from '../../ports/IEvolutionAPI';
import { IWhatsAppRepository } from '../../ports/IWhatsAppRepository';

export interface ConnectInstanceInput {
  instanceName: string;
  userId: string;
  webhookUrl?: string;
}

export interface ConnectInstanceOutput {
  success: boolean;
  data?: {
    instanceName: string;
    status: string;
    state?: string;
    qrcode?: {
      code: string;
      base64: string;
    };
  };
  error?: string;
}

export class ConnectInstance {
  constructor(
    private evolutionAPI: IEvolutionAPI,
    private whatsAppRepository: IWhatsAppRepository,
  ) {}

  async execute(input: ConnectInstanceInput): Promise<ConnectInstanceOutput> {
    try {
      this.validate(input);

      // Primeiro, garante que a instância existe no banco
      let instance = await this.whatsAppRepository.getInstanceByName(input.instanceName);
      if (!instance) {
        instance = await this.whatsAppRepository.saveInstance({
          id: Math.random().toString(36).substring(7),
          userId: input.userId,
          instanceName: input.instanceName,
          phoneNumber: '',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`[ConnectInstance] Instância criada: ${input.instanceName}`);
      }

      // Conecta a instância (gera QR code)
      const connectResponse = await this.evolutionAPI.connectInstance(input.instanceName);
      console.log(`[ConnectInstance] Resposta da Evolution:`, JSON.stringify(connectResponse, null, 2));

      // Persiste o QR code na base de dados
      if (connectResponse.base64) {
        console.log(`[ConnectInstance] Salvando QR code...`);
        await this.whatsAppRepository.updateInstanceQrCode(
          input.instanceName,
          connectResponse.base64,
        );
        console.log(`[ConnectInstance] QR code salvo com sucesso`);
      } else {
        console.warn(`[ConnectInstance] Nenhum QR code na resposta`);
      }

      // Registra o webhook no Evolution API
      if (input.webhookUrl) {
        try {
          console.log(`[ConnectInstance] Registrando webhook: ${input.webhookUrl}`);
          await this.evolutionAPI.setWebhook(input.instanceName, input.webhookUrl);
        } catch (webhookError) {
          console.warn('[ConnectInstance] Aviso ao registrar webhook:', webhookError);
          // Continua mesmo se webhook falhar
        }
      }

      return {
        success: true,
        data: {
          instanceName: input.instanceName,
          status: connectResponse.base64 ? 'open' : 'close',
          qrcode: {
            code: connectResponse.code,
            base64: connectResponse.base64,
          },
        },
      };
    } catch (error) {
      console.error('Erro ao conectar instância:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  private validate(input: ConnectInstanceInput): void {
    if (!input.instanceName) {
      throw new Error('instanceName é obrigatório');
    }
    if (!input.userId) {
      throw new Error('userId é obrigatório');
    }
  }
}
