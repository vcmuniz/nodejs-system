import { Request, Response } from "express";
import { IController } from "../IController";

/**
 * @swagger
 * /api/inventory/quotes:
 *   get:
 *     summary: Listar orçamentos
 *     tags:
 *       - Orçamentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de orçamentos
 */
export class ListQuotesController implements IController {
    constructor(private repository: any) {}

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id || "1";
            const quotes = await this.repository.findByUserId(userId, req.query.status);
            res.json(quotes);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
