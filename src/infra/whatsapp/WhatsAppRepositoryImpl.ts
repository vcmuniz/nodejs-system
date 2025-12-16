// Adapter - Implementação do repositório WhatsApp com Prisma
import { PrismaClient } from '@prisma/client';
import {
  IWhatsAppRepository,
  WhatsAppInstanceData,
  WhatsAppMessageLog,
} from '../../ports/IWhatsAppRepository';

export class WhatsAppRepositoryImpl implements IWhatsAppRepository {
  constructor(private prisma: PrismaClient) {}

  // ===== Instance Methods =====

  async saveInstance(data: WhatsAppInstanceData): Promise<WhatsAppInstanceData> {
    try {
      const instance = await this.prisma.whatsAppInstance.upsert({
        where: { instanceName: data.instanceName },
        update: {
          status: data.status,
          state: data.status === 'connected' ? 'CONNECTED' : 'DISCONNECTED',
          qrCode: data.qrCode,
          phoneNumber: data.phoneNumber,
          updatedAt: new Date(),
        },
        create: {
          id: data.id,
          userId: data.userId,
          instanceName: data.instanceName,
          phoneNumber: data.phoneNumber,
          status: data.status === 'connected' ? 'open' : 'close',
          state: data.status === 'connected' ? 'CONNECTED' : 'DISCONNECTED',
          qrCode: data.qrCode,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      });

      return {
        id: instance.id,
        userId: instance.userId,
        instanceName: instance.instanceName,
        phoneNumber: instance.phoneNumber || '',
        status: this.mapStatusFromDb(instance.state),
        qrCode: instance.qrCode || undefined,
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt,
        lastConnectedAt: instance.lastConnectedAt || undefined,
      };
    } catch (error) {
      console.error('Erro ao salvar instância:', error);
      throw error;
    }
  }

  async getInstanceByUserId(userId: string): Promise<WhatsAppInstanceData | null> {
    try {
      const instance = await this.prisma.whatsAppInstance.findFirst({
        where: { userId },
      });

      if (!instance) return null;

      return {
        id: instance.id,
        userId: instance.userId,
        instanceName: instance.instanceName,
        phoneNumber: instance.phoneNumber || '',
        status: this.mapStatusFromDb(instance.state),
        qrCode: instance.qrCode || undefined,
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt,
        lastConnectedAt: instance.lastConnectedAt || undefined,
      };
    } catch (error) {
      console.error('Erro ao obter instância por usuário:', error);
      throw error;
    }
  }

  async listInstancesByUserId(userId: string): Promise<WhatsAppInstanceData[]> {
    try {
      const instances = await this.prisma.whatsAppInstance.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return instances.map(instance => ({
        id: instance.id,
        userId: instance.userId,
        instanceName: instance.instanceName,
        phoneNumber: instance.phoneNumber || '',
        status: this.mapStatusFromDb(instance.state),
        qrCode: instance.qrCode || undefined,
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt,
        lastConnectedAt: instance.lastConnectedAt || undefined,
      }));
    } catch (error) {
      console.error('Erro ao listar instâncias por usuário:', error);
      throw error;
    }
  }

  async getInstanceByName(instanceName: string): Promise<WhatsAppInstanceData | null> {
    try {
      const instance = await this.prisma.whatsAppInstance.findUnique({
        where: { instanceName },
      });

      if (!instance) return null;

      return {
        id: instance.id,
        userId: instance.userId,
        instanceName: instance.instanceName,
        phoneNumber: instance.phoneNumber || '',
        status: this.mapStatusFromDb(instance.state),
        qrCode: instance.qrCode || undefined,
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt,
        lastConnectedAt: instance.lastConnectedAt || undefined,
      };
    } catch (error) {
      console.error('Erro ao obter instância por nome:', error);
      throw error;
    }
  }

  async updateInstanceStatus(
    instanceName: string,
    status: WhatsAppInstanceData['status'],
  ): Promise<void> {
    try {
      await this.prisma.whatsAppInstance.update({
        where: { instanceName },
        data: {
          status: status === 'connected' ? 'open' : 'close',
          state: this.mapStateFromStatus(status),
          lastConnectedAt: status === 'connected' ? new Date() : undefined,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar status da instância:', error);
      throw error;
    }
  }

  async updateInstanceQrCode(instanceName: string, qrCode: string): Promise<void> {
    try {
      await this.prisma.whatsAppInstance.updateMany({
        where: { instanceName },
        data: {
          qrCode,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar QR code da instância:', error);
      throw error;
    }
  }

  async deleteInstance(instanceName: string): Promise<void> {
    try {
      await this.prisma.whatsAppInstance.delete({
        where: { instanceName },
      });
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
      throw error;
    }
  }

  // ===== Message Log Methods =====

  async logMessage(data: WhatsAppMessageLog): Promise<WhatsAppMessageLog> {
    try {
      const message = await this.prisma.whatsAppMessageLog.create({
        data: {
          id: data.id,
          userId: data.userId,
          instanceId: data.instanceId,
          remoteJid: data.remoteJid,
          message: data.message,
          messageId: data.messageId,
          direction: data.direction,
          status: data.status,
          mediaUrl: data.mediaUrl,
          error: data.error,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      });

      return {
        id: message.id,
        userId: message.userId,
        instanceId: message.instanceId,
        remoteJid: message.remoteJid,
        message: message.message,
        messageId: message.messageId,
        direction: message.direction as 'sent' | 'received',
        status: message.status as WhatsAppMessageLog['status'],
        mediaUrl: message.mediaUrl || undefined,
        error: message.error || undefined,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };
    } catch (error) {
      console.error('Erro ao registrar mensagem:', error);
      throw error;
    }
  }

  async updateMessageStatus(
    messageId: string,
    status: WhatsAppMessageLog['status'],
  ): Promise<void> {
    try {
      await this.prisma.whatsAppMessageLog.update({
        where: { messageId },
        data: {
          status,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar status da mensagem:', error);
      throw error;
    }
  }

  async getMessageLog(userId: string, limit: number = 50): Promise<WhatsAppMessageLog[]> {
    try {
      const messages = await this.prisma.whatsAppMessageLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return messages.map((msg) => ({
        id: msg.id,
        userId: msg.userId,
        instanceId: msg.instanceId,
        remoteJid: msg.remoteJid,
        message: msg.message,
        messageId: msg.messageId,
        direction: msg.direction as 'sent' | 'received',
        status: msg.status as WhatsAppMessageLog['status'],
        mediaUrl: msg.mediaUrl || undefined,
        error: msg.error || undefined,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      }));
    } catch (error) {
      console.error('Erro ao obter log de mensagens:', error);
      throw error;
    }
  }

  // ===== Helper Methods =====

  private mapStatusFromDb(state: string): WhatsAppInstanceData['status'] {
    const statusMap: Record<string, WhatsAppInstanceData['status']> = {
      'CONNECTED': 'connected',
      'DISCONNECTED': 'disconnected',
      'CONNECTING': 'pending',
      'PAIRING': 'pending',
    };
    return statusMap[state] || 'disconnected';
  }

  private mapStateFromStatus(status: WhatsAppInstanceData['status']): string {
    const stateMap: Record<WhatsAppInstanceData['status'], string> = {
      'connected': 'CONNECTED',
      'disconnected': 'DISCONNECTED',
      'pending': 'CONNECTING',
      'error': 'DISCONNECTED',
    };
    return stateMap[status] || 'DISCONNECTED';
  }
}
