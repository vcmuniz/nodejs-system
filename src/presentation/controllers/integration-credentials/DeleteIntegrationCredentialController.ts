import { Request, Response } from 'express';
import { DeleteIntegrationCredential } from '../../../usercase/integration-credentials/DeleteIntegrationCredential';
import { makeIntegrationCredentialRepository } from '../../../infra/database/factories/makeIntegrationCredentialRepository';

export class DeleteIntegrationCredentialController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const repository = makeIntegrationCredentialRepository();
      const useCase = new DeleteIntegrationCredential(repository);

      await useCase.execute(id);

      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Erro ao deletar credencial',
      });
    }
  }
}
