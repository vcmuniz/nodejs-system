// Controller - Listar Instâncias de Messageria
import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { makeListMessagingInstancesUseCase } from '../../factories/messaging/makeMessagingUseCases';
import { MessagingChannel } from '../../../domain/messaging/MessagingChannel';

export class ListMessagingInstancesController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { channel } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const useCase = makeListMessagingInstancesUseCase();
      const instances = await useCase.execute({
        userId,
        channel: channel as MessagingChannel | undefined,
      });

      return res.status(200).json({
        success: true,
        message: 'Instâncias listadas com sucesso',
        data: instances,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export function makeListMessagingInstancesController(): ListMessagingInstancesController {
  return new ListMessagingInstancesController();
}
