import { Request, Response } from "express";
import { IController } from "../IController";

/**
 * @swagger
 * /api/inventory/quotes:
 *   post:
 *     summary: Criar orçamento
 *     tags:
 *       - Orçamentos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *               discount:
 *                 type: number
 *               tax:
 *                 type: number
 *     responses:
 *       201:
 *         description: Orçamento criado
 */
export class CreateQuoteController implements IController {
    constructor(private quoteRepository: any, private productRepository: any) {}

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id || "1";

            for (const item of req.body.items) {
                const product = await this.productRepository.findById(item.productId);
                if (!product) {
                    res.status(404).json({ error: `Product ${item.productId} not found` });
                    return;
                }
            }

            const quoteNumber = await this.quoteRepository.getNextQuoteNumber(userId);
            const subtotal = req.body.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
            const total = subtotal - (req.body.discount || 0) + (req.body.tax || 0);

            const quote = await this.quoteRepository.create(
                {
                    ...req.body,
                    userId,
                    quoteNumber,
                    subtotal,
                    total,
                },
                req.body.items
            );

            res.status(201).json(quote);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
