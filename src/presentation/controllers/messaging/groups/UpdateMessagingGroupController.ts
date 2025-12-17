import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { UpdateMessagingGroup } from '../../../../usercase/messaging/groups/UpdateMessagingGroup';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

export class UpdateMessagingGroupController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { groupId } = req.params;
      const { name, description } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const repository = makeMessagingGroupRepository();
      const useCase = new UpdateMessagingGroup(repository);

      const group = await useCase.execute({
        groupId,
        userId,
        name,
        description,
      });

      return res.json(group);
    } catch (error: any) {
      console.error('[UpdateMessagingGroupController] Error:', error);
      return res.status(400).json({ error: error.message });
    }
  }
}

export const makeUpdateMessagingGroupController = () => new UpdateMessagingGroupController();
