// Controller - Agendar envio de mensagem
import { Response } from 'express';
import { ScheduleWhatsAppMessage } from '../../../usercase/whatsapp/ScheduleWhatsAppMessage';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';

export class ScheduleWhatsAppMessageController {
  constructor(private scheduleWhatsAppMessage: ScheduleWhatsAppMessage) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { instanceName, phoneNumber, message, scheduledFor, mediaUrl } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!scheduledFor) {
        return res.status(400).json({ error: 'scheduledFor é obrigatório (ISO 8601)' });
      }

      const scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ error: 'scheduledFor deve ser uma data válida' });
      }

      const output = await this.scheduleWhatsAppMessage.execute({
        userId,
        instanceName,
        phoneNumber,
        message,
        scheduledFor: scheduledDate,
        mediaUrl,
      });

      if (!output.success) {
        return res.status(400).json({ error: output.error });
      }

      return res.status(202).json({
        success: true,
        scheduleId: output.scheduleId,
        scheduledFor: output.scheduledFor,
        message: 'Mensagem agendada com sucesso',
      });
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        error: 'Erro ao agendar mensagem',
      });
    }
  }
}
