import { v4 as uuidv4 } from 'uuid';
import { IMessagingGroupRepository } from '../../../domain/messaging/repositories/IMessagingGroupRepository';
import { MessagingGroupType } from '../../../domain/messaging/MessagingGroup';

interface SyncGroupMember {
  identifier: string;
  identifierType: string;
  name?: string;
  metadata?: Record<string, any>;
}

interface SyncGroupData {
  externalGroupId: string;
  name: string;
  members: SyncGroupMember[];
  metadata?: Record<string, any>;
}

interface SyncGroupsFromProviderRequest {
  userId: string;
  businessProfileId?: string;
  instanceId: string;
  groupType: MessagingGroupType;
  groups: SyncGroupData[];
}

export class SyncGroupsFromProvider {
  constructor(private groupRepository: IMessagingGroupRepository) {}

  async execute(request: SyncGroupsFromProviderRequest): Promise<void> {
    for (const groupData of request.groups) {
      let group = await this.groupRepository.findByExternalId(
        request.instanceId,
        groupData.externalGroupId
      );

      if (!group) {
        group = await this.groupRepository.create({
          id: uuidv4(),
          userId: request.userId,
          businessProfileId: request.businessProfileId,
          instanceId: request.instanceId,
          name: groupData.name,
          type: request.groupType,
          externalGroupId: groupData.externalGroupId,
          metadata: groupData.metadata,
          isSynced: true,
          lastSyncAt: new Date(),
        });
      } else {
        await this.groupRepository.update(group.id, request.userId, {
          name: groupData.name,
          metadata: groupData.metadata,
          lastSyncAt: new Date(),
        });
      }

      const members = groupData.members.map((m) => ({
        id: uuidv4(),
        groupId: group!.id,
        identifier: m.identifier,
        identifierType: m.identifierType,
        name: m.name,
        metadata: m.metadata,
      }));

      await this.groupRepository.syncGroupMembers(group.id, members);
    }
  }
}
