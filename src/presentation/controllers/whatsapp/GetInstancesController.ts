// Controller - Listar instâncias
import { Response } from 'express';
import { GetInstances } from '../../../usercase/whatsapp/GetInstances';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';

export class GetInstancesController {
  constructor(private getInstances: GetInstances) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const output = await this.getInstances.execute();

      if (!output.success) {
        return res.status(400).json({ error: output.error });
      }

      return res.status(200).json(output.data);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        error: 'Erro ao listar instâncias',
      });
    }
  }
}
