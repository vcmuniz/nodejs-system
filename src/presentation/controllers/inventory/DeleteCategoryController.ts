import { Request, Response } from "express";
import { IController } from "../IController";

/**
 * @swagger
 * /api/inventory/categories/{id}:
 *   delete:
 *     summary: Deletar categoria
 *     tags:
 *       - Categorias
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
 *         description: Categoria deletada
 */
export class DeleteCategoryController implements IController {
    constructor(private repository: any) {}

    async handle(req: Request, res: Response): Promise<void> {
        try {
            await this.repository.delete(req.params.id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
