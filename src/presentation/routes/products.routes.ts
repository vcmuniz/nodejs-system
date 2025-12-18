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
   *                 example: "Camiseta Premium"
   *               description:
   *                 type: string
   *                 example: "Camiseta de algodão 100%"
   *               sku:
   *                 type: string
   *                 example: "CAM-001"
   *               price:
   *                 type: number
   *                 example: 49.90
   *               categoryId:
   *                 type: string
   *                 example: "0dd5e484-3a5a-4ac7-b58c-363508a4be3f"
   *               type:
   *                 type: string
   *                 enum: [PHYSICAL, SERVICE, COURSE, DIGITAL, SUBSCRIPTION, EVENT]
   *                 default: PHYSICAL
   *                 example: "PHYSICAL"
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["https://example.com/img1.jpg"]
   *               metadata:
   *                 type: object
   *                 example: {}
   *               isActive:
   *                 type: boolean
   *                 default: true
   *                 example: true
   *               physicalData:
   *                 type: object
   *                 description: Required when type is PHYSICAL
   *                 properties:
   *                   stock:
   *                     type: number
   *                     example: 100
   *                   weight:
   *                     type: number
   *                     description: Weight in kg
   *                     example: 0.2
   *                   width:
   *                     type: number
   *                     description: Width in cm
   *                     example: 30
   *                   height:
   *                     type: number
   *                     description: Height in cm
   *                     example: 40
   *                   depth:
   *                     type: number
   *                     description: Depth in cm
   *                     example: 2
   *                   variations:
   *                     type: array
   *                     items:
   *                       type: object
   *                       properties:
   *                         name:
   *                           type: string
   *                         values:
   *                           type: array
   *                           items:
   *                             type: string
   *                     example: [{"name": "Cor", "values": ["Azul", "Preto"]}, {"name": "Tamanho", "values": ["P", "M", "G"]}]
   *               serviceData:
   *                 type: object
   *                 description: Required when type is SERVICE
   *                 properties:
   *                   duration:
   *                     type: number
   *                     description: Duration in minutes
   *                     example: 120
   *                   scheduling:
   *                     type: boolean
   *                     description: Requires scheduling (true/false)
   *                     example: true
   *                   location:
   *                     type: string
   *                     enum: [online, presencial, híbrido]
   *                     example: "online"
   *                   professionals:
   *                     type: array
   *                     items:
   *                       type: string
   *                     example: ["João Silva"]
   *               courseData:
   *                 type: object
   *                 description: Required when type is COURSE
   *                 properties:
   *                   platform:
   *                     type: string
   *                     enum: [hotmart, eduzz, own]
   *                     example: "own"
   *                   modules:
   *                     type: number
   *                     example: 10
   *                   lessons:
   *                     type: number
   *                     example: 45
   *                   durationHours:
   *                     type: number
   *                     example: 20
   *                   certificate:
   *                     type: boolean
   *                     example: true
   *                   accessDays:
   *                     type: number
   *                     example: 365
   *                   level:
   *                     type: string
   *                     enum: [iniciante, intermediario, avancado]
   *                     example: "avancado"
   *               digitalData:
   *                 type: object
   *                 description: Required when type is DIGITAL
   *                 properties:
   *                   fileUrl:
   *                     type: string
   *                     example: "https://cdn.example.com/file.pdf"
   *                   fileSize:
   *                     type: number
   *                     description: File size in KB
   *                     example: 15360
   *                   fileType:
   *                     type: string
   *                     example: "pdf"
   *                   downloadLimit:
   *                     type: number
   *                     example: 3
   *                   licenseType:
   *                     type: string
   *                     enum: [personal, commercial, educational]
   *                     example: "personal"
   *               subscriptionData:
   *                 type: object
   *                 description: Required when type is SUBSCRIPTION
   *                 properties:
   *                   billingCycle:
   *                     type: string
   *                     enum: [monthly, quarterly, yearly]
   *                     example: "monthly"
   *                   trialDays:
   *                     type: number
   *                     example: 7
   *                   maxUsers:
   *                     type: number
   *                     example: 5
   *                   benefits:
   *                     type: array
   *                     items:
   *                       type: string
   *                     example: ["Acesso ilimitado", "Suporte prioritário"]
   *               eventData:
   *                 type: object
   *                 description: Required when type is EVENT
   *                 properties:
   *                   eventDate:
   *                     type: string
   *                     format: date-time
   *                     example: "2024-12-31T20:00:00Z"
   *                   location:
   *                     type: string
   *                     example: "São Paulo Convention Center"
   *                   capacity:
   *                     type: number
   *                     example: 500
   *                   duration:
   *                     type: number
   *                     description: Duration in minutes
   *                     example: 180
   *     responses:
   *       201:
   *         description: Product created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       example: "983c7a3e-a79a-470c-a27a-c5e077b9947a"
   *                     name:
   *                       type: string
   *                       example: "Camiseta Premium"
   *                     sku:
   *                       type: string
   *                       example: "CAM-001"
   *                     price:
   *                       type: number
   *                       example: 49.90
   *                     type:
   *                       type: string
   *                       example: "PHYSICAL"
   *                     categoryId:
   *                       type: string
   *                       example: "0dd5e484-3a5a-4ac7-b58c-363508a4be3f"
   *                     userId:
   *                       type: string
   *                     businessProfileId:
   *                       type: string
   *                     description:
   *                       type: string
   *                     images:
   *                       type: array
   *                       items:
   *                         type: string
   *                     metadata:
   *                       type: object
   *                     isActive:
   *                       type: boolean
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
   *                     physicalData:
   *                       type: object
   *                       nullable: true
   *                     serviceData:
   *                       type: object
   *                       nullable: true
   *                     courseData:
   *                       type: object
   *                       nullable: true
   *                     digitalData:
   *                       type: object
   *                       nullable: true
   *                     subscriptionData:
   *                       type: object
   *                       nullable: true
   *                     eventData:
   *                       type: object
   *                       nullable: true
   *       400:
   *         description: Invalid request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Validation error"
   *       409:
   *         description: SKU already exists
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "SKU already exists"
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
   *     description: Returns a paginated list of products with optional filters by type, category, status and search term
   *     tags: [Products (New)]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [PHYSICAL, SERVICE, COURSE, DIGITAL, SUBSCRIPTION, EVENT]
   *         description: Filter by product type
   *         example: PHYSICAL
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: string
   *         description: Filter by category ID
   *         example: "0dd5e484-3a5a-4ac7-b58c-363508a4be3f"
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *         example: true
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search in product name, description or SKU
   *         example: "camiseta"
   *     responses:
   *       200:
   *         description: List of products
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 total:
   *                   type: number
   *                   example: 5
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       name:
   *                         type: string
   *                       sku:
   *                         type: string
   *                       price:
   *                         type: number
   *                       type:
   *                         type: string
   *                       categoryId:
   *                         type: string
   *                       isActive:
   *                         type: boolean
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: No businessProfileId in token
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
