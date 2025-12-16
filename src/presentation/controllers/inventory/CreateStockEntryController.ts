import { Request, Response } from "express";
import { IController } from "../IController";

/**
 * @swagger
 * /api/inventory/stock:
 *   post:
 *     summary: Criar entrada de estoque
 *     tags:
 *       - Estoque
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Entrada de estoque criada
 */
export class CreateStockEntryController implements IController {
    constructor(private stockRepository: any, private productRepository: any) {}

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id || "1";
            const product = await this.productRepository.findById(req.body.productId);
            if (!product) {
                res.status(404).json({ error: "Product not found" });
                return;
            }

            const entry = await this.stockRepository.create({ ...req.body, userId });
            const newQty = product.quantity + req.body.quantity;
            await this.productRepository.updateQuantity(req.body.productId, newQty);

            res.status(201).json(entry);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
