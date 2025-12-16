import { IIntegrationCredentialRepository } from '../../ports/IIntegrationCredentialRepository';
import { IntegrationCredential } from '../../domain/models/IntegrationCredential';

export class GetIntegrationCredentials {
  constructor(private repository: IIntegrationCredentialRepository) {}

  async execute(type?: string, activeOnly: boolean = false): Promise<IntegrationCredential[]> {
    if (type) {
      return this.repository.findByType(type, activeOnly);
    }
    return this.repository.findAll(activeOnly);
  }
}
