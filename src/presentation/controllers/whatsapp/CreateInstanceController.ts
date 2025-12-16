// Controller - Apenas orquestra o use case
import { Response } from 'express';
import { CreateInstance } from '../../../usercase/whatsapp/CreateInstance';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';

/**
 * @swagger
 * /api/whatsapp/instance:
 *   post:
 *     summary: Create WhatsApp instance
 *     description: Create a new WhatsApp instance. The webhook URL is automatically generated based on the instance name.
 *     tags:
 *       - WhatsApp
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               instanceName:
 *                 type: string
 *                 example: "my-instance"
 *               number:
 *                 type: string
 *                 description: WhatsApp phone number (optional, can be added later via QR code)
 *                 example: "5511999999999"
 *             required:
 *               - instanceName
 *     responses:
 *       201:
 *         description: Instance created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WhatsAppInstance'
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export class CreateInstanceController {
  constructor(private createInstance: CreateInstance) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { instanceName, number } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!instanceName) {
        return res.status(400).json({ error: 'instanceName é obrigatório' });
      }

      // Gerar webhook URL dinamicamente baseado no instanceName
      const webhookUrl = `${process.env.API_URL || 'http://localhost:3000'}/api/whatsapp/webhooks/messages?instance=${instanceName}`;

      const output = await this.createInstance.execute({
        userId,
        instanceName,
        number,
        webhookUrl,
      });

      if (!output.success) {
        return res.status(400).json({ error: output.error });
      }

      return res.status(201).json(output.data);
    } catch (error) {
      console.error('Erro no controller:', error);
      return res.status(500).json({
        error: `Erro ao criar instância: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
    }
  }
}
