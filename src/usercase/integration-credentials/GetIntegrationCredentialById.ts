import { IIntegrationCredentialRepository } from '../../ports/IIntegrationCredentialRepository';
import { IntegrationCredential } from '../../domain/models/IntegrationCredential';

export class GetIntegrationCredentialById {
  constructor(private repository: IIntegrationCredentialRepository) {}

  async execute(id: string): Promise<IntegrationCredential> {
    const credential = await this.repository.findById(id);
    if (!credential) {
      throw new Error('Credencial não encontrada');
    }
    return credential;
  }
}
