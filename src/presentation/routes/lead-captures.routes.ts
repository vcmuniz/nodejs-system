import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
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

  router.post("/", authMiddleware.authenticate(), (req, res) => 
    new CreateLeadCaptureController(createLeadCapture).handle(req, res)
  );

  router.get("/", authMiddleware.authenticate(), (req, res) => 
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

  router.get("/:slug", (req, res) => 
    new GetLeadCapturePublicController(getLeadCapture).handle(req, res)
  );

  router.post("/:slug", (req, res) => 
    new CaptureLeadController(captureLead).handle(req, res)
  );

  return router;
}
