import { IIntegrationCredentialRepository } from '../../ports/IIntegrationCredentialRepository';
import { UpdateIntegrationCredentialDTO, IntegrationCredential } from '../../domain/models/IntegrationCredential';

export class UpdateIntegrationCredential {
  constructor(private repository: IIntegrationCredentialRepository) {}

  async execute(id: string, data: UpdateIntegrationCredentialDTO): Promise<IntegrationCredential> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Credencial não encontrada');
    }

    if (data.name && data.name !== existing.name) {
      const nameExists = await this.repository.findByName(data.name);
      if (nameExists) {
        throw new Error('Já existe uma credencial com este nome');
      }
    }

    return this.repository.update(id, data);
  }
}
