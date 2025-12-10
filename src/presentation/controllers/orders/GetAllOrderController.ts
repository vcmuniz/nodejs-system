import { Request, Response } from "express";
import { IController } from "./IController";
import { GetAllOrder } from "../../../usercase/order/GetAllOrder";

export class GetAllOrderController implements IController {
    constructor(private getAllOrder: GetAllOrder) { }

    async handle(req: Request, res: Response): Promise<void> {
        console.log("GetAllOrderController handle called", this.getAllOrder);
        const orders = await this.getAllOrder.execute();
        res.status(200).json(orders);
    }
}
