import { IIntegrationCredentialRepository } from '../../ports/IIntegrationCredentialRepository';
import { CreateIntegrationCredentialDTO, IntegrationCredential } from '../../domain/models/IntegrationCredential';

export class CreateIntegrationCredential {
  constructor(private repository: IIntegrationCredentialRepository) {}

  async execute(data: CreateIntegrationCredentialDTO): Promise<IntegrationCredential> {
    const existing = await this.repository.findByName(data.name);
    if (existing) {
      throw new Error('Já existe uma credencial com este nome');
    }

    return this.repository.create(data);
  }
}
