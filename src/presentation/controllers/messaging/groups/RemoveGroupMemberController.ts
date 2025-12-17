import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { RemoveGroupMember } from '../../../../usercase/messaging/groups/RemoveGroupMember';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

export class RemoveGroupMemberController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { groupId, identifier } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const repository = makeMessagingGroupRepository();
      const useCase = new RemoveGroupMember(repository);

      await useCase.execute({ groupId, userId, identifier });

      return res.status(204).send();
    } catch (error: any) {
      console.error('[RemoveGroupMemberController] Error:', error);
      return res.status(400).json({ error: error.message });
    }
  }
}

export const makeRemoveGroupMemberController = () => new RemoveGroupMemberController();
