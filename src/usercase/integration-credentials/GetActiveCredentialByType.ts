import { IIntegrationCredentialRepository } from '../../ports/IIntegrationCredentialRepository';
import { IntegrationCredential } from '../../domain/models/IntegrationCredential';

export class GetActiveCredentialByType {
  constructor(private repository: IIntegrationCredentialRepository) {}

  async execute(type: string): Promise<IntegrationCredential> {
    const credentials = await this.repository.findByType(type, true);
    
    if (credentials.length === 0) {
      throw new Error(`Nenhuma credencial ativa encontrada para o tipo: ${type}`);
    }

    return credentials[0];
  }
}
