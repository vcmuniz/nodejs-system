// Controller - Listar instâncias do usuário
import { Response } from 'express';
import { ListUserInstances } from '../../../usercase/whatsapp/ListUserInstances';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';

export class ListUserInstancesController {
  constructor(private listUserInstances: ListUserInstances) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const output = await this.listUserInstances.execute(userId);

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
