// Controller - Criar instância WhatsApp
import { Request, Response } from 'express';
import { IEvolutionAPI } from '../../../ports/IEvolutionAPI';

export class CreateInstanceController {
  constructor(private evolutionAPI: IEvolutionAPI) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { instanceName, number, webhook } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!instanceName) {
        return res.status(400).json({ error: 'instanceName é obrigatório' });
      }

      const response = await this.evolutionAPI.createInstance({
        instanceName,
        number,
        webhook,
      });

      return res.status(201).json(response);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao criar instância',
      });
    }
  }
}
