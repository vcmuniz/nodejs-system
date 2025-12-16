import { IntegrationCredential, CreateIntegrationCredentialDTO, UpdateIntegrationCredentialDTO } from '../domain/models/IntegrationCredential';

export interface IIntegrationCredentialRepository {
  create(data: CreateIntegrationCredentialDTO): Promise<IntegrationCredential>;
  findById(id: string): Promise<IntegrationCredential | null>;
  findByName(name: string): Promise<IntegrationCredential | null>;
  findByType(type: string, activeOnly?: boolean): Promise<IntegrationCredential[]>;
  findAll(activeOnly?: boolean): Promise<IntegrationCredential[]>;
  update(id: string, data: UpdateIntegrationCredentialDTO): Promise<IntegrationCredential>;
  delete(id: string): Promise<void>;
}
