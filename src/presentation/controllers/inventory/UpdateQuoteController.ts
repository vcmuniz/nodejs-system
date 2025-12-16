import { Request, Response } from "express";
import { IController } from "../IController";

/**
 * @swagger
 * /api/inventory/quotes/{id}:
 *   put:
 *     summary: Atualizar orçamento
 *     tags:
 *       - Orçamentos
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
 *         description: Orçamento atualizado
 */
export class UpdateQuoteController implements IController {
    constructor(private repository: any) {}

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const quote = req.body.status
                ? await this.repository.updateStatus(req.params.id, req.body.status)
                : await this.repository.update(req.params.id, req.body);
            res.json(quote);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
