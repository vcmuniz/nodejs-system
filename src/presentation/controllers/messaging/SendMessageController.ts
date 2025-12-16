// Controller - Enviar Mensagem
import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { makeSendMessageUseCase } from '../../factories/messaging/makeMessagingUseCases';
import { MessagingChannel } from '../../../domain/messaging/MessagingChannel';

export class SendMessageController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { channel, channelInstanceId, remoteJid, message, mediaUrl, mediaType } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!channel || !channelInstanceId || !remoteJid || !message) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: channel, channelInstanceId, remoteJid, message' 
        });
      }

      const useCase = makeSendMessageUseCase();
      const result = await useCase.execute({
        userId,
        channel: channel as MessagingChannel,
        channelInstanceId,
        remoteJid,
        message,
        mediaUrl,
        mediaType,
      });

      return res.status(200).json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export function makeSendMessageController(): SendMessageController {
  return new SendMessageController();
}
