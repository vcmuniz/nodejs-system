// Controller - Conectar instância e obter QR Code
import { Response } from 'express';
import { ConnectInstance } from '../../../usercase/whatsapp/ConnectInstance';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';

export class ConnectInstanceController {
  constructor(private connectInstance: ConnectInstance) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { instanceName } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Constrói a URL do webhook
      const webhookUrl = `${process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`}/api/whatsapp/webhooks/messages`;

      const output = await this.connectInstance.execute({ 
        instanceName, 
        userId,
        webhookUrl,
      });

      if (!output.success) {
        return res.status(400).json({ error: output.error });
      }

      return res.status(200).json(output.data);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        error: 'Erro ao conectar instância',
      });
    }
  }
}
