import { Request, Response } from "express";
import { IController } from "../IController";

/**
 * @swagger
 * /api/inventory/categories/{id}:
 *   put:
 *     summary: Atualizar categoria
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Categoria atualizada
 */
export class UpdateCategoryController implements IController {
    constructor(private repository: any) {}

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const category = await this.repository.update(req.params.id, req.body);
            res.json(category);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
