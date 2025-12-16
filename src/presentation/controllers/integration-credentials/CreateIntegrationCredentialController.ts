import { Request, Response } from 'express';
import { CreateIntegrationCredential } from '../../../usercase/integration-credentials/CreateIntegrationCredential';
import { makeIntegrationCredentialRepository } from '../../../infra/database/factories/makeIntegrationCredentialRepository';

export class CreateIntegrationCredentialController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { name, type, credentials, isActive, description } = req.body;

      if (!name || !type || !credentials) {
        return res.status(400).json({
          error: 'Nome, tipo e credenciais são obrigatórios',
        });
      }

      const repository = makeIntegrationCredentialRepository();
      const useCase = new CreateIntegrationCredential(repository);

      const credential = await useCase.execute({
        name,
        type,
        credentials,
        isActive,
        description,
      });

      return res.status(201).json(credential);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Erro ao criar credencial',
      });
    }
  }
}
