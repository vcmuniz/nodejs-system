// Routes - Products API
// Clean Architecture - Presentation Layer

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { makeAuthMiddleware } from '../factories/middlewares/makeAuthMiddleware';
import { requireBusinessProfile } from '../../middlewares/requireBusinessProfile';
import { ProductControllerFactory } from '../factories/products/ProductControllerFactory';

/**
 * @swagger
 * tags:
 *   name: Products (New)
 *   description: Product management with multiple types (PHYSICAL, SERVICE, COURSE, DIGITAL, SUBSCRIPTION, EVENT)
 */

export const makeProductRoutes = (prisma: PrismaClient) => {
  const router = Router();
  const authMiddleware = makeAuthMiddleware();

  // Initialize factory
  ProductControllerFactory.initialize(prisma);

  // Controllers
  const createController = ProductControllerFactory.makeCreateProductController();
  const getController = ProductControllerFactory.makeGetProductController();
  const listController = ProductControllerFactory.makeListProductsController();
  const updateController = ProductControllerFactory.makeUpdateProductController();
  const deleteController = ProductControllerFactory.makeDeleteProductController();

  /**
   * @swagger
   * /api/products:
   *   post:
   *     summary: Create a new product
   *     tags: [Products (New)]
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
   *               - sku
   *               - price
   *               - categoryId
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               sku:
   *                 type: string
   *               price:
   *                 type: number
   *               categoryId:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [PHYSICAL, SERVICE, COURSE, DIGITAL, SUBSCRIPTION, EVENT]
   *                 default: PHYSICAL
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *               metadata:
   *                 type: object
   *               isActive:
   *                 type: boolean
   *                 default: true
   *               physicalData:
   *                 type: object
   *                 properties:
   *                   stock:
   *                     type: number
   *                   weight:
   *                     type: number
   *                   width:
   *                     type: number
   *                   height:
   *                     type: number
   *                   depth:
   *                     type: number
   *                   variations:
   *                     type: array
   *               serviceData:
   *                 type: object
   *                 properties:
   *                   duration:
   *                     type: number
   *                   scheduling:
   *                     type: boolean
   *                   location:
   *                     type: string
   *               courseData:
   *                 type: object
   *                 properties:
   *                   platform:
   *                     type: string
   *                   modules:
   *                     type: number
   *                   lessons:
   *                     type: number
   *                   certificate:
   *                     type: boolean
   *               digitalData:
   *                 type: object
   *                 properties:
   *                   fileUrl:
   *                     type: string
   *                   fileType:
   *                     type: string
   *                   downloadLimit:
   *                     type: number
   *               subscriptionData:
   *                 type: object
   *                 properties:
   *                   billingCycle:
   *                     type: string
   *                   trialDays:
   *                     type: number
   *               eventData:
   *                 type: object
   *                 properties:
   *                   eventDate:
   *                     type: string
   *                     format: date-time
   *                   location:
   *                     type: string
   *                   capacity:
   *                     type: number
   *     responses:
   *       201:
   *         description: Product created successfully
   *       400:
   *         description: Invalid request
   *       409:
   *         description: SKU already exists
   */
  router.post(
    '/',
    authMiddleware.authenticate(),
    requireBusinessProfile,
    createController.handle.bind(createController)
  );

  /**
   * @swagger
   * /api/products:
   *   get:
   *     summary: List all products
   *     tags: [Products (New)]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [PHYSICAL, SERVICE, COURSE, DIGITAL, SUBSCRIPTION, EVENT]
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: string
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of products
   */
  router.get(
    '/',
    authMiddleware.authenticate(),
    requireBusinessProfile,
    listController.handle.bind(listController)
  );

  /**
   * @swagger
   * /api/products/{id}:
   *   get:
   *     summary: Get product by ID
   *     tags: [Products (New)]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: includeTypeData
   *         schema:
   *           type: boolean
   *           default: false
   *     responses:
   *       200:
   *         description: Product details
   *       404:
   *         description: Product not found
   */
  router.get(
    '/:id',
    authMiddleware.authenticate(),
    requireBusinessProfile,
    getController.handle.bind(getController)
  );

  /**
   * @swagger
   * /api/products/{id}:
   *   put:
   *     summary: Update product
   *     tags: [Products (New)]
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
   *               description:
   *                 type: string
   *               price:
   *                 type: number
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *               isActive:
   *                 type: boolean
   *               physicalData:
   *                 type: object
   *               serviceData:
   *                 type: object
   *               courseData:
   *                 type: object
   *               digitalData:
   *                 type: object
   *               subscriptionData:
   *                 type: object
   *               eventData:
   *                 type: object
   *     responses:
   *       200:
   *         description: Product updated successfully
   *       404:
   *         description: Product not found
   */
  router.put(
    '/:id',
    authMiddleware.authenticate(),
    requireBusinessProfile,
    updateController.handle.bind(updateController)
  );

  /**
   * @swagger
   * /api/products/{id}:
   *   delete:
   *     summary: Delete product
   *     tags: [Products (New)]
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
   *         description: Product deleted successfully
   *       404:
   *         description: Product not found
   */
  router.delete(
    '/:id',
    authMiddleware.authenticate(),
    requireBusinessProfile,
    deleteController.handle.bind(deleteController)
  );

  return router;
};
