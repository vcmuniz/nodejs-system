import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireBusinessProfile } from "../../middlewares/requireBusinessProfile";
import { PrismaContactRepository } from "../../infra/database/factories/repositories/prisma/PrismaContactRepository";
import { PrismaContactActivityRepository } from "../../infra/database/factories/repositories/prisma/PrismaContactActivityRepository";
import { CreateContact } from "../../usercase/contacts/CreateContact";
import { ListContacts } from "../../usercase/contacts/ListContacts";
import { GetContact } from "../../usercase/contacts/GetContact";
import { UpdateContact } from "../../usercase/contacts/UpdateContact";
import { DeleteContact } from "../../usercase/contacts/DeleteContact";
import { ConvertLeadToContact } from "../../usercase/contacts/ConvertLeadToContact";
import { CreateContactController } from "../controllers/contacts/CreateContactController";
import {
  ListContactsController,
  GetContactController,
  UpdateContactController,
  DeleteContactController,
  ConvertLeadController
} from "../controllers/contacts/ContactControllers";

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Contact management endpoints (requires businessProfileId in token)
 */

export function makeContactRoutes(prisma: PrismaClient) {
  const router = Router();
  const authMiddleware = makeAuthMiddleware();
  
  const contactRepository = new PrismaContactRepository(prisma);
  const activityRepository = new PrismaContactActivityRepository(prisma);

  const createContact = new CreateContact(contactRepository, activityRepository);
  const listContacts = new ListContacts(contactRepository);
  const getContact = new GetContact(contactRepository);
  const updateContact = new UpdateContact(contactRepository);
  const deleteContact = new DeleteContact(contactRepository);
  const convertLead = new ConvertLeadToContact(contactRepository, activityRepository);

  /**
   * @swagger
   * /api/contacts:
   *   post:
   *     summary: Create a new contact
   *     tags: [Contacts]
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
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               cpf:
   *                 type: string
   *               company:
   *                 type: string
   *               position:
   *                 type: string
   *               website:
   *                 type: string
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *               customFields:
   *                 type: object
   *               isLead:
   *                 type: boolean
   *               leadScore:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Contact created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Contact'
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *       403:
   *         description: Forbidden - No businessProfileId in token
   */
  router.post("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new CreateContactController(createContact).handle(req, res)
  );

  /**
   * @swagger
   * /api/contacts:
   *   get:
   *     summary: List all contacts for the business profile
   *     tags: [Contacts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *       - in: query
   *         name: isLead
   *         schema:
   *           type: boolean
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, inactive, blocked]
   *     responses:
   *       200:
   *         description: List of contacts
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 contacts:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Contact'
   *                 total:
   *                   type: integer
   *                 page:
   *                   type: integer
   *                 limit:
   *                   type: integer
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: No businessProfileId in token
   */
  router.get("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new ListContactsController(listContacts).handle(req, res)
  );

  /**
   * @swagger
   * /api/contacts/{id}:
   *   get:
   *     summary: Get a specific contact by ID
   *     tags: [Contacts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Contact details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Contact'
   *       404:
   *         description: Contact not found
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: No businessProfileId in token
   */
  router.get("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new GetContactController(getContact).handle(req, res)
  );

  /**
   * @swagger
   * /api/contacts/{id}:
   *   put:
   *     summary: Update a contact
   *     tags: [Contacts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
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
   *               cpf:
   *                 type: string
   *               company:
   *                 type: string
   *               position:
   *                 type: string
   *               website:
   *                 type: string
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *               customFields:
   *                 type: object
   *               leadScore:
   *                 type: integer
   *               status:
   *                 type: string
   *                 enum: [active, inactive, blocked]
   *     responses:
   *       200:
   *         description: Contact updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Contact'
   *       404:
   *         description: Contact not found
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: No businessProfileId in token
   */
  router.put("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new UpdateContactController(updateContact).handle(req, res)
  );

  /**
   * @swagger
   * /api/contacts/{id}:
   *   delete:
   *     summary: Delete a contact
   *     tags: [Contacts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Contact deleted successfully
   *       404:
   *         description: Contact not found
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: No businessProfileId in token
   */
  router.delete("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new DeleteContactController(deleteContact).handle(req, res)
  );

  /**
   * @swagger
   * /api/contacts/{id}/convert:
   *   post:
   *     summary: Convert a lead to contact
   *     tags: [Contacts]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lead converted to contact successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Contact'
   *       404:
   *         description: Lead not found
   *       400:
   *         description: Contact is not a lead
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: No businessProfileId in token
   */
  router.post("/:id/convert", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new ConvertLeadController(convertLead).handle(req, res)
  );

  return router;
}
