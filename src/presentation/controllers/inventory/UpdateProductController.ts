import { Request, Response } from "express";
import { IController } from "../IController";

/**
 * @swagger
 * /api/inventory/products/{id}:
 *   put:
 *     summary: Atualizar produto
 *     tags:
 *       - Produtos
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
 *         description: Produto atualizado
 */
export class UpdateProductController implements IController {
    constructor(private repository: any) {}

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const product = await this.repository.update(req.params.id, req.body);
            res.json(product);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
