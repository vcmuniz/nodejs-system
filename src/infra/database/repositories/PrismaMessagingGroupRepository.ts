import { PrismaClient } from '@prisma/client';
import { IMessagingGroupRepository } from '../../../domain/messaging/repositories/IMessagingGroupRepository';
import {
  MessagingGroupData,
  MessagingGroupMemberData,
  CreateMessagingGroupDTO,
  UpdateMessagingGroupDTO,
  AddGroupMemberDTO,
} from '../../../domain/messaging/MessagingGroup';

export class PrismaMessagingGroupRepository implements IMessagingGroupRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateMessagingGroupDTO): Promise<MessagingGroupData> {
    const group = await this.prisma.messaging_groups.create({
      data: {
        id: data.id,
        userId: data.userId,
        businessProfileId: data.businessProfileId,
        instanceId: data.instanceId,
        name: data.name,
        description: data.description,
        type: data.type || 'CUSTOM',
        externalGroupId: data.externalGroupId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        isSynced: data.isSynced || false,
        lastSyncAt: data.lastSyncAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.mapToGroupData(group);
  }

  async findById(id: string, userId: string): Promise<MessagingGroupData | null> {
    const group = await this.prisma.messaging_groups.findFirst({
      where: { id, userId },
    });

    if (!group) return null;
    return this.mapToGroupData(group);
  }

  async findByInstanceId(instanceId: string, userId: string): Promise<MessagingGroupData[]> {
    const groups = await this.prisma.messaging_groups.findMany({
      where: { instanceId, userId },
      orderBy: { createdAt: 'desc' },
    });

    return groups.map((g) => this.mapToGroupData(g));
  }

  async findByExternalId(instanceId: string, externalGroupId: string): Promise<MessagingGroupData | null> {
    const group = await this.prisma.messaging_groups.findFirst({
      where: { instanceId, externalGroupId },
    });

    if (!group) return null;
    return this.mapToGroupData(group);
  }

  async update(id: string, userId: string, data: UpdateMessagingGroupDTO): Promise<MessagingGroupData> {
    const group = await this.prisma.messaging_groups.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        lastSyncAt: data.lastSyncAt,
        updatedAt: new Date(),
      },
    });

    return this.mapToGroupData(group);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.messaging_groups.delete({
      where: { id },
    });
  }

  async addMember(data: AddGroupMemberDTO): Promise<MessagingGroupMemberData> {
    const member = await this.prisma.messaging_group_members.create({
      data: {
        id: data.id,
        groupId: data.groupId,
        identifier: data.identifier,
        identifierType: data.identifierType,
        name: data.name,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        isActive: data.isActive ?? true,
        addedAt: new Date(),
      },
    });

    return this.mapToMemberData(member);
  }

  async removeMember(groupId: string, identifier: string, userId: string): Promise<void> {
    await this.prisma.messaging_group_members.deleteMany({
      where: { groupId, identifier },
    });
  }

  async listMembers(groupId: string, userId: string): Promise<MessagingGroupMemberData[]> {
    const members = await this.prisma.messaging_group_members.findMany({
      where: { groupId, isActive: true },
      orderBy: { addedAt: 'desc' },
    });

    return members.map((m) => this.mapToMemberData(m));
  }

  async syncGroupMembers(groupId: string, members: AddGroupMemberDTO[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Remove todos os membros antigos
      await tx.messaging_group_members.deleteMany({
        where: { groupId },
      });

      // Adiciona novos membros
      if (members.length > 0) {
        await tx.messaging_group_members.createMany({
          data: members.map((m) => ({
            id: m.id,
            groupId: m.groupId,
            identifier: m.identifier,
            identifierType: m.identifierType,
            name: m.name,
            metadata: m.metadata ? JSON.stringify(m.metadata) : null,
            isActive: m.isActive ?? true,
            addedAt: new Date(),
          })),
        });
      }

      // Atualiza lastSyncAt do grupo
      await tx.messaging_groups.update({
        where: { id: groupId },
        data: { lastSyncAt: new Date(), updatedAt: new Date() },
      });
    });
  }

  async findMemberByIdentifier(groupId: string, identifier: string): Promise<MessagingGroupMemberData | null> {
    const member = await this.prisma.messaging_group_members.findFirst({
      where: { groupId, identifier },
    });

    if (!member) return null;
    return this.mapToMemberData(member);
  }

  private mapToGroupData(group: any): MessagingGroupData {
    return {
      id: group.id,
      userId: group.userId,
      businessProfileId: group.businessProfileId,
      instanceId: group.instanceId,
      name: group.name,
      description: group.description,
      type: group.type,
      externalGroupId: group.externalGroupId,
      metadata: group.metadata ? JSON.parse(group.metadata) : undefined,
      isSynced: group.isSynced,
      lastSyncAt: group.lastSyncAt,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  private mapToMemberData(member: any): MessagingGroupMemberData {
    return {
      id: member.id,
      groupId: member.groupId,
      identifier: member.identifier,
      identifierType: member.identifierType,
      name: member.name,
      metadata: member.metadata ? JSON.parse(member.metadata) : undefined,
      isActive: member.isActive,
      addedAt: member.addedAt,
    };
  }
}
