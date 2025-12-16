import { Request, Response } from "express";
import { IController } from "../IController";

/**
 * @swagger
 * /api/inventory/quotes/{id}:
 *   delete:
 *     summary: Deletar orçamento
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
 *     responses:
 *       204:
 *         description: Orçamento deletado
 */
export class DeleteQuoteController implements IController {
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
