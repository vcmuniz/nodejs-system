import { Router } from "express";
import { makeStockEntryRepository } from "../../infra/database/factories/makeStockEntryRepository";
import { makeProductRepository } from "../../infra/database/factories/makeProductRepository";
import { CreateStockEntryController } from "../controllers/inventory/CreateStockEntryController";
import { ListStockEntriesController } from "../controllers/inventory/ListStockEntriesController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireBusinessProfile } from "../../middlewares/requireBusinessProfile";

/**
 * @swagger
 * tags:
 *   name: Stock
 *   description: Stock entry management (requires businessProfileId in token)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StockEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         productId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [in, out, adjustment]
 *         quantity:
 *           type: integer
 *         reason:
 *           type: string
 *         businessProfileId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

export function makeStockRoutes() {
    const router = Router();
    const authMiddleware = makeAuthMiddleware();
    const stockRepository = makeStockEntryRepository();
    const productRepository = makeProductRepository();

    /**
     * @swagger
     * /api/stocks:
     *   post:
     *     summary: Create a new stock entry
     *     description: Add, remove or adjust stock for a product
     *     tags: [Stock]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - productId
     *               - type
     *               - quantity
     *             properties:
     *               productId:
     *                 type: string
     *               type:
     *                 type: string
     *                 enum: [in, out, adjustment]
     *               quantity:
     *                 type: integer
     *               reason:
     *                 type: string
     *     responses:
     *       201:
     *         description: Stock entry created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/StockEntry'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.post("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new CreateStockEntryController(stockRepository, productRepository).handle(req, res));
    
    /**
     * @swagger
     * /api/stocks:
     *   get:
     *     summary: List all stock entries
     *     tags: [Stock]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: productId
     *         schema:
     *           type: string
     *       - in: query
     *         name: type
     *         schema:
     *           type: string
     *           enum: [in, out, adjustment]
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *     responses:
     *       200:
     *         description: List of stock entries
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/StockEntry'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.get("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new ListStockEntriesController(stockRepository).handle(req, res));

    return router;
}
