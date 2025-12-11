// Controller - Obter status da instância
import { Request, Response } from 'express';
import { IEvolutionAPI } from '../../../ports/IEvolutionAPI';

export class GetInstanceStatusController {
  constructor(private evolutionAPI: IEvolutionAPI) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { instanceName } = req.params;

      if (!instanceName) {
        return res.status(400).json({ error: 'instanceName é obrigatório' });
      }

      const response = await this.evolutionAPI.getInstance(instanceName);

      return res.status(200).json(response);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao obter status',
      });
    }
  }
}
