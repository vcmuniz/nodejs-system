// Routes para Messageria (genérica para todos os canais)
import { Router } from 'express';
import { makeSendMessageController } from '../controllers/messaging/SendMessageController';
import { makeCreateMessagingInstanceController } from '../controllers/messaging/CreateMessagingInstanceController';
import { makeListMessagingInstancesController } from '../controllers/messaging/ListMessagingInstancesController';
import { makeGetInstanceQRCodeController } from '../controllers/messaging/GetInstanceQRCodeController';
import { makeAuthMiddleware } from '../factories/middlewares/makeAuthMiddleware';
import { requireBusinessProfile } from '../../middlewares/requireBusinessProfile';
import { ProcessMessagingWebhook } from '../../usercase/messaging/ProcessMessagingWebhook';
import { makeMessagingRepository } from '../../infra/database/factories/makeMessagingRepository';

/**
 * @swagger
 * tags:
 *   - name: Messaging (Multi-Channel)
 *     description: Generic messaging API supporting multiple channels (WhatsApp, SMS, Email, Telegram, Facebook)
 */

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
 *                     description: Instance data (credentials omitted for security)
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /api/messaging/message/send:
 *   post:
 *     tags:
 *       - Messaging (Multi-Channel)
 *     summary: Send a message
 *     description: Send a message through any supported messaging channel (agnos​tic of channel)
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
 *                 description: Recipient (phone for WhatsApp, ID for Telegram, email for Email, etc.)
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
 *               - remoteJid
 *               - message
 *     responses:
 *       200:
 *         description: Message sent successfully
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
 *                   example: 'Mensagem enviada com sucesso'
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
 *                       description: Internal message ID
 *                     channelMessageId:
 *                       type: string
 *                       example: 'whatsapp-msg-12345'
 *                       description: Message ID generated by the channel provider
 *                     status:
 *                       type: string
 *                       example: 'sent'
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: '2024-01-15T10:30:00Z'
 *       400:
 *         description: Bad request - missing required fields, invalid channel, or instance not found
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */

export const makeMessagingRoutes = () => {
  const router = Router();
  const authMiddleware = makeAuthMiddleware();

  // Listar instâncias de messaging
  router.get(
    '/instances',
    authMiddleware.authenticate(),
    requireBusinessProfile,
    (req, res) => makeListMessagingInstancesController().handle(req, res)
  );

  // Criar nova instância
  router.post(
    '/instance',
    authMiddleware.authenticate(),
    requireBusinessProfile,
    (req, res) => makeCreateMessagingInstanceController().handle(req, res)
  );

  // Enviar mensagem
  router.post(
    '/message/send',
    authMiddleware.authenticate(),
    requireBusinessProfile,
    (req, res) => makeSendMessageController().handle(req, res)
  );

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
  router.get(
    '/instance/:instanceId/qrcode',
    authMiddleware.authenticate(),
    requireBusinessProfile,
    (req, res) => makeGetInstanceQRCodeController().handle(req, res)
  );

  /**
   * @swagger
   * /api/messaging/webhook/{instanceId}:
   *   post:
   *     tags:
   *       - Messaging (Multi-Channel)
   *     summary: Webhook endpoint for messaging events (Auto-configured)
   *     description: |
   *       Receives events from messaging providers (Evolution API, etc).
   *       
   *       **🎉 This webhook is AUTOMATICALLY configured when you create an instance!**
   *       
   *       **How it works:**
   *       1. You create instance via `POST /api/messaging/instance`
   *       2. System automatically configures this webhook URL in Evolution API
   *       3. Evolution API sends events here (messages, connection status, etc)
   *       4. No manual configuration needed - works with any URL (localhost, ngrok, production)
   *       
   *       **Webhook URL format:**
   *       - `{YOUR_API_URL}/api/messaging/webhook/{instanceId}`
   *       - Example: `http://localhost:3000/api/messaging/webhook/my-store`
   *       - Example: `https://api.yourapp.com/api/messaging/webhook/my-store`
   *       
   *       **Events received:**
   *       - `messages.upsert` - New message received
   *       - `connection.update` - Connection status changed
   *       - `qr.updated` - New QR code generated
   *       - `message.sent` - Message sent successfully
   *       - `message.ack` - Message delivery status updated
   *       
   *       **Note:** This endpoint does NOT require authentication (Evolution API calls it)
   *     parameters:
   *       - in: path
   *         name: instanceId
   *         required: true
   *         schema:
   *           type: string
   *         description: Instance identifier
   *         example: my-store
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             description: Webhook payload from messaging provider
   *           examples:
   *             messageReceived:
   *               summary: New message received
   *               value:
   *                 event: messages.upsert
   *                 instance: my-store
   *                 data:
   *                   key:
   *                     remoteJid: "5521999999999@s.whatsapp.net"
   *                     fromMe: false
   *                     id: "BAE5..."
   *                   message:
   *                     conversation: "Hello!"
   *                   messageTimestamp: "1702828800"
   *             connectionUpdate:
   *               summary: Connection status changed
   *               value:
   *                 event: connection.update
   *                 instance: my-store
   *                 data:
   *                   state: open
   *                   statusReason: 200
   *     responses:
   *       200:
   *         description: Webhook received successfully
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
   *                   example: 'Webhook recebido'
   */
  router.post(
    '/webhook/:instanceId',
    async (req, res) => {
      try {
        const { instanceId } = req.params;
        const { event, data } = req.body;

        console.log(`[Webhook] Recebido para instância: ${instanceId}`);
        console.log(`[Webhook] Event: ${event}`);
        console.log(`[Webhook] Data keys:`, Object.keys(data || {}));
        
        // Processar webhook de forma assíncrona
        const repository = makeMessagingRepository();
        const useCase = new ProcessMessagingWebhook(repository);
        
        // Não aguarda para responder rápido à Evolution API
        useCase.execute({ instanceId, event, data }).catch((error) => {
          console.error('[Webhook] Erro ao processar:', error);
        });
        
        res.json({ success: true, message: 'Webhook recebido' });
      } catch (error: any) {
        console.error('[Webhook] Erro:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    }
  );

  return router;
};
