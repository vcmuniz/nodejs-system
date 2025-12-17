export type MessagingGroupType = 'CUSTOM' | 'SYNCED_WHATSAPP' | 'SYNCED_TELEGRAM' | 'SYNCED_EMAIL';

export interface MessagingGroupData {
  id: string;
  userId: string;
  businessProfileId?: string;
  instanceId: string;
  name: string;
  description?: string;
  type: MessagingGroupType;
  externalGroupId?: string;
  metadata?: Record<string, any>;
  isSynced: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessagingGroupMemberData {
  id: string;
  groupId: string;
  identifier: string;
  identifierType: string;
  name?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  addedAt: Date;
}

export interface CreateMessagingGroupDTO {
  id: string;
  userId: string;
  businessProfileId?: string;
  instanceId: string;
  name: string;
  description?: string;
  type?: MessagingGroupType;
  externalGroupId?: string;
  metadata?: Record<string, any>;
  isSynced?: boolean;
  lastSyncAt?: Date;
}

export interface UpdateMessagingGroupDTO {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
  lastSyncAt?: Date;
}

export interface AddGroupMemberDTO {
  id: string;
  groupId: string;
  identifier: string;
  identifierType: string;
  name?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
}
