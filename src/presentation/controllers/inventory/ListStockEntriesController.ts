import { Request, Response } from "express";
import { IController } from "../IController";

/**
 * @swagger
 * /api/inventory/stock:
 *   get:
 *     summary: Listar entradas de estoque
 *     tags:
 *       - Estoque
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de entradas de estoque
 */
export class ListStockEntriesController implements IController {
    constructor(private repository: any) {}

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id || "1";
            const entries = req.query.productId
                ? await this.repository.findByProductId(req.query.productId)
                : await this.repository.findByUserId(userId);
            res.json(entries);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
