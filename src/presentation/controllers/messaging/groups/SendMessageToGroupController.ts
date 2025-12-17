import { Response } from 'express';
import { AuthenticatedRequest } from '../../../interfaces/AuthenticatedRequest';
import { SendMessageToGroup } from '../../../../usercase/messaging/groups/SendMessageToGroup';
import { makeMessagingGroupRepository } from '../../../../infra/database/factories/makeMessagingGroupRepository';
import { makeMessagingRepository } from '../../../../infra/database/factories/makeMessagingRepository';

/**
 * @swagger
 * /api/messaging/groups/{groupId}/send:
 *   post:
 *     tags:
 *       - Messaging Groups
 *     summary: Send message to group
 *     description: |
 *       Send a message to all active members of a group.
 *       
 *       **Features:**
 *       - ✅ Sends to all active members
 *       - ✅ Works with custom and synced groups
 *       - ✅ Supports text and media messages
 *       - ✅ Returns statistics (total, sent, failed)
 *       - ✅ Errors don't block other members
 *       
 *       **Use cases:**
 *       - Broadcast promotions
 *       - Send announcements
 *       - Mass notifications
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
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message text
 *                 example: 'Olá! Confira nossa promoção especial!'
 *               mediaUrl:
 *                 type: string
 *                 description: Media URL (optional)
 *                 example: 'https://example.com/promo.jpg'
 *               mediaType:
 *                 type: string
 *                 enum: [image, video, audio, document]
 *                 description: Media type (optional)
 *                 example: 'image'
 *     responses:
 *       200:
 *         description: Message sent with statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                   description: Total members
 *                   example: 10
 *                 sent:
 *                   type: number
 *                   description: Successfully sent
 *                   example: 9
 *                 failed:
 *                   type: number
 *                   description: Failed to send
 *                   example: 1
 *                 errors:
 *                   type: array
 *                   description: List of errors
 *                   items:
 *                     type: object
 *                     properties:
 *                       identifier:
 *                         type: string
 *                         example: '5521888888888'
 *                       error:
 *                         type: string
 *                         example: 'Invalid number'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */
export class SendMessageToGroupController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { groupId } = req.params;
      const { message, mediaUrl, mediaType } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!message) {
        return res.status(400).json({ error: 'message é obrigatório' });
      }

      const groupRepository = makeMessagingGroupRepository();
      const messagingRepository = makeMessagingRepository();
      const useCase = new SendMessageToGroup(groupRepository, messagingRepository);

      const result = await useCase.execute({
        groupId,
        userId,
        message,
        mediaUrl,
        mediaType,
      });

      return res.json(result);
    } catch (error: any) {
      console.error('[SendMessageToGroupController] Error:', error);
      return res.status(400).json({ error: error.message });
    }
  }
}

export const makeSendMessageToGroupController = () => new SendMessageToGroupController();
