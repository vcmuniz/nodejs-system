import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireBusinessProfile } from "../../middlewares/requireBusinessProfile";
import { PrismaLeadCaptureRepository } from "../../infra/database/factories/repositories/prisma/PrismaLeadCaptureRepository";
import { PrismaContactRepository } from "../../infra/database/factories/repositories/prisma/PrismaContactRepository";
import { PrismaContactActivityRepository } from "../../infra/database/factories/repositories/prisma/PrismaContactActivityRepository";
import { CreateLeadCapture } from "../../usercase/lead-captures/CreateLeadCapture";
import { ListLeadCaptures } from "../../usercase/lead-captures/ListLeadCaptures";
import { GetLeadCapture } from "../../usercase/lead-captures/GetLeadCapture";
import { CaptureLead } from "../../usercase/lead-captures/CaptureLead";
import {
  CreateLeadCaptureController,
  ListLeadCapturesController,
  GetLeadCapturePublicController,
  CaptureLeadController
} from "../controllers/lead-captures/LeadCaptureControllers";

/**
 * @swagger
 * tags:
 *   name: Lead Captures
 *   description: Lead capture form management (requires businessProfileId in token)
 */

/**
 * @swagger
 * tags:
 *   name: Public Lead Capture
 *   description: Public endpoints for lead capture forms (no authentication required)
 */

export function makeLeadCaptureRoutes(prisma: PrismaClient) {
  const router = Router();
  const authMiddleware = makeAuthMiddleware();
  
  const leadCaptureRepository = new PrismaLeadCaptureRepository(prisma);
  const contactRepository = new PrismaContactRepository(prisma);
  const activityRepository = new PrismaContactActivityRepository(prisma);

  const createLeadCapture = new CreateLeadCapture(leadCaptureRepository);
  const listLeadCaptures = new ListLeadCaptures(leadCaptureRepository);
  const getLeadCapture = new GetLeadCapture(leadCaptureRepository);
  const captureLead = new CaptureLead(leadCaptureRepository, contactRepository, activityRepository);

  /**
   * @swagger
   * /api/lead-captures:
   *   post:
   *     summary: Create a new lead capture form
   *     tags: [Lead Captures]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - title
   *               - slug
   *               - fields
   *               - requiredFields
   *               - successMessage
   *             properties:
   *               name:
   *                 type: string
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               slug:
   *                 type: string
   *               fields:
   *                 type: array
   *                 items:
   *                   type: string
   *               requiredFields:
   *                 type: array
   *                 items:
   *                   type: string
   *               submitButtonText:
   *                 type: string
   *               successMessage:
   *                 type: string
   *               redirectUrl:
   *                 type: string
   *               webhookUrl:
   *                 type: string
   *               notifyEmail:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Lead capture form created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LeadCapture'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: No businessProfileId in token
   */
  router.post("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new CreateLeadCaptureController(createLeadCapture).handle(req, res)
  );

  /**
   * @swagger
   * /api/lead-captures:
   *   get:
   *     summary: List all lead capture forms
   *     tags: [Lead Captures]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of lead capture forms
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/LeadCapture'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: No businessProfileId in token
   */
  router.get("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new ListLeadCapturesController(listLeadCaptures).handle(req, res)
  );

  return router;
}

export function makePublicLeadRoutes(prisma: PrismaClient) {
  const router = Router();
  
  const leadCaptureRepository = new PrismaLeadCaptureRepository(prisma);
  const contactRepository = new PrismaContactRepository(prisma);
  const activityRepository = new PrismaContactActivityRepository(prisma);

  const getLeadCapture = new GetLeadCapture(leadCaptureRepository);
  const captureLead = new CaptureLead(leadCaptureRepository, contactRepository, activityRepository);

  /**
   * @swagger
   * /api/public/lead/{slug}:
   *   get:
   *     summary: Get lead capture form by slug (public)
   *     tags: [Public Lead Capture]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lead capture form details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LeadCapture'
   *       404:
   *         description: Lead capture form not found
   */
  router.get("/:slug", (req, res) => 
    new GetLeadCapturePublicController(getLeadCapture).handle(req, res)
  );

  /**
   * @swagger
   * /api/public/lead/{slug}:
   *   post:
   *     summary: Submit a lead capture form (public)
   *     tags: [Public Lead Capture]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               customFields:
   *                 type: object
   *     responses:
   *       200:
   *         description: Lead captured successfully
   *       400:
   *         description: Validation error
   *       404:
   *         description: Lead capture form not found
   */
  router.post("/:slug", (req, res) => 
    new CaptureLeadController(captureLead).handle(req, res)
  );

  return router;
}
