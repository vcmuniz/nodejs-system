import { Router } from "express";
import { makeCreateInstanceController } from "../factories/whatsapp/makeCreateInstanceController";
import { makeGetInstanceStatusController } from "../factories/whatsapp/makeGetInstanceStatusController";
import { makeListUserInstancesController } from "../factories/whatsapp/makeListUserInstancesController";
import { makeConnectInstanceController } from "../factories/whatsapp/makeConnectInstanceController";
import { makeSendWhatsAppMessageController } from "../factories/whatsapp/makeSendWhatsAppMessageController";
import { makeScheduleWhatsAppMessageController } from "../factories/whatsapp/makeScheduleWhatsAppMessageController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireBusinessProfile } from "../../middlewares/requireBusinessProfile";
import { makeWhatsAppRepository } from "../../infra/database/factories/makeWhatsAppRepository";

/**
 * @swagger
 * tags:
 *   - name: WhatsApp (Deprecated)
 *     description: "⚠️ DEPRECATED - Use 'Messaging (Multi-Channel)' instead. These endpoints are WhatsApp-specific and will be removed in a future version. Migrate to /api/messaging/* for a channel-agnostic approach."
 */

/**
 * @swagger
 * /api/whatsapp/instances:
 *   get:
 *     tags:
 *       - WhatsApp (Deprecated)
 *     deprecated: true
 *     summary: "[DEPRECATED] List WhatsApp instances"
 *     description: "⚠️ DEPRECATED - Use GET /api/messaging/instances instead. This endpoint is specific to WhatsApp and will be removed in a future version."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of WhatsApp instances (legacy response format)
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/whatsapp/instance:
 *   post:
 *     tags:
 *       - WhatsApp (Deprecated)
 *     deprecated: true
 *     summary: "[DEPRECATED] Create WhatsApp instance"
 *     description: "⚠️ DEPRECATED - Use POST /api/messaging/instance with channel='whatsapp' instead. This endpoint creates WhatsApp-specific instances and will be removed in a future version."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Instance created (legacy response format)
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/whatsapp/instance/{instanceName}:
 *   get:
 *     tags:
 *       - WhatsApp (Deprecated)
 *     deprecated: true
 *     summary: "[DEPRECATED] Get WhatsApp instance status"
 *     description: "⚠️ DEPRECATED - Use GET /api/messaging/instances with channel='whatsapp' instead. This endpoint is specific to WhatsApp and will be removed in a future version."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Instance status (legacy response format)
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/whatsapp/instance/{instanceName}/connect:
 *   post:
 *     tags:
 *       - WhatsApp (Deprecated)
 *     deprecated: true
 *     summary: "[DEPRECATED] Connect WhatsApp instance"
 *     description: "⚠️ DEPRECATED - Use POST /api/messaging/instance instead. This endpoint connects WhatsApp instances and will be removed in a future version."
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection initiated (legacy response format)
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/whatsapp/message/send:
 *   post:
 *     tags:
 *       - WhatsApp (Deprecated)
 *     deprecated: true
 *     summary: "[DEPRECATED] Send WhatsApp message"
 *     description: "⚠️ DEPRECATED - Use POST /api/messaging/message/send with channel='whatsapp' instead. This endpoint sends WhatsApp messages and will be removed in a future version."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Message sent (legacy response format)
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/whatsapp/message/schedule:
 *   post:
 *     tags:
 *       - WhatsApp (Deprecated)
 *     deprecated: true
 *     summary: "[DEPRECATED] Schedule WhatsApp message"
 *     description: "⚠️ DEPRECATED - Consider using POST /api/messaging/message/send for channel-agnostic approach. This endpoint schedules WhatsApp messages and will be removed in a future version."
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Message scheduled (legacy response format)
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

export const makeWhatsAppRoutes = () => {
  const router = Router();
  const authMiddleware = makeAuthMiddleware();
  const whatsAppRepository = makeWhatsAppRepository();

  // List user's instances (from local database)
  router.get("/instances", authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeListUserInstancesController().handle(req, res)
  );

  // Create instance
  router.post("/instance", authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeCreateInstanceController().handle(req, res)
  );

  // Get instance status
  router.get("/instance/:instanceName", authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeGetInstanceStatusController().handle(req, res)
  );

  // Connect instance and get QR code
  router.post("/instance/:instanceName/connect", authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeConnectInstanceController().handle(req, res)
  );

  // Send message
  router.post("/message/send", authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeSendWhatsAppMessageController().handle(req, res)
  );

  // Schedule message
  router.post("/message/schedule", authMiddleware.authenticate(), requireBusinessProfile, (req, res) =>
    makeScheduleWhatsAppMessageController().handle(req, res)
  );

  // Webhook for receiving messages and connection updates from Evolution API
  router.post("/webhooks/messages", async (req, res) => {
    try {
      const { event, instance, data } = req.body;
      
      console.log("WhatsApp Webhook received:", { event, instance, data });
      
      switch (event) {
        case "messages.upsert":
          console.log("Message received:", data);
          break;
        case "messages.update":
          console.log("Message status updated:", data);
          break;
        case "connection.update":
          console.log("Connection status changed:", data);
          if (data?.connection === "open" && instance) {
            // Conexão estabelecida
            await whatsAppRepository.updateInstanceStatus(instance, 'connected');
          } else if (data?.connection === "close" && instance) {
            // Conexão fechada
            await whatsAppRepository.updateInstanceStatus(instance, 'disconnected');
          }
          break;
        case "qr.updated":
          console.log("QR code updated:", data);
          if (instance && data?.code) {
            // Persiste o novo QR code
            await whatsAppRepository.updateInstanceQrCode(instance, data.code);
          }
          break;
        default:
          console.log("Unknown event:", event);
      }
      
      res.json({ success: true, message: "Webhook processed" });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ success: false, error: "Failed to process webhook" });
    }
  });

  return router;
};
