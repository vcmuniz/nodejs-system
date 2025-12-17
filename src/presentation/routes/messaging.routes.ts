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
import { makeCreateMessagingGroupController } from '../controllers/messaging/groups/CreateMessagingGroupController';
import { makeListMessagingGroupsController } from '../controllers/messaging/groups/ListMessagingGroupsController';
import { makeUpdateMessagingGroupController } from '../controllers/messaging/groups/UpdateMessagingGroupController';
import { makeDeleteMessagingGroupController } from '../controllers/messaging/groups/DeleteMessagingGroupController';
import { makeAddGroupMemberController } from '../controllers/messaging/groups/AddGroupMemberController';
import { makeRemoveGroupMemberController } from '../controllers/messaging/groups/RemoveGroupMemberController';
import { makeListGroupMembersController } from '../controllers/messaging/groups/ListGroupMembersController';
import { makeSendMessageToGroupController } from '../controllers/messaging/groups/SendMessageToGroupController';
import { makeSyncGroupsController } from '../controllers/messaging/groups/SyncGroupsController';

/**
 * @swagger
 * tags:
 *   - name: Messaging (Multi-Channel)
 *     description: Generic messaging API supporting multiple channels (WhatsApp, SMS, Email, Telegram, Facebook)
 */

export const makeMessagingRoutes = () => {
  const router = Router();
  const authMiddleware = makeAuthMiddleware();

  router.get('/instances', authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    makeListMessagingInstancesController().handle(req, res)
  );

  router.post('/instance', authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    makeCreateMessagingInstanceController().handle(req, res)
  );

  router.post('/message/send', authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    makeSendMessageController().handle(req, res)
  );

  router.get('/instance/:instanceId/qrcode', authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    makeGetInstanceQRCodeController().handle(req, res)
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

  // GRUPOS DE ENVIO
  router.post('/groups', authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeCreateMessagingGroupController().handle(req, res)
  );

  router.get('/groups', authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeListMessagingGroupsController().handle(req, res)
  );

  router.put('/groups/:groupId', authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeUpdateMessagingGroupController().handle(req, res)
  );

  router.delete('/groups/:groupId', authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeDeleteMessagingGroupController().handle(req, res)
  );

  // MEMBROS DO GRUPO
  router.post('/groups/:groupId/members', authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeAddGroupMemberController().handle(req, res)
  );

  router.delete('/groups/:groupId/members/:identifier', authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeRemoveGroupMemberController().handle(req, res)
  );

  router.get('/groups/:groupId/members', authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeListGroupMembersController().handle(req, res)
  );

  // ENVIO PARA GRUPO
  router.post('/groups/:groupId/send', authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeSendMessageToGroupController().handle(req, res)
  );

  // SINCRONIZAÇÃO DE GRUPOS
  router.post('/groups/sync/:instanceId', authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeSyncGroupsController().handle(req, res)
  );

  return router;
};
