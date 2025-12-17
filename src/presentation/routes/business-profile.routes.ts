import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireNoBusinessProfile } from "../../middlewares/requireNoBusinessProfile";
import JsonWebTokenProvider from "../../infra/auth/JsonWebTokenProvider";
import { ListUserBusinessProfiles } from "../../usercase/business-profile/ListUserBusinessProfiles";
import { SelectBusinessProfile } from "../../usercase/business-profile/SelectBusinessProfile";
import { CreateBusinessProfile } from "../../usercase/business-profile/CreateBusinessProfile";
import { 
  ListBusinessProfilesController,
  SelectBusinessProfileController,
  SwitchBusinessProfileController,
  CreateBusinessProfileController
} from "../controllers/business-profile/BusinessProfileControllers";

/**
 * @swagger
 * tags:
 *   name: Business Profiles
 *   description: Business profile selection and management (multi-tenant)
 */

export const makeBusinessProfileRoutes = (prisma: PrismaClient) => {
  const router = Router();
  const authMiddleware = makeAuthMiddleware();
  const tokenProvider = new JsonWebTokenProvider();

  // Use cases
  const listUserBusinessProfiles = new ListUserBusinessProfiles(prisma);
  const selectBusinessProfile = new SelectBusinessProfile(prisma, tokenProvider);
  const createBusinessProfile = new CreateBusinessProfile(prisma, tokenProvider);

  // Controllers
  const listController = new ListBusinessProfilesController(listUserBusinessProfiles);
  const selectController = new SelectBusinessProfileController(selectBusinessProfile);
  const switchController = new SwitchBusinessProfileController(selectBusinessProfile);
  const createController = new CreateBusinessProfileController(createBusinessProfile);

  /**
   * @swagger
   * /api/business-profiles:
   *   get:
   *     summary: List user's business profiles
   *     description: Returns all business profiles that the authenticated user has access to. Requires token WITHOUT businessProfileId.
   *     tags: [Business Profiles]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of business profiles
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                   name:
   *                     type: string
   *                   email:
   *                     type: string
   *                   phone:
   *                     type: string
   *                   createdAt:
   *                     type: string
   *                     format: date-time
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Token already has businessProfileId - use /switch instead
   */
  router.get(
    "/",
    authMiddleware.authenticate.bind(authMiddleware),
    requireNoBusinessProfile,
    listController.handle.bind(listController)
  );

  /**
   * @swagger
   * /api/business-profiles/create:
   *   post:
   *     summary: Create a new business profile
   *     description: Creates a new organization and returns a token WITH businessProfileId
   *     tags: [Business Profiles]
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
   *               website:
   *                 type: string
   *               address:
   *                 type: string
   *     responses:
   *       201:
   *         description: Business profile created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 businessProfile:
   *                   type: object
   *                 token:
   *                   type: string
   *                   description: New JWT token with businessProfileId
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Token already has businessProfileId
   */
  router.post(
    "/create",
    authMiddleware.authenticate.bind(authMiddleware),
    requireNoBusinessProfile,
    createController.handle.bind(createController)
  );

  /**
   * @swagger
   * /api/business-profiles/select:
   *   post:
   *     summary: Select a business profile
   *     description: Select an existing business profile and get a new token WITH businessProfileId
   *     tags: [Business Profiles]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - businessProfileId
   *             properties:
   *               businessProfileId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Business profile selected
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 businessProfile:
   *                   type: object
   *                 token:
   *                   type: string
   *                   description: New JWT token with businessProfileId
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Token already has businessProfileId OR user doesn't have access to this profile
   *       404:
   *         description: Business profile not found
   */
  router.post(
    "/select",
    authMiddleware.authenticate.bind(authMiddleware),
    requireNoBusinessProfile,
    selectController.handle.bind(selectController)
  );

  /**
   * @swagger
   * /api/business-profiles/switch:
   *   post:
   *     summary: Switch to another business profile
   *     description: Switch from current business profile to another one (requires token WITH businessProfileId)
   *     tags: [Business Profiles]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - businessProfileId
   *             properties:
   *               businessProfileId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Switched to new business profile
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 businessProfile:
   *                   type: object
   *                 token:
   *                   type: string
   *                   description: New JWT token with new businessProfileId
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: User doesn't have access to requested profile
   *       404:
   *         description: Business profile not found
   */
  router.post(
    "/switch",
    authMiddleware.authenticate.bind(authMiddleware),
    // Não usa requireNoBusinessProfile pois JÁ precisa ter selecionado uma
    switchController.handle.bind(switchController)
  );

  return router;
};
