import { Request, Response } from "express";
import { IController } from "../IController";

/**
 * @swagger
 * /api/inventory/categories:
 *   get:
 *     summary: Listar categorias
 *     tags:
 *       - Categorias
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
export class ListCategoryController implements IController {
    constructor(private repository: any) {}

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id || "1";
            const categories = await this.repository.findByUserId(userId);
            res.json(categories);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
