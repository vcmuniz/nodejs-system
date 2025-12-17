import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireNoBusinessProfile } from "../../middlewares/requireNoBusinessProfile";
import JsonWebTokenProvider from "../../infra/auth/JsonWebTokenProvider";
import { ListUserBusinessProfiles } from "../../usercase/business-profile/ListUserBusinessProfiles";
import { SelectBusinessProfile } from "../../usercase/business-profile/SelectBusinessProfile";
import { 
  ListBusinessProfilesController,
  SelectBusinessProfileController,
  SwitchBusinessProfileController
} from "../controllers/business-profile/BusinessProfileControllers";

export const makeBusinessProfileRoutes = (prisma: PrismaClient) => {
  const router = Router();
  const authMiddleware = makeAuthMiddleware();
  const tokenProvider = new JsonWebTokenProvider();

  // Use cases
  const listUserBusinessProfiles = new ListUserBusinessProfiles(prisma);
  const selectBusinessProfile = new SelectBusinessProfile(prisma, tokenProvider);

  // Controllers
  const listController = new ListBusinessProfilesController(listUserBusinessProfiles);
  const selectController = new SelectBusinessProfileController(selectBusinessProfile);
  const switchController = new SwitchBusinessProfileController(selectBusinessProfile);

  // Routes - SOMENTE para quem NÃO tem businessProfileId no token
  router.get(
    "/",
    authMiddleware.authenticate.bind(authMiddleware),
    requireNoBusinessProfile,
    listController.handle.bind(listController)
  );

  router.post(
    "/select",
    authMiddleware.authenticate.bind(authMiddleware),
    requireNoBusinessProfile,
    selectController.handle.bind(selectController)
  );

  // Switch - SOMENTE para quem JÁ tem businessProfileId
  router.post(
    "/switch",
    authMiddleware.authenticate.bind(authMiddleware),
    // Não usa requireNoBusinessProfile pois JÁ precisa ter selecionado uma
    switchController.handle.bind(switchController)
  );

  return router;
};
