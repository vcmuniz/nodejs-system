import { IIntegrationCredentialRepository } from '../../ports/IIntegrationCredentialRepository';

export class DeleteIntegrationCredential {
  constructor(private repository: IIntegrationCredentialRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Credencial não encontrada');
    }

    await this.repository.delete(id);
  }
}
