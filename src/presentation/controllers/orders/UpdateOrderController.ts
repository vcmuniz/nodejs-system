import { Response } from "express";
import { UpdateOrder } from "../../../application/order/UpdateOrder";
import { AuthenticatedRequest } from "../../middlewares/AuthMiddleware";
import { IController } from "../IController";

export class UpdateOrderController implements IController {

    constructor(private updateOrder: UpdateOrder) { }

    async handle(req: AuthenticatedRequest, res: Response) {
        const { id } = req.params;
        const { status, items, total } = req.body;

        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!id) {
            res.status(400).json({ error: 'Missing required field: id' });
            return;
        }

        const order = await this.updateOrder.execute({ id, status, items, total });

        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        res.status(200).json({
            message: 'Order updated successfully',
            order: order.getPublicData(),
        });
    }
}
