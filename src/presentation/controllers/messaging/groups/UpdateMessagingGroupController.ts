import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { UpdateMessagingGroup } from '../../../../usercase/messaging/groups/UpdateMessagingGroup';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

/**
 * @swagger
 * /api/messaging/groups/{groupId}:
 *   put:
 *     tags:
 *       - Messaging Groups
 *     summary: Update a custom group
 *     description: |
 *       Update name and description of a custom group.
 *       
 *       **⚠️ Restrictions:**
 *       - Only works for CUSTOM groups
 *       - Synced groups (isSynced: true) cannot be edited
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New group name
 *                 example: 'Clientes Premium VIP'
 *               description:
 *                 type: string
 *                 description: New group description
 *                 example: 'Lista atualizada de clientes premium'
 *     responses:
 *       200:
 *         description: Group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessagingGroup'
 *       400:
 *         description: Cannot edit synced group or invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */
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
