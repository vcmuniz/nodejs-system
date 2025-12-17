import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { ListGroupMembers } from '../../../../usercase/messaging/groups/ListGroupMembers';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

export class ListGroupMembersController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { groupId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const repository = makeMessagingGroupRepository();
      const useCase = new ListGroupMembers(repository);

      const members = await useCase.execute({ groupId, userId });

      return res.json(members);
    } catch (error: any) {
      console.error('[ListGroupMembersController] Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export const makeListGroupMembersController = () => new ListGroupMembersController();
