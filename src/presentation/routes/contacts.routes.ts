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

  router.post("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new CreateContactController(createContact).handle(req, res)
  );

  router.get("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new ListContactsController(listContacts).handle(req, res)
  );

  router.get("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new GetContactController(getContact).handle(req, res)
  );

  router.put("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new UpdateContactController(updateContact).handle(req, res)
  );

  router.delete("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new DeleteContactController(deleteContact).handle(req, res)
  );

  router.post("/:id/convert", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => 
    new ConvertLeadController(convertLead).handle(req, res)
  );

  return router;
}
