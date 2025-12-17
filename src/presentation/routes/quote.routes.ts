import { Router } from "express";
import { makeQuoteRepository } from "../../infra/database/factories/makeQuoteRepository";
import { makeProductRepository } from "../../infra/database/factories/makeProductRepository";
import { CreateQuoteController } from "../controllers/inventory/CreateQuoteController";
import { ListQuotesController } from "../controllers/inventory/ListQuotesController";
import { UpdateQuoteController } from "../controllers/inventory/UpdateQuoteController";
import { DeleteQuoteController } from "../controllers/inventory/DeleteQuoteController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireBusinessProfile } from "../../middlewares/requireBusinessProfile";

/**
 * @swagger
 * tags:
 *   name: Quotes
 *   description: Quote/Budget management (requires businessProfileId in token)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     QuoteItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         quantity:
 *           type: integer
 *         price:
 *           type: number
 *     Quote:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         clientName:
 *           type: string
 *         clientEmail:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuoteItem'
 *         total:
 *           type: number
 *         status:
 *           type: string
 *           enum: [draft, sent, accepted, rejected]
 *         businessProfileId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

export function makeQuoteRoutes() {
    const router = Router();
    const authMiddleware = makeAuthMiddleware();
    const quoteRepository = makeQuoteRepository();
    const productRepository = makeProductRepository();

    /**
     * @swagger
     * /api/quotes:
     *   post:
     *     summary: Create a new quote
     *     tags: [Quotes]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - clientName
     *               - items
     *             properties:
     *               clientName:
     *                 type: string
     *               clientEmail:
     *                 type: string
     *               items:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     productId:
     *                       type: string
     *                     quantity:
     *                       type: integer
     *                     price:
     *                       type: number
     *               notes:
     *                 type: string
     *     responses:
     *       201:
     *         description: Quote created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Quote'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.post("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new CreateQuoteController(quoteRepository, productRepository).handle(req, res));
    
    /**
     * @swagger
     * /api/quotes:
     *   get:
     *     summary: List all quotes
     *     tags: [Quotes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [draft, sent, accepted, rejected]
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: List of quotes
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Quote'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.get("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new ListQuotesController(quoteRepository).handle(req, res));
    
    /**
     * @swagger
     * /api/quotes/{id}:
     *   put:
     *     summary: Update a quote
     *     tags: [Quotes]
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
     *               clientName:
     *                 type: string
     *               clientEmail:
     *                 type: string
     *               status:
     *                 type: string
     *                 enum: [draft, sent, accepted, rejected]
     *               items:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     productId:
     *                       type: string
     *                     quantity:
     *                       type: integer
     *                     price:
     *                       type: number
     *     responses:
     *       200:
     *         description: Quote updated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Quote'
     *       404:
     *         description: Quote not found
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.put("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new UpdateQuoteController(quoteRepository).handle(req, res));
    
    /**
     * @swagger
     * /api/quotes/{id}:
     *   delete:
     *     summary: Delete a quote
     *     tags: [Quotes]
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
     *         description: Quote deleted
     *       404:
     *         description: Quote not found
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.delete("/:id", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => new DeleteQuoteController(quoteRepository).handle(req, res));

    return router;
}
