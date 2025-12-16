import { Request, Response } from 'express';
import { GetIntegrationCredentialById } from '../../../usercase/integration-credentials/GetIntegrationCredentialById';
import { makeIntegrationCredentialRepository } from '../../../infra/database/factories/makeIntegrationCredentialRepository';

export class GetIntegrationCredentialByIdController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const repository = makeIntegrationCredentialRepository();
      const useCase = new GetIntegrationCredentialById(repository);

      const credential = await useCase.execute(id);

      return res.status(200).json(credential);
    } catch (error: any) {
      return res.status(404).json({
        error: error.message || 'Credencial não encontrada',
      });
    }
  }
}
