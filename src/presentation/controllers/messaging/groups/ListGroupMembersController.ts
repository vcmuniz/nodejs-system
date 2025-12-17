import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { ListGroupMembers } from '../../../../usercase/messaging/groups/ListGroupMembers';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

/**
 * @swagger
 * /api/messaging/groups/{groupId}/members:
 *   get:
 *     tags:
 *       - Messaging Groups
 *     summary: List group members
 *     description: |
 *       List all active members of a group.
 *       
 *       **Returns:**
 *       - All active members (isActive: true)
 *       - Members ordered by addition date
 *       - Works for both custom and synced groups
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
 *       200:
 *         description: List of members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MessagingGroupMember'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */
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
