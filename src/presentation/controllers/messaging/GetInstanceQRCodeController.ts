import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { GetInstanceQRCode } from '../../../usercase/messaging/GetInstanceQRCode';
import { makeMessagingRepository } from '../../../infra/database/factories/makeMessagingRepository';
import { MessagingAdapterFactory } from '../../../infra/messaging/MessagingAdapterFactory';

/**
 * @swagger
 * /api/messaging/instance/{instanceId}/qrcode:
 *   get:
 *     tags:
 *       - Messaging (Multi-Channel)
 *     summary: Get fresh QR Code for an instance
 *     description: |
 *       Generates a fresh QR Code for WhatsApp connection.
 *       QR Codes expire in 30-60 seconds, use this endpoint to get a new one.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Instance ID (UUID)
 *     responses:
 *       200:
 *         description: QR Code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     qrCode:
 *                       type: string
 *                       example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
 *                     status:
 *                       type: string
 *                       example: 'connecting'
 *                     message:
 *                       type: string
 *                       example: 'QR Code gerado com sucesso. Escaneie em até 60 segundos.'
 */
export class GetInstanceQRCodeController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { instanceId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!instanceId) {
        return res.status(400).json({ error: 'instanceId é obrigatório' });
      }

      const repository = makeMessagingRepository();
      const adapterFactory = new MessagingAdapterFactory();
      const useCase = new GetInstanceQRCode(repository, adapterFactory);

      const result = await useCase.execute({ userId, instanceId });

      return res.status(200).json({
        success: true,
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

export function makeGetInstanceQRCodeController(): GetInstanceQRCodeController {
  return new GetInstanceQRCodeController();
}
