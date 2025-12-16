import { Request, Response } from "express";
import { IController } from "../IController";

/**
 * @swagger
 * /api/inventory/products:
 *   get:
 *     summary: Listar produtos
 *     tags:
 *       - Produtos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
export class ListProductController implements IController {
    constructor(private repository: any) {}

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id || "1";
            const products = await this.repository.findByUserId(userId, req.query.categoryId);
            res.json(products);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
