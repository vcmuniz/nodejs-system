// Routes para Messageria (genérica para todos os canais)
import { Router } from 'express';
import { makeSendMessageController } from '../controllers/messaging/SendMessageController';
import { makeCreateMessagingInstanceController } from '../controllers/messaging/CreateMessagingInstanceController';
import { makeListMessagingInstancesController } from '../controllers/messaging/ListMessagingInstancesController';
import { makeAuthMiddleware } from '../factories/middlewares/makeAuthMiddleware';

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
 *     description: List all messaging instances for the authenticated user, optionally filtered by channel
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
 *                     $ref: '#/components/schemas/MessagingInstanceData'
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
 *       **Credentials are now OPTIONAL!**
 *       
 *       If you don't pass credentials, the system will automatically use the credentials 
 *       configured by the administrator for that channel type.
 *       
 *       You can also optionally specify a `credentialId` to use a specific credential.
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
 *               summary: Create instance without credentials (uses system defaults)
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
 *                       example: 'data:image/png;base64,...'
 *                       description: QR code for channels that require it (e.g., WhatsApp)
 *                     message:
 *                       type: string
 *                       example: 'Escaneie o QR code'
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
    (req, res) => makeListMessagingInstancesController().handle(req, res)
  );

  // Criar nova instância
  router.post(
    '/instance',
    authMiddleware.authenticate(),
    (req, res) => makeCreateMessagingInstanceController().handle(req, res)
  );

  // Enviar mensagem
  router.post(
    '/message/send',
    authMiddleware.authenticate(),
    (req, res) => makeSendMessageController().handle(req, res)
  );

  return router;
};
