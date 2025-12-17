import { Router } from "express";
import { makeProductRepository } from "../../infra/database/factories/makeProductRepository";
import { CreateProductController } from "../controllers/inventory/CreateProductController";
import { ListProductController } from "../controllers/inventory/ListProductController";
import { GetProductController } from "../controllers/inventory/GetProductController";
import { UpdateProductController } from "../controllers/inventory/UpdateProductController";
import { DeleteProductController } from "../controllers/inventory/DeleteProductController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireBusinessProfile } from "../../middlewares/requireBusinessProfile";

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management (requires businessProfileId in token)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         sku:
 *           type: string
 *         categoryId:
 *           type: string
 *         businessProfileId:
 *           type: string
 *         stockQuantity:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

export function makeProductRoutes() {
    const router = Router();
    const authMiddleware = makeAuthMiddleware();
    const repository = makeProductRepository();

    /**
     * @swagger
     * /api/products:
     *   post:
     *     summary: Create a new product
     *     tags: [Products]
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
     *               - price
     *             properties:
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *               price:
     *                 type: number
     *               sku:
     *                 type: string
     *               categoryId:
     *                 type: string
     *               stockQuantity:
     *                 type: integer
     *               isActive:
     *                 type: boolean
     *     responses:
     *       201:
     *         description: Product created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Product'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.post("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new CreateProductController(repository).handle(req, res));
    
    /**
     * @swagger
     * /api/products:
     *   get:
     *     summary: List all products
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: categoryId
     *         schema:
     *           type: string
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *       - in: query
     *         name: isActive
     *         schema:
     *           type: boolean
     *     responses:
     *       200:
     *         description: List of products
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Product'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.get("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new ListProductController(repository).handle(req, res));
    
    /**
     * @swagger
     * /api/products/{id}:
     *   get:
     *     summary: Get a specific product by ID
     *     tags: [Products]
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
     *         description: Product details
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Product'
     *       404:
     *         description: Product not found
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.get("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new GetProductController(repository).handle(req, res));
    
    /**
     * @swagger
     * /api/products/{id}:
     *   put:
     *     summary: Update a product
     *     tags: [Products]
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
     *               sku:
     *                 type: string
     *               categoryId:
     *                 type: string
     *               stockQuantity:
     *                 type: integer
     *               isActive:
     *                 type: boolean
     *     responses:
     *       200:
     *         description: Product updated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Product'
     *       404:
     *         description: Product not found
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.put("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new UpdateProductController(repository).handle(req, res));
    
    /**
     * @swagger
     * /api/products/{id}:
     *   delete:
     *     summary: Delete a product
     *     tags: [Products]
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
     *         description: Product deleted
     *       404:
     *         description: Product not found
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.delete("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new DeleteProductController(repository).handle(req, res));

    return router;
}
