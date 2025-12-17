import { Response } from 'express';
import { AuthenticatedRequest } from '../../interfaces/AuthenticatedRequest';
import { makeCreateMessagingInstanceUseCase } from '../../factories/messaging/makeMessagingUseCases';
import { MessagingChannel } from '../../../domain/messaging/MessagingChannel';
import { ENV } from '../../../config/enviroments';

/**
 * @swagger
 * /api/messaging/instance:
 *   post:
 *     tags:
 *       - Messaging (Multi-Channel)
 *     summary: Create a new messaging instance
 *     description: |
 *       Create and connect a new messaging instance for any supported channel.
 *       
 *       **🎉 Fully Automatic Features:**
 *       - ✅ **Credentials are OPTIONAL** - Uses admin-configured credentials automatically
 *       - ✅ **Webhook is AUTOMATIC** - Configured from request URL (no .env needed!)
 *       - ✅ **Idempotent** - Calling multiple times doesn't duplicate
 *       - ✅ **Smart sync** - Auto-detects and recreates if Evolution API lost instance
 *       
 *       **Webhook Configuration:**
 *       The system automatically configures the webhook using the request URL:
 *       - Request to `http://localhost:3000` → Webhook: `http://localhost:3000/api/messaging/webhook/{instanceId}`
 *       - Request to `https://api.yourapp.com` → Webhook: `https://api.yourapp.com/api/messaging/webhook/{instanceId}`
 *       - Works with ngrok, reverse proxies, HTTPS, etc. - **Zero configuration needed!**
 *       
 *       **How it works:**
 *       1. System checks if instance exists in database
 *       2. If exists, verifies if it exists in Evolution API
 *       3. Creates/recreates only if needed
 *       4. Connects and generates QR code
 *       5. Automatically configures webhook from request URL
 *       6. Returns QR code for scanning
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome amigável para identificar a instância (opcional)
 *                 example: 'Loja Principal'
 *               channel:
 *                 $ref: '#/components/schemas/MessagingChannel'
 *               channelInstanceId:
 *                 type: string
 *                 example: 'my-whatsapp-instance'
 *                 description: Unique identifier in the channel (e.g., instance name for WhatsApp)
 *               channelPhoneOrId:
 *                 type: string
 *                 example: '5585999999999'
 *                 description: Phone number for WhatsApp, ID for Telegram, email for Email, etc.
 *               credentials:
 *                 type: object
 *                 example: { "apiToken": "custom-token", "baseUrl": "http://custom-server" }
 *                 description: |
 *                   **OPTIONAL** - Custom credentials for this instance. 
 *                   If not provided, system will use admin-configured credentials automatically.
 *               credentialId:
 *                 type: string
 *                 example: 'cred_evolution_clubfacts_2025'
 *                 description: |
 *                   **OPTIONAL** - Force use of a specific credential by ID.
 *                   If not provided, system will use the first active credential for the channel.
 *             required:
 *               - channel
 *               - channelInstanceId
 *               - channelPhoneOrId
 *           examples:
 *             withoutCredentials:
 *               summary: Create instance without credentials (RECOMMENDED - uses system defaults + auto webhook)
 *               value:
 *                 channel: whatsapp_evolution
 *                 channelInstanceId: my-store
 *                 channelPhoneOrId: '5585999999999'
 *             withCustomCredentials:
 *               summary: Create instance with custom credentials
 *               value:
 *                 channel: whatsapp_evolution
 *                 channelInstanceId: my-store
 *                 channelPhoneOrId: '5585999999999'
 *                 credentials:
 *                   apiToken: custom-token
 *                   baseUrl: http://my-evolution-server:8080
 *             withSpecificCredentialId:
 *               summary: Create instance using specific credential
 *               value:
 *                 channel: whatsapp_evolution
 *                 channelInstanceId: my-store
 *                 channelPhoneOrId: '5585999999999'
 *                 credentialId: cred_evolution_clubfacts_2025
 *     responses:
 *       201:
 *         description: Messaging instance created successfully
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
 *                   example: 'Instância criada com sucesso'
 *                 data:
 *                   type: object
 *                   properties:
 *                     instanceId:
 *                       type: string
 *                       example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
 *                     status:
 *                       type: string
 *                       enum: ['connected', 'disconnected', 'connecting', 'error', 'pending']
 *                       example: 'connecting'
 *                     qrCode:
 *                       type: string
 *                       example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
 *                       description: QR Code em base64 (quando disponível)
 *                     message:
 *                       type: string
 *                       example: 'Instância criada. Escaneie o QR Code no WhatsApp.'
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */
export class CreateMessagingInstanceController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { name, channel, channelInstanceId, channelPhoneOrId, credentials, credentialId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!channel || !channelInstanceId || !channelPhoneOrId) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: channel, channelInstanceId, channelPhoneOrId' 
        });
      }

      // Usar APP_DOMAIN do .env para webhook
      const webhookBaseUrl = ENV.APP_DOMAIN;

      console.log(`[CreateMessagingInstanceController] Webhook base URL: ${webhookBaseUrl}`);

      const useCase = makeCreateMessagingInstanceUseCase();
      const result = await useCase.execute({
        userId,
        name, // Nome amigável (opcional)
        channel: channel as MessagingChannel,
        channelInstanceId,
        channelPhoneOrId,
        credentials, // Agora opcional - se não passar, busca automaticamente
        credentialId, // Opcional - forçar credencial específica
        webhookBaseUrl, // URL base para configurar webhook
      });

      return res.status(201).json({
        success: true,
        message: credentials 
          ? 'Instância criada com credenciais customizadas' 
          : 'Instância criada com credenciais do sistema',
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

export function makeCreateMessagingInstanceController(): CreateMessagingInstanceController {
  return new CreateMessagingInstanceController();
}
