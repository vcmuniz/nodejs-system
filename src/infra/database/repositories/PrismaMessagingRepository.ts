// Repository Prisma para Messageria
import { PrismaClient } from '@prisma/client';
import { IMessagingRepository } from '../../../ports/IMessagingRepository';
import { MessagingInstanceData, MessagingMessage } from '../../../domain/messaging/MessagingInstance';
import { MessagingChannel, ConnectionStatus, MessageStatus } from '../../../domain/messaging/MessagingChannel';

export class PrismaMessagingRepository implements IMessagingRepository {
  constructor(private prisma: PrismaClient) {}

  async saveInstance(data: MessagingInstanceData): Promise<MessagingInstanceData> {
    const instance = await this.prisma.messaging_instances.create({
      data: {
        id: data.id,
        userId: data.userId,
        channel: data.channel as any,
        channelInstanceId: data.channelInstanceId,
        channelPhoneOrId: data.channelPhoneOrId,
        status: data.status,
        qrCode: data.qrCode,
        metadata: JSON.stringify(data.metadata || {}),
        credentialId: data.credentialId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });

    return {
      id: instance.id,
      userId: instance.userId,
      channel: instance.channel as MessagingChannel,
      channelInstanceId: instance.channelInstanceId,
      channelPhoneOrId: instance.channelPhoneOrId,
      status: instance.status as ConnectionStatus,
      qrCode: instance.qrCode || undefined,
      metadata: instance.metadata ? JSON.parse(instance.metadata as string) : {},
      credentialId: instance.credentialId || undefined,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt,
      lastConnectedAt: instance.lastConnectedAt || undefined,
      lastDisconnectedAt: instance.lastDisconnectedAt || undefined,
    };
  }

  async getInstanceByUserId(userId: string, channel?: MessagingChannel): Promise<MessagingInstanceData | null> {
    const instance = await this.prisma.messaging_instances.findFirst({
      where: {
        userId,
        ...(channel && { channel }),
      },
    });

    return instance ? this.mapToMessagingInstanceData(instance) : null;
  }

  async listInstancesByUserId(userId: string, channel?: MessagingChannel): Promise<MessagingInstanceData[]> {
    const instances = await this.prisma.messaging_instances.findMany({
      where: {
        userId,
        ...(channel && { channel }),
      },
    });

    return instances.map(i => this.mapToMessagingInstanceData(i));
  }

  async getInstanceById(instanceId: string): Promise<MessagingInstanceData | null> {
    const instance = await this.prisma.messaging_instances.findUnique({
      where: { id: instanceId },
    });

    return instance ? this.mapToMessagingInstanceData(instance) : null;
  }

  async getInstanceByChannelId(channelInstanceId: string, channel: MessagingChannel): Promise<MessagingInstanceData | null> {
    const instance = await this.prisma.messaging_instances.findFirst({
      where: { channelInstanceId, channel: channel as any },
    });

    return instance ? this.mapToMessagingInstanceData(instance) : null;
  }

  async updateInstanceStatus(instanceId: string, status: ConnectionStatus): Promise<void> {
    await this.prisma.messaging_instances.update({
      where: { id: instanceId },
      data: {
        status,
        ...(status === ConnectionStatus.CONNECTED && { lastConnectedAt: new Date() }),
        ...(status === ConnectionStatus.DISCONNECTED && { lastDisconnectedAt: new Date() }),
      },
    });
  }

  async updateInstanceQrCode(instanceId: string, qrCode: string): Promise<void> {
    await this.prisma.messaging_instances.update({
      where: { id: instanceId },
      data: { qrCode },
    });
  }

  async updateInstanceMetadata(instanceId: string, metadata: Record<string, any>): Promise<void> {
    await this.prisma.messaging_instances.update({
      where: { id: instanceId },
      data: { metadata: metadata as any },
    });
  }

  async deleteInstance(instanceId: string): Promise<void> {
    await this.prisma.messaging_instances.delete({
      where: { id: instanceId },
    });
  }

  async logMessage(data: MessagingMessage): Promise<MessagingMessage> {
    const message = await this.prisma.messaging_messages.create({
      data: {
        id: data.id,
        userId: data.userId,
        instanceId: data.instanceId,
        channel: data.channel,
        remoteJid: data.remoteJid,
        message: data.message,
        channelMessageId: data.channelMessageId,
        direction: data.direction,
        status: data.status,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        error: data.error,
        retries: data.retries,
        maxRetries: data.maxRetries,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });

    return {
      id: message.id,
      userId: message.userId,
      instanceId: message.instanceId,
      channel: message.channel as MessagingChannel,
      remoteJid: message.remoteJid,
      message: message.message,
      channelMessageId: message.channelMessageId || undefined,
      direction: message.direction as 'sent' | 'received',
      status: message.status,
      mediaUrl: message.mediaUrl || undefined,
      mediaType: message.mediaType || undefined,
      error: message.error || undefined,
      retries: message.retries,
      maxRetries: message.maxRetries,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sentAt: message.sentAt || undefined,
      deliveredAt: message.deliveredAt || undefined,
      readAt: message.readAt || undefined,
    };
  }

  async updateMessageStatus(messageId: string, status: MessageStatus): Promise<void> {
    const updates: any = { status };
    
    if (status === MessageStatus.SENT) updates.sentAt = new Date();
    if (status === MessageStatus.DELIVERED) updates.deliveredAt = new Date();
    if (status === MessageStatus.READ) updates.readAt = new Date();

    await this.prisma.messaging_messages.update({
      where: { id: messageId },
      data: updates,
    });
  }

  async updateMessageChannelId(messageId: string, channelMessageId: string): Promise<void> {
    await this.prisma.messaging_messages.update({
      where: { id: messageId },
      data: { channelMessageId },
    });
  }

  async getMessageLog(userId: string, channel?: MessagingChannel, limit: number = 50): Promise<MessagingMessage[]> {
    const messages = await this.prisma.messaging_messages.findMany({
      where: {
        userId,
        ...(channel && { channel }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.map(m => ({
      id: m.id,
      userId: m.userId,
      instanceId: m.instanceId,
      channel: m.channel as MessagingChannel,
      remoteJid: m.remoteJid,
      message: m.message,
      channelMessageId: m.channelMessageId || undefined,
      direction: m.direction as 'sent' | 'received',
      status: m.status,
      mediaUrl: m.mediaUrl || undefined,
      mediaType: m.mediaType || undefined,
      error: m.error || undefined,
      retries: m.retries,
      maxRetries: m.maxRetries,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      sentAt: m.sentAt || undefined,
      deliveredAt: m.deliveredAt || undefined,
      readAt: m.readAt || undefined,
    }));
  }

  async getMessageById(messageId: string): Promise<MessagingMessage | null> {
    const message = await this.prisma.messaging_messages.findUnique({
      where: { id: messageId },
    });

    return message ? ({
      id: message.id,
      userId: message.userId,
      instanceId: message.instanceId,
      channel: message.channel as MessagingChannel,
      remoteJid: message.remoteJid,
      message: message.message,
      channelMessageId: message.channelMessageId || undefined,
      direction: message.direction as 'sent' | 'received',
      status: message.status,
      mediaUrl: message.mediaUrl || undefined,
      mediaType: message.mediaType || undefined,
      error: message.error || undefined,
      retries: message.retries,
      maxRetries: message.maxRetries,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      sentAt: message.sentAt || undefined,
      deliveredAt: message.deliveredAt || undefined,
      readAt: message.readAt || undefined,
    }) : null;
  }

  async updateMessageError(messageId: string, error: string, retries: number): Promise<void> {
    await this.prisma.messaging_messages.update({
      where: { id: messageId },
      data: { error, retries },
    });
  }

  private mapToMessagingInstanceData(instance: any): MessagingInstanceData {
    return {
      id: instance.id,
      userId: instance.userId,
      channel: instance.channel as MessagingChannel,
      channelInstanceId: instance.channelInstanceId,
      channelPhoneOrId: instance.channelPhoneOrId,
      status: instance.status as ConnectionStatus,
      qrCode: instance.qrCode || undefined,
      metadata: instance.metadata ? JSON.parse(instance.metadata as string) : {},
      credentialId: instance.credentialId || undefined,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt,
      lastConnectedAt: instance.lastConnectedAt || undefined,
      lastDisconnectedAt: instance.lastDisconnectedAt || undefined,
    };
  }
}
