// Controller - Criar Instância de Messageria
import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { makeCreateMessagingInstanceUseCase } from '../../factories/messaging/makeMessagingUseCases';
import { MessagingChannel } from '../../../domain/messaging/MessagingChannel';

export class CreateMessagingInstanceController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { channel, channelInstanceId, channelPhoneOrId, credentials } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!channel || !channelInstanceId || !channelPhoneOrId) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: channel, channelInstanceId, channelPhoneOrId' 
        });
      }

      const useCase = makeCreateMessagingInstanceUseCase();
      const result = await useCase.execute({
        userId,
        channel: channel as MessagingChannel,
        channelInstanceId,
        channelPhoneOrId,
        credentials,
      });

      return res.status(201).json({
        success: true,
        message: 'Instância criada com sucesso',
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

export function makeCreateMessagingInstanceController(): CreateMessagingInstanceController {
  return new CreateMessagingInstanceController();
}
