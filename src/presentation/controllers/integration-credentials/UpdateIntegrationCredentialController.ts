import { Request, Response } from 'express';
import { UpdateIntegrationCredential } from '../../../usercase/integration-credentials/UpdateIntegrationCredential';
import { makeIntegrationCredentialRepository } from '../../../infra/database/factories/makeIntegrationCredentialRepository';

export class UpdateIntegrationCredentialController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, credentials, isActive, description } = req.body;

      const repository = makeIntegrationCredentialRepository();
      const useCase = new UpdateIntegrationCredential(repository);

      const credential = await useCase.execute(id, {
        name,
        credentials,
        isActive,
        description,
      });

      return res.status(200).json(credential);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Erro ao atualizar credencial',
      });
    }
  }
}
