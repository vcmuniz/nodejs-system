// Controller - Apenas orquestra o use case
import { Response } from 'express';
import { GetInstanceStatus } from '../../../usercase/whatsapp/GetInstanceStatus';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';

export class GetInstanceStatusController {
  constructor(private getInstanceStatus: GetInstanceStatus) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { instanceName } = req.params;

      const output = await this.getInstanceStatus.execute({ instanceName });

      if (!output.success) {
        return res.status(400).json({ error: output.error });
      }

      return res.status(200).json(output.data);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        error: 'Erro ao obter status',
      });
    }
  }
}
