import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { RemoveGroupMember } from '../../../../usercase/messaging/groups/RemoveGroupMember';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

/**
 * @swagger
 * /api/messaging/groups/{groupId}/members/{identifier}:
 *   delete:
 *     tags:
 *       - Messaging Groups
 *     summary: Remove member from group
 *     description: |
 *       Remove a member from a custom group by identifier.
 *       
 *       **⚠️ Restrictions:**
 *       - Only works for CUSTOM groups
 *       - Synced groups members are managed automatically
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *         example: 'group-uuid-123'
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Member identifier (phone, email, etc)
 *         example: '5521999999999'
 *     responses:
 *       204:
 *         description: Member removed successfully
 *       400:
 *         description: Cannot remove member from synced group
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group or member not found
 */
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
