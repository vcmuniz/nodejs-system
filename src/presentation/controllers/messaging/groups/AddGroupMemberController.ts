import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { AddGroupMember } from '../../../../usercase/messaging/groups/AddGroupMember';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

export class AddGroupMemberController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { groupId } = req.params;
      const { identifier, identifierType, name, metadata } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!identifier || !identifierType) {
        return res.status(400).json({ error: 'identifier e identifierType são obrigatórios' });
      }

      const repository = makeMessagingGroupRepository();
      const useCase = new AddGroupMember(repository);

      const member = await useCase.execute({
        groupId,
        userId,
        identifier,
        identifierType,
        name,
        metadata,
      });

      return res.status(201).json(member);
    } catch (error: any) {
      console.error('[AddGroupMemberController] Error:', error);
      return res.status(400).json({ error: error.message });
    }
  }
}

export const makeAddGroupMemberController = () => new AddGroupMemberController();
