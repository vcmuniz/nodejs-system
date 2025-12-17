import { 
  MessagingGroupData, 
  MessagingGroupMemberData,
  CreateMessagingGroupDTO,
  UpdateMessagingGroupDTO,
  AddGroupMemberDTO
} from '../MessagingGroup';

export interface IMessagingGroupRepository {
  // CRUD de grupos
  create(data: CreateMessagingGroupDTO): Promise<MessagingGroupData>;
  findById(id: string, userId: string): Promise<MessagingGroupData | null>;
  findByInstanceId(instanceId: string, userId: string): Promise<MessagingGroupData[]>;
  findByExternalId(instanceId: string, externalGroupId: string): Promise<MessagingGroupData | null>;
  update(id: string, userId: string, data: UpdateMessagingGroupDTO): Promise<MessagingGroupData>;
  delete(id: string, userId: string): Promise<void>;
  
  // Membros do grupo
  addMember(data: AddGroupMemberDTO): Promise<MessagingGroupMemberData>;
  removeMember(groupId: string, identifier: string, userId: string): Promise<void>;
  listMembers(groupId: string, userId: string): Promise<MessagingGroupMemberData[]>;
  syncGroupMembers(groupId: string, members: AddGroupMemberDTO[]): Promise<void>;
  findMemberByIdentifier(groupId: string, identifier: string): Promise<MessagingGroupMemberData | null>;
}
