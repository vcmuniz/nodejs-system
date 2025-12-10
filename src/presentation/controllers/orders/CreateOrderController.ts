import { Request, Response } from "express";
import { IController } from "../IController";
import { CreateOrder } from "../../../usercase/order/CreateOrder";

export class CreateOrderController implements IController {

    constructor(private createOrder: CreateOrder) { }

    async handle(req: Request, res: Response) {
        const { items } = req.body;

        const userId = "1"; // Temporarily hardcoded for testing

        if (!items) {
            res.status(400).json({ error: 'Missing required fields: items' });
            return;
        }

        const order = await this.createOrder.execute({ userId: userId, items })

        res.status(201).json({
            message: 'Order created successfully',
            order: order.getPublicData(),
        });
    }
}
