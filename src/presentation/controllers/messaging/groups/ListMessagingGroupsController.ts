import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { ListMessagingGroups } from '../../../../usercase/messaging/groups/ListMessagingGroups';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

export class ListMessagingGroupsController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { instanceId } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const repository = makeMessagingGroupRepository();
      const useCase = new ListMessagingGroups(repository);

      const groups = await useCase.execute({
        userId,
        instanceId: instanceId as string,
      });

      return res.json(groups);
    } catch (error: any) {
      console.error('[ListMessagingGroupsController] Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export const makeListMessagingGroupsController = () => new ListMessagingGroupsController();
