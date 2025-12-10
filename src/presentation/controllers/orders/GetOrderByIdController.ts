import { Request, Response } from "express";
import { IController } from "../IController";
import { GetOrderById } from "../../../usercase/order/GetOrderById";

export class GetOrderByIdController implements IController {

    constructor(private getOrderById: GetOrderById) { }

    async handle(req: Request, res: Response) {
        const { id } = req.params;

        const userId = "1"; // Temporarily hardcoded for testing

        if (!id) {
            res.status(400).json({ error: 'Missing required field: id' });
            return;
        }

        const order = await this.getOrderById.execute(id);

        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        res.status(200).json(order.getPublicData());
    }
}
