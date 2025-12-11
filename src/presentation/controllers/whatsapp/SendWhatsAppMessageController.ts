// Controller - Apenas orquestra o use case
import { Response } from 'express';
import { SendWhatsAppMessage } from '../../../usercase/whatsapp/SendWhatsAppMessage';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';

export class SendWhatsAppMessageController {
  constructor(private sendWhatsAppMessage: SendWhatsAppMessage) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { instanceName, phoneNumber, message, mediaUrl } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const output = await this.sendWhatsAppMessage.execute({
        userId,
        instanceName,
        phoneNumber,
        message,
        mediaUrl,
      });

      if (!output.success) {
        return res.status(400).json({ error: output.error });
      }

      return res.status(200).json({
        success: true,
        messageId: output.messageId,
        status: output.status,
      });
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        error: 'Erro ao enviar mensagem',
      });
    }
  }
}
