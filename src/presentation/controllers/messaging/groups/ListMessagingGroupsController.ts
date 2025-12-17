import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { ListMessagingGroups } from '../../../../usercase/messaging/groups/ListMessagingGroups';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

/**
 * @swagger
 * /api/messaging/groups:
 *   get:
 *     tags:
 *       - Messaging Groups
 *     summary: List groups
 *     description: |
 *       List all groups for a specific messaging instance.
 *       
 *       **Returns:**
 *       - Custom groups (type: CUSTOM)
 *       - Synced groups from WhatsApp (type: SYNCED_WHATSAPP)
 *       - All groups ordered by creation date
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: instanceId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by messaging instance ID
 *         example: 'abc-123-instance-id'
 *     responses:
 *       200:
 *         description: List of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MessagingGroup'
 *       401:
 *         description: Unauthorized
 */
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
