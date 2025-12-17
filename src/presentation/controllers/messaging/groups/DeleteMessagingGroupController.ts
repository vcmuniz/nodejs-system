import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { DeleteMessagingGroup } from '../../../../usercase/messaging/groups/DeleteMessagingGroup';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

export class DeleteMessagingGroupController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { groupId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const repository = makeMessagingGroupRepository();
      const useCase = new DeleteMessagingGroup(repository);

      await useCase.execute({ groupId, userId });

      return res.status(204).send();
    } catch (error: any) {
      console.error('[DeleteMessagingGroupController] Error:', error);
      return res.status(400).json({ error: error.message });
    }
  }
}

export const makeDeleteMessagingGroupController = () => new DeleteMessagingGroupController();
