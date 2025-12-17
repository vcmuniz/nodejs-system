import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { CreateMessagingGroup } from '../../../../usercase/messaging/groups/CreateMessagingGroup';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

/**
 * @swagger
 * /api/messaging/groups:
 *   post:
 *     tags:
 *       - Messaging Groups
 *     summary: Create a custom group
 *     description: |
 *       Create a custom group for sending messages to multiple recipients.
 *       
 *       **Features:**
 *       - ✅ Create custom groups for any messaging instance
 *       - ✅ Support multiple identifier types (phone, email, telegram_id)
 *       - ✅ Multi-tenant isolated by businessProfile
 *       - ✅ Manually manage members
 *       
 *       **Note:** Synced groups (from Evolution API) are created automatically via webhook.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - instanceId
 *               - name
 *             properties:
 *               instanceId:
 *                 type: string
 *                 description: Messaging instance ID
 *                 example: 'abc-123-instance-id'
 *               name:
 *                 type: string
 *                 description: Group name
 *                 example: 'Clientes VIP'
 *               description:
 *                 type: string
 *                 description: Group description (optional)
 *                 example: 'Lista de clientes premium'
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessagingGroup'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
export class CreateMessagingGroupController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { instanceId, name, description } = req.body;
      const userId = req.user?.id;
      const businessProfileId = req.businessProfile?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!instanceId || !name) {
        return res.status(400).json({ error: 'instanceId e name são obrigatórios' });
      }

      const repository = makeMessagingGroupRepository();
      const useCase = new CreateMessagingGroup(repository);

      const group = await useCase.execute({
        userId,
        businessProfileId,
        instanceId,
        name,
        description,
      });

      return res.status(201).json(group);
    } catch (error: any) {
      console.error('[CreateMessagingGroupController] Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export const makeCreateMessagingGroupController = () => new CreateMessagingGroupController();
