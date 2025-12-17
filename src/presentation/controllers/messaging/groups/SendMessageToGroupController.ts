import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { SendMessageToGroup } from '../../../../usercase/messaging/groups/SendMessageToGroup';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';
import { makeMessagingRepository } from '../../../../infra/database/factories/makeMessagingRepository';

export class SendMessageToGroupController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { groupId } = req.params;
      const { message, mediaUrl, mediaType } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!message) {
        return res.status(400).json({ error: 'message é obrigatório' });
      }

      const groupRepository = makeMessagingGroupRepository();
      const messagingRepository = makeMessagingRepository();
      const useCase = new SendMessageToGroup(groupRepository, messagingRepository);

      const result = await useCase.execute({
        groupId,
        userId,
        message,
        mediaUrl,
        mediaType,
      });

      return res.json(result);
    } catch (error: any) {
      console.error('[SendMessageToGroupController] Error:', error);
      return res.status(400).json({ error: error.message });
    }
  }
}

export const makeSendMessageToGroupController = () => new SendMessageToGroupController();
