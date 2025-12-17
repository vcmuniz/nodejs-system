import { Router } from "express";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { makeGetAllOrderController } from "../factories/controllers/makeGetAllOrderController";
import { makeCreateOrderController } from "../factories/controllers/makeCreateOrderController";
import { makeAuthMiddleware } from "../factories/middlewares/makeAuthMiddleware";
import { requireBusinessProfile } from "../../middlewares/requireBusinessProfile";

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management (requires businessProfileId in token)
 */

export function makeOrderRoutes(orderRepository: IOrderRepository) {
    const router = Router();

    const authMiddleware = makeAuthMiddleware();

    /**
     * @swagger
     * /api/orders:
     *   get:
     *     summary: List all orders
     *     tags: [Orders]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [pending, confirmed, shipped, delivered, cancelled]
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
     *     responses:
     *       200:
     *         description: List of orders
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Order'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.get("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => makeGetAllOrderController(orderRepository).handle(req, res));
    
    /**
     * @swagger
     * /api/orders:
     *   post:
     *     summary: Create a new order
     *     tags: [Orders]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - items
     *             properties:
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
     *               status:
     *                 type: string
     *                 enum: [pending, confirmed, shipped, delivered, cancelled]
     *                 default: pending
     *     responses:
     *       201:
     *         description: Order created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Order'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: No businessProfileId in token
     */
    router.post("/", authMiddleware.authenticate(), requireBusinessProfile, (req, res) => makeCreateOrderController(orderRepository).handle(req, res));

    return router;
}