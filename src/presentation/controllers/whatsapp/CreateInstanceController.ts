// Controller - Apenas orquestra o use case
import { Request, Response } from 'express';
import { CreateInstance } from '../../../usercase/whatsapp/CreateInstance';

export class CreateInstanceController {
  constructor(private createInstance: CreateInstance) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { instanceName, number, webhookUrl } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const output = await this.createInstance.execute({
        userId,
        instanceName,
        number,
        webhookUrl,
      });

      if (!output.success) {
        return res.status(400).json({ error: output.error });
      }

      return res.status(201).json(output.data);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        error: 'Erro ao criar instância',
      });
    }
  }
}
