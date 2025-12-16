import { Request, Response } from 'express';
import { GetIntegrationCredentials } from '../../../usercase/integration-credentials/GetIntegrationCredentials';
import { makeIntegrationCredentialRepository } from '../../../infra/database/factories/makeIntegrationCredentialRepository';

export class GetIntegrationCredentialsController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { type, activeOnly } = req.query;

      const repository = makeIntegrationCredentialRepository();
      const useCase = new GetIntegrationCredentials(repository);

      const credentials = await useCase.execute(
        type as string,
        activeOnly === 'true'
      );

      return res.status(200).json(credentials);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Erro ao buscar credenciais',
      });
    }
  }
}
