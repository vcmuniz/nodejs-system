import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { makeSendMessageUseCase } from '../../factories/messaging/makeMessagingUseCases';
import { MessagingChannel } from '../../../domain/messaging/MessagingChannel';
import { makeMessagingGroupRepository } from '../../../infra/database/factories/makeMessagingGroupRepository';
import { makeMessagingRepository } from '../../../infra/database/factories/makeMessagingRepository';
import { SendMessageToGroup } from '../../../usercase/messaging/groups/SendMessageToGroup';

/**
 * @swagger
 * /api/messaging/message/send:
 *   post:
 *     tags:
 *       - Messaging (Multi-Channel)
 *     summary: Send a message (individual or group)
 *     description: |
 *       Send a message through any supported messaging channel.
 *       
 *       **Two modes:**
 *       - **Individual**: Use `remoteJid` to send to one recipient
 *       - **Group Broadcast**: Use `groupId` to send to all group members
 *       
 *       **Examples:**
 *       ```json
 *       // Send to individual
 *       {
 *         "channel": "whatsapp_evolution",
 *         "channelInstanceId": "my-instance",
 *         "remoteJid": "5585999999999",
 *         "message": "Hello!"
 *       }
 *       
 *       // Send to group
 *       {
 *         "channel": "whatsapp_evolution",
 *         "channelInstanceId": "my-instance",
 *         "groupId": "group-uuid-123",
 *         "message": "Hello everyone!"
 *       }
 *       ```
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channel:
 *                 $ref: '#/components/schemas/MessagingChannel'
 *               channelInstanceId:
 *                 type: string
 *                 example: 'my-whatsapp-instance'
 *                 description: Instance ID (previously created via POST /api/messaging/instance)
 *               remoteJid:
 *                 type: string
 *                 example: '5585999999999'
 *                 description: Recipient phone/ID/email (for individual message)
 *               groupId:
 *                 type: string
 *                 example: 'group-uuid-123'
 *                 description: Group ID (for broadcast message) - alternative to remoteJid
 *               message:
 *                 type: string
 *                 example: 'Hello! This is a test message.'
 *               mediaUrl:
 *                 type: string
 *                 example: 'https://example.com/image.jpg'
 *                 description: Optional URL to media file
 *               mediaType:
 *                 type: string
 *                 enum: ['image', 'audio', 'document', 'video']
 *                 example: 'image'
 *                 description: Type of media if mediaUrl is provided
 *             required:
 *               - channel
 *               - channelInstanceId
 *               - message
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Individual message response
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: 'Mensagem enviada com sucesso'
 *                     data:
 *                       type: object
 *                       properties:
 *                         messageId:
 *                           type: string
 *                         channelMessageId:
 *                           type: string
 *                         status:
 *                           type: string
 *                 - type: object
 *                   description: Group broadcast response
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: 'Mensagem enviada para o grupo'
 *                     data:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 10
 *                         sent:
 *                           type: number
 *                           example: 9
 *                         failed:
 *                           type: number
 *                           example: 1
 *                         errors:
 *                           type: array
 *                           items:
 *                             type: object
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export class SendMessageController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { channel, channelInstanceId, remoteJid, groupId, message, mediaUrl, mediaType } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!channel || !channelInstanceId || !message) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: channel, channelInstanceId, message' 
        });
      }

      // Valida que tem remoteJid OU groupId
      if (!remoteJid && !groupId) {
        return res.status(400).json({ 
          error: 'É necessário informar remoteJid (individual) ou groupId (grupo)' 
        });
      }

      // Se tem groupId, envia para o grupo
      if (groupId) {
        const groupRepository = makeMessagingGroupRepository();
        const messagingRepository = makeMessagingRepository();
        const sendToGroupUseCase = new SendMessageToGroup(groupRepository, messagingRepository);

        const result = await sendToGroupUseCase.execute({
          groupId,
          userId,
          message,
          mediaUrl,
          mediaType,
        });

        return res.status(200).json({
          success: true,
          message: 'Mensagem enviada para o grupo',
          data: result,
        });
      }

      // Senão, envia individual (comportamento original)
      const useCase = makeSendMessageUseCase();
      const result = await useCase.execute({
        userId,
        channel: channel as MessagingChannel,
        channelInstanceId,
        remoteJid,
        message,
        mediaUrl,
        mediaType,
      });

      return res.status(200).json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export function makeSendMessageController(): SendMessageController {
  return new SendMessageController();
}
