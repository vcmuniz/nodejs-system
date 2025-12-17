import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { DeleteMessagingGroup } from '../../../../usercase/messaging/groups/DeleteMessagingGroup';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

/**
 * @swagger
 * /api/messaging/groups/{groupId}:
 *   delete:
 *     tags:
 *       - Messaging Groups
 *     summary: Delete a custom group
 *     description: |
 *       Delete a custom group and all its members.
 *       
 *       **⚠️ Restrictions:**
 *       - Only works for CUSTOM groups
 *       - Synced groups (isSynced: true) cannot be deleted
 *       - All members are deleted with the group
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
 *     responses:
 *       204:
 *         description: Group deleted successfully
 *       400:
 *         description: Cannot delete synced group
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */
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
