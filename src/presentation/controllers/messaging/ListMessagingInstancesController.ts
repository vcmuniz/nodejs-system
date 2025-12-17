import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { makeListMessagingInstancesUseCase } from '../../factories/messaging/makeMessagingUseCases';
import { MessagingChannel } from '../../../domain/messaging/MessagingChannel';

/**
 * @swagger
 * /api/messaging/instances:
 *   get:
 *     tags:
 *       - Messaging (Multi-Channel)
 *     summary: List messaging instances
 *     description: |
 *       List all messaging instances for the authenticated user, optionally filtered by channel.
 *       
 *       **Note:** QR codes and credentials are NOT included in the list response (performance and security).
 *       To get the QR code of a specific instance, create/reconnect via `POST /api/messaging/instance`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: channel
 *         schema:
 *           $ref: '#/components/schemas/MessagingChannel'
 *         description: Optional filter by channel (whatsapp_evolution, whatsapp_oficial, sms, email, telegram, facebook)
 *     responses:
 *       200:
 *         description: List of messaging instances retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Instâncias listadas com sucesso'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
 *                       userId:
 *                         type: string
 *                         example: 'user-123'
 *                       name:
 *                         type: string
 *                         example: 'Loja Principal'
 *                         description: Nome amigável da instância (opcional)
 *                       channel:
 *                         type: string
 *                         example: 'whatsapp_evolution'
 *                       channelInstanceId:
 *                         type: string
 *                         example: 'my-store'
 *                       channelPhoneOrId:
 *                         type: string
 *                         example: '5585999999999'
 *                       status:
 *                         type: string
 *                         enum: ['connected', 'disconnected', 'connecting', 'error', 'pending']
 *                         example: 'connected'
 *                       credentialId:
 *                         type: string
 *                         example: 'cred_evolution_clubfacts_2025'
 *                       metadata:
 *                         type: object
 *                         example: {}
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */
export class ListMessagingInstancesController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { channel } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const useCase = makeListMessagingInstancesUseCase();
      const instances = await useCase.execute({
        userId,
        channel: channel as MessagingChannel | undefined,
      });

      return res.status(200).json({
        success: true,
        message: 'Instâncias listadas com sucesso',
        data: instances,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export function makeListMessagingInstancesController(): ListMessagingInstancesController {
  return new ListMessagingInstancesController();
}
