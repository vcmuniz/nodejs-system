import { Request, Response } from "express";
import { IController } from "./IController";

export class GetAllOrderController implements IController {
    handle(req: Request, res: Response): void {
        res.status(200).json([]);
    }
}
