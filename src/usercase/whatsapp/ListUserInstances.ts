// Use Case - Listar instâncias do usuário a partir do banco local
import { IWhatsAppRepository, WhatsAppInstanceData } from '../../ports/IWhatsAppRepository';

export interface ListUserInstancesOutput {
  success: boolean;
  data?: Array<{
    id: string;
    instanceName: string;
    status: string;
    phoneNumber?: string;
    qrCode?: string;
    createdAt: Date;
  }>;
  error?: string;
}

export class ListUserInstances {
  constructor(private whatsappRepository: IWhatsAppRepository) {}

  async execute(userId: string): Promise<ListUserInstancesOutput> {
    try {
      const instances = await this.whatsappRepository.listInstancesByUserId(userId);

      const data = instances.map(instance => ({
        id: instance.id,
        instanceName: instance.instanceName,
        status: instance.status,
        phoneNumber: instance.phoneNumber,
        qrCode: instance.qrCode,
        createdAt: instance.createdAt,
      }));

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Erro ao listar instâncias do usuário:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
}
