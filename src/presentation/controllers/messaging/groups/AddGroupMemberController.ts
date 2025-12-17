import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { AddGroupMember } from '../../../../usercase/messaging/groups/AddGroupMember';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';

/**
 * @swagger
 * /api/messaging/groups/{groupId}/members:
 *   post:
 *     tags:
 *       - Messaging Groups
 *     summary: Add member to group
 *     description: |
 *       Add a member to a custom group.
 *       
 *       **Supported identifier types:**
 *       - `phone` - Phone number (WhatsApp, SMS)
 *       - `email` - Email address
 *       - `telegram_id` - Telegram user ID
 *       - `custom` - Custom identifier
 *       
 *       **⚠️ Restrictions:**
 *       - Only works for CUSTOM groups
 *       - Synced groups members are managed automatically
 *       - Duplicate identifiers are not allowed
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
 *             required:
 *               - identifier
 *               - identifierType
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Member identifier (phone, email, etc)
 *                 example: '5521999999999'
 *               identifierType:
 *                 type: string
 *                 enum: [phone, email, telegram_id, custom]
 *                 description: Type of identifier
 *                 example: 'phone'
 *               name:
 *                 type: string
 *                 description: Member name (optional)
 *                 example: 'João Silva'
 *               metadata:
 *                 type: object
 *                 description: Additional metadata (optional)
 *     responses:
 *       201:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessagingGroupMember'
 *       400:
 *         description: Cannot add member to synced group or duplicate member
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */
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
