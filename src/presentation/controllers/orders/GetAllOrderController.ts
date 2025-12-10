import { Request, Response } from "express";
import { IController } from "./IController";

export class GetAllOrderController implements IController {
    handle(req: Request, res: Response): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
